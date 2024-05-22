<template>
  <router-link
    :to="`/${u.username}`"
    class="flex gap-2 items-center py-1 group hover:bg-auto rounded px-2"
    :class="{ 'bg-auto': $route.params.username == u.username }"
  >
    <div class="w-8 h-8 overflow-hidden rounded-full">
      <Avatar :name="u.name" :photo="u.photo_url" class="avatar" />
    </div>
    <div class="flex-1 group">
      <div class="leading-4 font-bold group-hover:underline">{{ u.name }}</div>
      <span class="tip text-xs">@{{ u.username }}</span>
    </div>
  </router-link>
</template>

<script setup>
import Avatar from "./Avatar.vue";
defineProps({ u: Object });
</script>
