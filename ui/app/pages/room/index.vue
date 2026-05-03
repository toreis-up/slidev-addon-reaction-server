<template>
  <UContainer class="flex min-h-[calc(100vh-9rem)] items-center justify-center py-6 sm:py-12">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-medium text-primary">
            Reaction for Slidev
          </p>
          <h1 class="text-2xl font-semibold tracking-normal text-highlighted">
            Join room
          </h1>
        </div>
      </template>

      <RoomJoinForm />
    </UCard>
  </UContainer>
</template>
