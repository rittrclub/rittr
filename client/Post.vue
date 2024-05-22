<template>
  <div>
    <div
      class="flex p-4 pt-0 border-b my-4 gap-4 items-center sticky top-0 bg-body z-10"
    >
      <button @click="$router.back()">
        <svg class="icon">
          <use xlink:href="#icon-arrow-left"></use>
        </svg>
      </button>
      <router-link
        :to="`/${post.username}`"
        class="w-12 h-12 overflow-hidden rounded-full"
        @click.stop
      >
        <Avatar :name="post.name" :photo="post.photo_url" class="avatar" />
      </router-link>
      <div class="flex-1">
        <RouterLink :to="`/${post.username}`">
          <b>{{ post.name }}</b>
          <span class="tip mx-2">@{{ post.username }}</span>
        </RouterLink>
        <div>
          <span class="text-sm mr-4">{{ timeAgo(post.date) }}</span>
          <button
            v-if="post.username !== $auth.me.username"
            class="btn-xs"
            :class="isFollowing ? 'btn-outline' : 'btn-primary'"
            @click="followUser"
          >
            {{ isFollowing ? "Following" : "Follow" }}
          </button>
        </div>
      </div>
      <div>
        <ShareButton :url="post.link" :title="post.title" />
        <Popup>
          <template v-if="post.isMine">
            <router-link :to="`/edit?p=${post.id}`">Edit</router-link>
            <a @click.prevent="onDelete(post)">Delete</a>
          </template>
          <template v-else>
            <a target="_report" :href="`/report?l=${post.sublink}`">Report</a>
          </template>
        </Popup>
      </div>
    </div>
    <div class="px-4">
      <div class="article break-words">
        <div class="-mx-4">
          <img v-if="post.poster_url" :src="post.poster_url" class="w-full" />
        </div>
        <h1>{{ post.title }}</h1>
        <div v-html="mkToHtml(post.body)"></div>
      </div>
      <div class="flex gap-4 my-2 items-center">
        <LikeButton
          :votes="post.votes || 0"
          :current="post.reaction"
          @vote="onVote"
        />
        <div class="flex-1"></div>
        <div>
          <button class="btn-push" @click.stop="onBookmark">
            <svg class="icon">
              <use
                :xlink:href="
                  post.bookmarked ? '#icon-bookmark-filled' : '#icon-bookmark'
                "
              ></use>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="post.reply_to" class="card">
        <h6 class="px-4 pt-4">
          <svg width="1em" height="1em" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M10 9V5l-7 7l7 7v-4.1c5 0 8.5 1.6 11 5.1c-1-5-4-10-11-11"
            />
          </svg>
          Replied to
        </h6>
        <PostItem
          :post="post.reply_to"
          class="cursor-pointer"
          @click="$router.push(post.reply_to.sublink)"
        />
      </div>
      <div v-if="link">
        <LinkPeek :link="link" class="card p-4 my-4" />
      </div>
    </div>
    <Discuss
      :key="post.id"
      v-slot="{ item }"
      class="px-4 pb-4"
      :get-comments="getThread"
      :onPost="onReplyPost"
      :title="$t('Replies')"
    >
      <PostItem
        :post="item"
        class="cursor-pointer border-b"
        @click="$router.push(item.sublink)"
      />
    </Discuss>
  </div>
</template>
<script setup>
import LinkPeek from "./components/LinkPeek.vue";
import PostItem from "./components/PostItem.vue";
import { $api, $my } from "./helpers/api";
import { mkToHtml } from "./helpers/mkdown";
import { useStore } from "./store";
import { timeAgo } from "./lib";
import { $alert, $confirm } from "./lib";
import Toast from "./lib";
import Avatar from "./components/Avatar.vue";
import ShareButton from "./components/ShareButton.vue";
import LikeButton from "./components/LikeButton.vue";
import Discuss from "./components/commenting/Discuss.vue";
import Popup from "./components/popup.vue";
import { useStore } from "./store";
import { useTitle } from "@vueuse/core";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const $route = useRoute();
const $router = useRouter();
const $auth = useStore();
const store = useStore();
const isFollowing = ref(false);
const reactions = ref([]);

const UrlRegex =
  /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

const post = ref({
  id: "",
  name: "Loading..",
  date: new Date(),
  username: "..",
  text: "Please wait..",
});

const link = computed(() => {
  const m = UrlRegex.exec(post.value.body || "");
  if (m) return m[1];
  return undefined;
});

async function fetch() {
  const p = await $api.getPost($route.params);
  post.value = { ...p };
  useTitle(p.title);
  isFollowing.value = store.following.some((f) => f.username == p.username);
  $api.getReactions({ id: p.id }).then((v) => (reactions.value = v));
}

onMounted(fetch);
watch(() => $route.params.slug, fetch);

function onDelete(post) {
  $confirm("Are sure to delete?", async (yes) => {
    if (!yes) return;
    const { ok } = await $my.deletePost({ id: post.id });
    if (ok) {
      Toast("Deleted Post");
      $router.push("/my");
    }
  });
}

async function followUser() {
  if (!$auth.checkLogin()) return;
  isFollowing.value = !isFollowing.value;
  if (isFollowing.value) {
    await $my.follow({ username: post.value.username });
  } else {
    await $my.unfollow({ username: post.value.username });
  }
  store.getFollowing();
}

function getThread(filters) {
  if (post.value.id) return $api.getThread({ id: post.value.id, ...filters });
  return Promise.resolve({});
}

async function onReplyPost(text) {
  if ($auth.checkLogin()) {
    if (text.length < 1)
      return $alert("Please type something longer", {
        title: "Ouch",
      });
    const { ok, sublink } = await $my.post({
      body: text,
      parent_id: post.value.id,
    });
    Toast("Posted", { buttons: { name: "show", label: "View" } }).then(
      (btn) => {
        if (btn === "show") $router.push(sublink);
      }
    );
    return { success: ok };
  }
}

async function onBookmark() {
  if (!$auth.checkLogin()) return;
  // eslint-disable-next-line vue/no-mutating-props
  post.value.bookmarked = !post.value.bookmarked;
  await $my.bookmark({
    id: post.value.id,
    bookmarked: post.value.bookmarked,
  });
}

async function onVote(reaction) {
  if (!$auth.checkLogin()) return;
  const { votes } = await $my.saveReaction({
    id: post.value.id,
    reaction,
  });
  // eslint-disable-next-line vue/no-mutating-props
  post.value.votes = votes;
  // eslint-disable-next-line vue/no-mutating-props
  post.value.reaction = reaction;
}
</script>
