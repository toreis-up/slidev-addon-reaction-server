import type { FormError } from '@nuxt/ui'

export type RoomFormState = {
  roomId: number[]
}

export const ROOM_ID_PATTERN = /^\d{8}$/

export function normalizeRoomId(value: unknown): string {
  return String(value ?? '')
}

export function getRoomIdDigits(value: string | number[]): string {
  if (Array.isArray(value)) {
    return value.join('')
  }

  return value.replace(/\D/g, '').slice(0, 8)
}

export function getRoomIdPinValue(value: string | number[]): number[] {
  return Array.from(getRoomIdDigits(value), Number)
}

export function formatRoomId(value: string | number[]): string {
  const digits = getRoomIdDigits(value)

  if (digits.length <= 4) {
    return digits
  }

  return `${digits.slice(0, 4)} ${digits.slice(4)}`
}

export function isValidRoomId(roomId: string): boolean {
  return ROOM_ID_PATTERN.test(roomId)
}

export function validateRoomFormState(state: RoomFormState): FormError[] {
  const value = getRoomIdDigits(state.roomId)

  if (!value) {
    return [{ name: 'roomId', message: 'Room ID is required.' }]
  }

  if (!/^\d+$/.test(value)) {
    return [{ name: 'roomId', message: 'Room ID must contain digits only.' }]
  }

  if (!isValidRoomId(value)) {
    return [{ name: 'roomId', message: 'Room ID must be 8 digits.' }]
  }

  return []
}

export function useRoomIdForm(initialRoomId: string | number[] = '') {
  const state = reactive<RoomFormState>({
    roomId: getRoomIdPinValue(initialRoomId)
  })

  const roomId = computed(() => getRoomIdDigits(state.roomId))
  const canSubmit = computed(() => isValidRoomId(roomId.value))

  return {
    state,
    roomId,
    canSubmit,
    validate: validateRoomFormState
  }
}
