<!-- eslint-disable vue/no-v-html -->
<template>
  <div v-if="!feed" class="p-4">
    <LoadingRow v-for="i in 3" :key="i" />
  </div>
  <div v-else-if="!feed.length" class="p-4 empty-state">
    <p>Nothing here.. {{ $auth.me.name }}, please post something.</p>
    <RouterLink to="/post" class="btn btn-primary">Post</RouterLink>
  </div>
  <PostItem
    v-for="x in feed"
    :key="x.id"
    :post="x"
    class="cursor-pointer border-b"
    @click="$router.push(x.sublink)"
  />
</template>
<script setup>
import PostItem from "../components/PostItem.vue";
import { $api } from "../helpers/api";
import LoadingRow from "../components/LoadingRow.vue";
import { useStore } from "../store";
import useSWRV from "swrv";
import { watch } from "vue";
import { useRoute } from "vue-router";

const $auth = useStore();
const $route = useRoute();

const { data: feed, mutate: reloadFeed } = useSWRV(
  `/user/${$route.params.username}/feed`,
  () =>
    $api.getUserPosts({
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
