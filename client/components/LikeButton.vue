<!-- (c) Santosh Sahoo -->
<template>
  <button
    class="btn-push inline-flex items-center gap-1"
    title="Vote Up"
    @click.stop="$emit('vote', current == 1 ? 0 : 1)"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      :class="current == 1 ? 'likeButton_active' : ''"
    >
      <path
        d="m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z"
      />
    </svg>
    <span>{{ abbrNumber(votes) }}</span>
  </button>
</template>
<script setup>
import { abbrNumber } from "../lib";

defineEmits(["vote"]);

defineProps({
  votes: Number,
  current: Number,
});
</script>

<style>
.likeButton_active {
  animation: _like 0.5s 1;
  fill: red;
  stroke: none;
}
@keyframes _like {
  0% {
    transform: scale(1);
  }
  90% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.1);
  }
}
</style>
