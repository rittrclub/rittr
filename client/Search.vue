<template>
  <div>
    <div class="flex items-start border-b">
      <router-link to="/" class="p-4">
        <svg class="icon"><use xlink:href="#icon-arrow-left"></use></svg>
      </router-link>
      <div class="p-4 flex-1">
        <h3 class="h3">
          {{ $route.query.q || "Search" }}
          {{ $route.params.tag }}
        </h3>
      </div>
      <div class="p-4"></div>
    </div>
    <form
      class="overflow-hidden flex bg-card border pl-4 items-center m-4"
      @submit.prevent="onSearch"
    >
      <div class="flex-1">
        <input
          v-model="query"
          type="search"
          class="plain w-full"
          placeholder="Search"
        />
      </div>
      <button class="btn">
        <svg class="icon"><use xlink:href="#icon-search"></use></svg>
      </button>
    </form>
    <div v-if="$route.query.q || $route.params.tag || query" class="p-4">
      <div v-if="!feed">
        <LoadingRow v-for="i in 3" :key="i" />
      </div>
      <div v-else-if="!feed.results?.length" class="p-4 empty-state">
        <p>Nothing here.. {{ query }}</p>
      </div>
      <PostItem
        v-for="p in feed.results"
        :key="p.id"
        tabindex="0"
        :post="p"
        class="cursor-pointer border-b rounded"
        @click="$router.push(p.sublink)"
      />
    </div>
    <div v-else class="p-4">
      <div class="tags mb-4">
        <RouterLink
          v-for="t in tags"
          :key="t.tag"
          :to="`/tags/${t.tag.replace('#', '')}`"
          class="tag"
        >
          {{ t.tag }}
        </RouterLink>
      </div>
      <h3>New Users</h3>
      <NewUsersList />
    </div>
  </div>
</template>
<script setup>
import NewUsersList from "./components/NewUsersList.vue";
import PostItem from "./components/PostItem.vue";
import { $api } from "./helpers/api";
import LoadingRow from "./components/LoadingRow.vue";
import useSWRV from "swrv";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const $route = useRoute();
const $router = useRouter();
const query = ref($route.query.q);

function onSearch() {
  $router.push("/search?q=" + query.value);
}

const { data: tags } = useSWRV("/tags", () => $api.getTags());
const { data: feed, mutate } = useSWRV(
  ["search", $route.params.tag, query.value].join("-"),
  () =>
    $api.search({
      q: query.value,
      t: $route.params.tag,
    })
);

// const tFetch = throttle(mutate, 600);
watch(
  () => query.value,
  () => mutate()
);

watch(
  () => $route.params.tag,
  () => mutate()
);
</script>
