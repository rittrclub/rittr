<template>
  <div v-if="!users">
    <LoadingUser v-for="i in 3" :key="i" />
  </div>
  <div v-else>
    <UserItem v-for="u in users" :key="u.id" :u="u" />
  </div>
</template>
<script setup>
import LoadingUser from "../components/LoadingUser.vue";
import UserItem from "../components/UserItem.vue";
import { $api } from "../helpers/api";
import { useStore } from "../store";
import useSWRV from "swrv";
import { watch } from "vue";
import { useRoute } from "vue-router";

const $auth = useStore();
const $route = useRoute();

const { data: users, mutate: reloadFeed } = useSWRV(
  `/user/${$route.name == "my" ? $auth.me.username : $route.params.username}/${$route.params.tab}`,
  () =>
    $api.getFollowing({
      username:
        $route.name == "my" ? $auth.me.username : $route.params.username,
      tab: $route.params.tab,
    })
);

watch(
  () => [$route.params.username, $route.params.tab],
  () => reloadFeed()
);
</script>
