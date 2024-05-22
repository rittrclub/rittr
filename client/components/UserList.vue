<template>
  <div v-if="!users">
    <LoadingUser v-for="i in 3" :key="i" />
  </div>
  <div v-else>
    <UserItem v-for="u in users" :key="u.id" :u="u" />
  </div>
</template>
<script setup>
import LoadingUser from "./LoadingUser.vue";
import UserItem from "./UserItem.vue";
defineProps({ users: Array });
</script>
