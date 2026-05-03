<script setup>
import { Icon } from '@iconify/vue'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Slideaction'
const description = 'Implement reactions to Slidev.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})
</script>

<template>
  <UApp>
    <UHeader :toggle="false">
      <template #left>
        <NuxtLink to="/">
          <div class="flex justify-center">
            <Icon icon="twemoji:clapping-hands" class="size-8" />
            <div class="text-xl my-auto ml-2 font-bold">
              Slideaction
            </div>
          </div>
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <UButton to="https://github.com/toreis-up/slidev-addon-reaction" target="_blank" icon="i-simple-icons-github"
          aria-label="GitHub" color="neutral" variant="ghost" />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

  </UApp>
</template>
