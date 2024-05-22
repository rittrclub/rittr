<template>
  <div class="px-4 py-2 hover:bg-auto flex gap-4">
    <router-link
      :to="`/${post.username}`"
      class="w-12 h-12 overflow-hidden rounded-full"
      @click.stop
    >
      <Avatar :name="post.name" :photo="post.photo_url" class="avatar" />
    </router-link>
    <div class="flex-1 max-w-full overflow-hidden">
      <div class="group">
        <div class="right">
          <RouterLink :to="post.sublink" class="text-sm mr-1" @click.stop>
            {{ microTimeAgo(post.date) }} ago
          </RouterLink>
          <Popup>
            <a href="" @click.prevent="shareLink(post.link)">Copy Link</a>
            <template v-if="post.isMine">
              <router-link :to="`/edit?p=${post.id}`">Edit</router-link>
            </template>
            <template v-else>
              <a target="_report" :href="`/report?l=${post.sublink}`">Report</a>
            </template>
          </Popup>
        </div>
        <router-link :to="`/${post.username}`" @click.stop>
          <b class="group-hover:underline">{{ post.name }}</b>
          <span class="tip mx-2">@{{ post.username }}</span>
        </router-link>
      </div>
      <div class="flex gap-4 my-1">
        <div v-if="post.poster_url" class="overflow-hidden w-36">
          <img :src="post.poster_url" />
        </div>
        <div class="break-text flex-1">
          <p class="highlight-links" v-html="formatPost(post.summary)"></p>
        </div>
      </div>
      <div class="flex gap-4 mt-1 items-center">
        <LikeButton
          :votes="post.votes || 0"
          :current="post.reaction"
          @vote="onVote"
        />
        <div class="flex items-center">
          <svg class="icon" viewBox="0 0 24 24">
            <path
              d="M10,9V5L3,12L10,19V14.9C15,14.9 18.5,16.5 21,20C20,15 17,10 10,9Z"
            />
          </svg>
          {{ post.comments || 0 }}
        </div>
        <svg v-if="post.is_reply" width="1em" height="1em" viewBox="0 0 24 24">
          <path d="M10 9V5l-7 7l7 7v-4.1c5 0 8.5 1.6 11 5.1c-1-5-4-10-11-11" />
        </svg>
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
    </div>
  </div>
</template>
<script setup>
import { shareLink } from "../lib";
import { microTimeAgo } from "../lib";
import { formatPost } from "../lib";
import { $my } from "../helpers/api";
import { useStore } from "../store";
import Avatar from "./Avatar.vue";
import LikeButton from "./LikeButton.vue";
import Popup from "./popup.vue";

const $auth = useStore();
const props = defineProps({ post: Object });

async function onVote(reaction) {
  if (!$auth.checkLogin()) return;
  const { votes } = await $my.saveReaction({
    id: props.post.id,
    reaction,
  });
  // eslint-disable-next-line vue/no-mutating-props
  props.post.votes = votes;
  // eslint-disable-next-line vue/no-mutating-props
  props.post.reaction = reaction;
}

async function onBookmark() {
  if (!$auth.checkLogin()) return;
  // eslint-disable-next-line vue/no-mutating-props
  props.post.bookmarked = !props.post.bookmarked;
  await $my.bookmark({
    id: props.post.id,
    bookmarked: props.post.bookmarked,
  });
}
</script>
