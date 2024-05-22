<template>
  <div>
    <div class="border-b p-4 relative">
      <a
        class="right tooltipped tooltipped-s"
        aria-label="RSS Feed"
        target="_blank"
        :href="
          auth.id ? `/feed/${auth.me.username}/following.rss` : '/feed/home.rss'
        "
      >
        <svg class="icon">
          <use xlink:href="#icon-feed" />
        </svg>
      </a>
      <div class="h3">
        {{ $t("Live Feed") }}
      </div>

      <div v-if="isStale" class="absolute flex top-4 justify-center w-full">
        <button class="btn-primary" @click="refreshCache">Refresh</button>
      </div>
    </div>
    <div>
      <div v-if="!feed" class="p-4">
        <LoadingRow v-for="i in 3" :key="i" />
      </div>
      <div v-else-if="!feed.length" class="p-4 empty-state">
        <p>Nothing here..</p>
      </div>
      <PostItem
        v-for="p in feed"
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
import LoadingRow from "./components/LoadingRow.vue";
import PostItem from "./components/PostItem.vue";
import { $api } from "./helpers/api";
import { useStore } from "./store";

const auth = useStore();
const { data: feed } = useSWRV("feed", () => $api.getFeed());
</script>
