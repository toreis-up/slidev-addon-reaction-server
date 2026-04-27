import { DurableObject } from "cloudflare:workers";
import { Env } from '.'
import { ReactionMap } from "./type";

export class ReactionRoom extends DurableObject<Env> {
  initialized: boolean
  roomId: string

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)

    this.initialized = false;
    this.roomId = ""
  }

  async fetch(req: Request) {
    if (req.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    this.ctx.acceptWebSocket(server)

    return new Response(
      null, {
      status: 101,
      webSocket: client
    }
    )
  }

  public async initializeRoom(id: string, configuration: ReactionMap) {
    this.initialized = true
    this.roomId = id
    await this.touchRoom()
    await this.ctx.storage.put('roomConfig', configuration)
  }

  public getRoomId() {
    return this.roomId
  }

  public async isInitialized() {
    const configurationInitialized = Boolean(await this.ctx.storage.get('roomConfig'))
    console.debug(await this.ctx.storage.get('roomConfig'))
    return this.initialized || configurationInitialized
  }

  public async getRoomConfiguration() {
    return await this.ctx.storage.get('roomConfig')
  }

  public async onReaction(reactionName: string) {
    await this.touchRoom()
    const webSockets = this.ctx.getWebSockets()
    const payload = { reactionName }
    for (const webSocket of webSockets) {
      try {
        webSocket.send(JSON.stringify(payload))
      } catch (e) {
        continue
      }
    }
  }

  async touchRoom() {
    const expiresAt = Date.now() + 1000 * 60 * 60 * 2 // 2 hrs.

    await this.ctx.storage.put('expiresAt', expiresAt)
    await this.ctx.storage.setAlarm(expiresAt)
  }

  async alarm() {
    const expiresAt = await this.ctx.storage.get<number>('expiresAt')
    const now = Date.now()

    if (!expiresAt || expiresAt > now) {
      if (expiresAt) await this.ctx.storage.setAlarm(expiresAt)
      return
    }

    await this.ctx.storage.deleteAll()
  }
}
