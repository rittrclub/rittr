<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div v-if="$route.name == 'my' && !$auth.me.username" class="empty-state">
      <p>Login or Signup to Create Your Blog</p>
      <button class="btn btn-primary" @click="$auth.checkLogin()">Login</button>
    </div>
    <div v-else-if="!user">Loading..</div>
    <div v-else>
      <div class="flex items-start">
        <router-link to="/" class="p-4">
          <svg class="icon">
            <use xlink:href="#icon-arrow-left"></use>
          </svg>
        </router-link>
        <div class="p-4 flex-1"></div>
        <div class="p-4 flex gap-2">
          <ShareButton :url="user.link" :title="user.name" />
          <Popup>
            <a
              @click="
                shareLink(`${origin}/feed/${user.username}.rss`, {
                  message: 'RSS Link Copied',
                })
              "
            >
              RSS Feed
            </a>
            <a target="_report" :href="`/report?l=${user.sublink}`">Report</a>
          </Popup>
        </div>
      </div>
      <div v-if="isEditing && isMine">
        <ImagePicker
          v-slot="{ onPickImage, src }"
          height="300"
          width="1200"
          @update:modelValue="user.poster = $event"
        >
          <div
            class="h-48 bg-auto bg-cover bg-center cursor-pointer"
            :style="`background-image: url('${src || user.poster_url}')`"
            @click="onPickImage"
          ></div>
        </ImagePicker>
        <div class="p-4 flex gap-4 items-start flex-1">
          <div
            :to="`/${user.username}`"
            class="w-24 h-24 overflow-hidden rounded-full block -mt-10"
            @click.stop
          >
            <ImagePicker
              v-slot="{ onPickImage, src }"
              allow-icon
              @update:modelValue="user.photo = $event"
            >
              <Avatar
                :name="user.name"
                :photo="src || user.photo_url"
                class="avatar w-24 h-24 cursor-pointer"
                @click="onPickImage"
              />
            </ImagePicker>
          </div>
          <div class="flex-1 overflow-hidden">
            <h3 class="h3">
              <input v-model="user.name" class="border" />
            </h3>
            <div class="my-1">
              @<input v-model="user.username" class="border" />
            </div>
            <p class="text-sm">Username can be between 3-32 characters long.</p>
          </div>
          <div class="p-4 flex gap-2">
            <button class="btn-sm btn-auto" @click="isEditing = false">
              Cancel
            </button>
            <button class="btn-sm btn-primary" @click="onSave">Save</button>
          </div>
        </div>
        <div class="p-4 pt-0 border-b">
          <textarea
            v-model="user.about"
            class="form-control"
            placeholder="About"
          />
        </div>
      </div>
      <div v-else>
        <div
          class="h-36 bg-auto bg-cover bg-center"
          :style="`background-image: url(${user.poster_url || '/img/default.svg'})`"
        ></div>
        <div class="p-4 flex gap-4 items-start flex-wrap">
          <div
            :to="`/${user.username}`"
            class="w-24 h-24 overflow-hidden rounded-full block -mt-10"
            @click.stop
          >
            <Avatar
              :name="user.name"
              :photo="user.photo_url"
              class="avatar w-24 h-24"
            />
          </div>
          <div class="flex-1">
            <h3 class="h3">{{ user.name }}</h3>
            <div>@{{ user.username }}</div>
          </div>
          <div v-if="isMine" class="flex gap-2">
            <button class="btn-sm btn-outline" @click="isEditing = true">
              Edit
            </button>
            <router-link class="btn-sm btn-primary" to="/post">
              <svg class="icon"><use xlink:href="#icon-plus"></use></svg>
              Post
            </router-link>
          </div>
          <div v-else>
            <button
              class="btn-sm"
              :class="user.isFollowing ? ' btn-outline' : 'btn-primary'"
              @click="followUser"
            >
              {{ user.isFollowing ? "Following" : "Follow" }}
            </button>
          </div>
        </div>
        <div class="p-4 pt-0">
          <p v-html="mkToHtml(user.about)"></p>
        </div>
      </div>
      <div class="tabs px-4">
        <routerLink
          class="tab"
          :to="{
            name: 'profile',
            params: { username: user.username, tab: '' },
          }"
        >
          All
        </routerLink>
        <routerLink
          class="tab"
          :to="{
            name: 'profile',
            params: { username: user.username, tab: 'posts' },
          }"
        >
          Posts
        </routerLink>
        <routerLink
          class="tab"
          :to="{
            params: { username: user.username, tab: 'replies' },
          }"
        >
          Replies
        </routerLink>
        <routerLink
          class="tab"
          :to="{
            name: 'profile',
            params: { username: user.username, tab: 'follwing' },
          }"
        >
          Following
        </routerLink>
        <routerLink
          class="tab"
          :to="{
            name: 'profile',
            params: { username: user.username, tab: 'followers' },
          }"
        >
          Followers
        </routerLink>
      </div>
      <FollowingList
        v-if="
          $route.params.tab == 'follwing' || $route.params.tab == 'followers'
        "
        class="px-4"
      />
      <Posts v-else />
    </div>
  </div>
</template>
<script setup>
import { shareLink } from "./lib";
import Toast from "./lib";
import useSWRV from "swrv";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Avatar from "./components/Avatar.vue";
import Popup from "./components/popup.vue";
import { $api, $my } from "./helpers/api";
import { mkToHtml } from "./helpers/mkdown";
import FollowingList from "./profile/FollowingList.vue";
import Posts from "./profile/Posts.vue";
import { useStore } from "./store";

const $auth = useStore();
const $route = useRoute();
const store = useStore();
const origin = location.origin;

const { data: user, mutate: reloadProfile } = useSWRV(
  `/user/${$route.params.username}`,
  () =>
    $api.getUserProfile({
      username:
        $route.name == "my" ? $auth.me.username : $route.params.username,
      tab: $route.params.tab,
    })
);

const isMine = computed(() => user?.value.isMine);
const isEditing = ref(false);
function reload() {
  reloadProfile();
}

watch(() => [$auth.me.username, $route.params.username], reload);

async function onSave() {
  if (!/^([a-zA-Z0-9][\w-]{2,32})$/.test(user.value.username)) {
    return Toast("Invalid Username", { type: "error" });
  }

  const { ok, error } = await $my.saveProfile({ ...user.value });
  if (ok) {
    $auth.getMe().then(() => reload());
    isEditing.value = false;
  } else {
    Toast(error || "Failed to save");
  }
}

async function followUser() {
  if (!$auth.checkLogin()) return;
  user.value.isFollowing = !user.value.isFollowing;
  if (user.value.isFollowing) {
    await $my.follow({ username: user.value.username });
  } else {
    await $my.unfollow({ username: user.value.username });
  }
  store.getFollowing();
}
</script>
