import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export type RoomConfigurationItem = {
  name: string
  emojiName: string
}

export type RoomResponse = {
  configuration: RoomConfigurationItem[]
}

export type SendReactionResult
  = | { ok: true }
    | { ok: false, message: string }

const DEFAULT_ROOMS_API_BASE = 'http://localhost:8787/api'

function getFetchErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Failed to send reaction.'
}

export function getFetchErrorStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode
  }

  if ('status' in error && typeof error.status === 'number') {
    return error.status
  }

  return undefined
}

export function useRoomsApiBase(): string {
  const config = useRuntimeConfig()

  return String(config.public.roomsApiBase || DEFAULT_ROOMS_API_BASE)
}

export function buildRoomApiPath(roomId: string): string {
  return `/rooms/${roomId}`
}

export function buildRoomApiUrl(apiBase: string, roomId: string): string {
  return `${apiBase.replace(/\/$/, '')}${buildRoomApiPath(roomId)}`
}

export async function fetchRoomById(roomId: string): Promise<RoomResponse> {
  return await $fetch<RoomResponse>(buildRoomApiPath(roomId), {
    baseURL: useRoomsApiBase()
  })
}

export async function useRoomConfiguration(roomId: MaybeRefOrGetter<string>) {
  const roomsApiBase = useRoomsApiBase()
  const roomFetch = await useFetch<RoomResponse>(() => buildRoomApiPath(toValue(roomId)), {
    baseURL: roomsApiBase,
    immediate: false,
    server: true,
    watch: false
  })

  const apiUrl = computed(() => buildRoomApiUrl(roomsApiBase, toValue(roomId)))
  const configuration = computed(() => {
    if (!Array.isArray(roomFetch.data.value?.configuration)) {
      return []
    }

    return roomFetch.data.value.configuration
  })

  return {
    ...roomFetch,
    apiUrl,
    configuration,
    roomsApiBase
  }
}

export function useRoomReactionSender(roomId: MaybeRefOrGetter<string>) {
  const roomsApiBase = useRoomsApiBase()

  async function sendReaction(reaction: RoomConfigurationItem): Promise<SendReactionResult> {
    try {
      await $fetch(buildRoomApiPath(toValue(roomId)), {
        baseURL: roomsApiBase,
        method: 'POST',
        body: {
          reactionName: reaction.name
        }
      })

      return { ok: true }
    } catch (error) {
      const message = getFetchErrorMessage(error)

      return { ok: false, message }
    }
  }

  return {
    sendReaction
  }
}
