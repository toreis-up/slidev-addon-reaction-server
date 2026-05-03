<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { RoomConfigurationItem } from '~/composables/useRoomApi'

const route = useRoute()

const roomId = computed(() => normalizeRoomId(route.params.roomid))
const isRoomIdValid = computed(() => isValidRoomId(roomId.value))

const {
  error,
  status,
  refresh,
  configuration
} = await useRoomConfiguration(roomId)

const { sendReaction } = useRoomReactionSender(roomId)

if (isRoomIdValid.value) {
  await refresh()
}

watch(roomId, async () => {
  if (isRoomIdValid.value) {
    await refresh()
  }
})

const errorMessage = computed(() => {
  if (!error.value) {
    return ''
  }

  return error.value.statusMessage || error.value.message || 'Failed to load room.'
})

async function onReactionClick(reaction: RoomConfigurationItem) {
  await sendReaction(reaction)
}
</script>

<template>
  <UContainer class="py-6 sm:py-10">
    <div class="mx-auto flex w-full max-w-xxl flex-col gap-6">
      <h1 class="break-all text-center text-2xl tracking-normal text-highlighted sm:text-3xl">
        Room ID: {{ roomId }}
      </h1>

      <UAlert v-if="!isRoomIdValid" color="error" variant="subtle" icon="i-lucide-circle-alert" title="Invalid Room ID"
        description="Room ID must be an 8-digit number." />

      <template v-else>
        <div v-if="status === 'pending'" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <USkeleton v-for="index in 6" :key="index" class="h-28 w-full" />
        </div>

        <UAlert v-else-if="error" color="error" variant="subtle" icon="i-lucide-wifi-off"
          title="Room could not be loaded" :description="errorMessage" />

        <UAlert v-else-if="configuration.length === 0" color="neutral" variant="subtle" icon="i-lucide-inbox"
          title="No reactions configured" description="The room response did not include any configuration items." />

        <!-- FIXME: the style is ruined... XD -->
        <div v-else :class="`grid h-[calc(100dvh-var(--ui-header-height)-1.5rem-6rem)]
          lg:h-[calc((100dvh-var(--ui-header-height)-1.5rem-6rem)/2)] grid-cols-1 gap-3
          lg:grid-cols-${Math.min(configuration.length, 3)} xl:grid-cols-${Math.min(configuration.length, 5)}`">

          <UButton v-for="reaction in configuration" :key="`${reaction.name}:${reaction.emojiName}`" color="neutral"
            variant="subtle" block class="min-h-28 justify-center" :aria-label="reaction.name"
            @click="onReactionClick(reaction)">
            <Icon :icon="reaction.emojiName" class="size-12 text-highlighted sm:size-14" />
          </UButton>
        </div>
      </template>
    </div>
  </UContainer>
</template>
