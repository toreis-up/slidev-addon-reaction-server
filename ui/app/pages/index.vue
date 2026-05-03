<script setup lang="ts">
const route = useRoute()

const initialRoomId = computed(() => {
  const roomId = route.query.roomId

  return typeof roomId === 'string' && isValidRoomId(roomId)
    ? roomId
    : undefined
})
</script>

<template>
  <div>
    <UPageHero
      title="Response to you."
      description="Slideaction is the slidev addon to see listener reaction."
      class="min-h-[calc(100vh-9rem)]"
    >
      <template #body>
        <UCard class="ring-primary-300 dark:bg-primary-300/10 dark:ring-primary-700">
          <p class="pb-3 text-xl font-bold">
            You have the Room ID?
          </p>
          <div class="mx-auto w-full max-w-md">
            <RoomJoinForm :initial-room-id="initialRoomId" />
          </div>
        </UCard>
      </template>
    </UPageHero>

    <UPageSection
      title="Want to use Slideaction?"
      description="I am working hard to release Slideaction. Stay tuned!"
    />
  </div>
</template>
