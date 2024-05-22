<template>
  <div v-if="!auth.id" class="empty-state">
    <p>Login or Signup to access your bookmarks</p>
    <button class="btn btn-primary" @click="auth.checkLogin()">Login</button>
  </div>
  <div v-else>
    <div class="flex items-start border-b">
      <router-link to="/" class="p-4">
        <svg class="icon"><use xlink:href="#icon-arrow-left"></use></svg>
      </router-link>
      <div class="p-4 flex-1">
        <h3 class="h3">Bookmarks</h3>
      </div>
      <div class="p-4"></div>
    </div>
    <div>
      <div v-if="!data" class="p-4">
        <LoadingRow v-for="i in 3" :key="i" />
      </div>
      <div v-else-if="!data.length" class="p-4 empty-state">
        <p>Nothing here..</p>
      </div>
      <PostItem
        v-for="p in data"
        :key="p.id"
        tabindex="0"
        :post="p"
        class="cursor-pointer border-b"
        @click="$router.push(p.sublink)"
      />
    </div>
  </div>
</template>

<script setup>
import useSWRV from "swrv";
import { $my } from "./helpers/api";
import LoadingRow from "./components/LoadingRow.vue";
import PostItem from "./components/PostItem.vue";
import { useStore } from "./store";

const auth = useStore();
const { data } = useSWRV("/bookmarks", () => $my.getBookmarks());
</script>
