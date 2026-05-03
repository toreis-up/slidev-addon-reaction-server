import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ReactionRoom } from './ReactionRoom'
import { ReactionMap } from './type'


type Bindings = {
  REACTION_ROOM: DurableObjectNamespace<ReactionRoom>
}

export type Env = {
  Bindings: Bindings
}

const app = new Hono<Env>()

const MAX_TRY = 10;

function getRandomRoomId() {
  return String(((Math.random() * 100_000_000) | 0) % 100_000_000).padStart(8, '0')
}

async function createNewRoom(ns: DurableObjectNamespace<ReactionRoom>, configuration: ReactionMap) {
  if (!configuration.length) return null
  for (let i = 0; i < MAX_TRY; i++) {
    const newCandidateRoomId = getRandomRoomId()
    console.debug(newCandidateRoomId)
    const candidateRoom = ns.getByName(newCandidateRoomId)
    console.debug(await candidateRoom.isInitialized())
    if (!await candidateRoom.isInitialized()) {
      const newRoomId = newCandidateRoomId
      const newRoom = ns.getByName(newRoomId)
      await newRoom.initializeRoom(newRoomId, configuration)
      return newRoom
    }
  }

  return null;
}

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/rooms', async (c) => {
  const ns = c.env.REACTION_ROOM
  console.debug(await c.req.json())
  const newRoom = await createNewRoom(ns, (await c.req.json<{ configuration: ReactionMap }>()).configuration)

  if (!newRoom) {
    return c.json({ reason: 'Max room creation retry exceeded.' }, 500)
  }

  const newRoomId = await newRoom.getRoomId()
  const newRoomReactions = await newRoom.getRoomConfiguration()
  return c.json({
    ok: true,
    room: {
      roomId: newRoomId,
      configuration: newRoomReactions
    }
  })
})

app.get('/api/rooms/:id', async (c) => {
  const ns = c.env.REACTION_ROOM
  const room = ns.getByName(c.req.param("id"))

  if (!(await room.isInitialized())) {
    return c.json({ reason: 'The room not found.' }, 404)
  }

  return c.json({
    configuration: await room.getRoomConfiguration()
  })
})

app.get('/api/rooms/:id/ws', async (c) => {
  const ns = c.env.REACTION_ROOM
  const room = ns.getByName(c.req.param("id"))

  return await room.fetch(c.req.raw)
})

app.post('/api/rooms/:id', async (c) => {
  const ns = c.env.REACTION_ROOM
  const room = ns.getByName(c.req.param("id"))
  const reaction = await c.req.json<{ reactionName: string }>()

  console.debug(await room.isInitialized())

  await room.onReaction(reaction.reactionName)
  return c.json({
    ok: true
  })
})

export default app
export { ReactionRoom } from './ReactionRoom'
