<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RoomFormState } from '~/composables/useRoomId'

const props = defineProps<{
  initialRoomId?: string
}>()

const { state, validate } = useRoomIdForm(props.initialRoomId)
const roomError = ref('')
const isCheckingRoom = ref(false)

watch(() => props.initialRoomId, (roomId) => {
  state.roomId = getRoomIdPinValue(roomId ?? '')
})

async function onSubmit(event: FormSubmitEvent<RoomFormState>) {
  const nextRoomId = getRoomIdDigits(event.data.roomId)

  roomError.value = ''
  isCheckingRoom.value = true

  try {
    await fetchRoomById(nextRoomId)
    await navigateTo(`/room/${nextRoomId}`)
  } catch (error) {
    roomError.value = getFetchErrorStatusCode(error) === 404
      ? 'Room was not found.'
      : 'Room could not be loaded.'
  } finally {
    isCheckingRoom.value = false
  }
}
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="space-y-6"
    @submit="onSubmit"
  >
    <UAlert
      v-if="roomError"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Room check failed"
      :description="roomError"
    />

    <UFormField
      label="Room ID"
      name="roomId"
      required
    >
      <UPinInput
        v-model="state.roomId"
        name="roomId"
        :length="8"
        type="number"
        otp
        autofocus
        size="xl"
        class="flex w-full gap-1 [&_[data-slot=base]:nth-child(4)]:mr-3 sm:[&_[data-slot=base]:nth-child(4)]:mr-4"
        :ui="{ base: 'h-11 min-w-0 flex-1 text-base sm:h-12 sm:text-lg' }"
      />
    </UFormField>

    <UButton
      type="submit"
      label="Open room"
      trailing-icon="i-lucide-arrow-right"
      size="xl"
      block
      :loading="isCheckingRoom"
    />
  </UForm>
</template>
