<template>
  <div>
    <div class="flex items-start border-b">
      <router-link to="/my" class="p-4">
        <svg class="icon"><use xlink:href="#icon-arrow-left"></use></svg>
      </router-link>
      <div class="p-4 flex-1">
        <h3 class="h3">New Post</h3>
      </div>
      <div class="p-4">
        <button class="btn-sm btn-primary" @click="onPublish">Publish</button>
      </div>
    </div>
    <div class="p-4">
      <div class="flex gap-4">
        <router-link
          :to="`/${auth.me.username}`"
          class="w-12 h-12 overflow-hidden rounded-full"
          @click.stop
        >
          <Avatar :name="auth.me.name" :photo="auth.me.photo_url" />
        </router-link>
        <div class="flex-1">
          <div>
            <div class="right"></div>
            <span>
              <b>{{ auth.me.name || "Your Name" }}</b>
              <span class="tip mx-2"
                >@{{ auth.me.username || "yourusername" }}</span
              >
            </span>
            <span>{{ timeAgo(auth.me.date) }}</span>
          </div>

          <div class="my-2 form-control">
            <div class="my-2">
              <ImagePicker
                v-slot="{ onPickImage, src, clear }"
                v-model="form.poster"
                :placeholder="form.poster_url"
                height="600"
                :width="(600 * 16) / 9"
              >
                <div class="relative min-h-8 -m-2">
                  <img
                    v-if="src"
                    :src="src || form.poster_url"
                    class="w-full"
                  />
                  <div class="absolute top-1 left-1 flex gap-2">
                    <button
                      v-if="src"
                      class="btn-xs btn-auto"
                      @click="
                        clear();
                        form.poster_url = null;
                      "
                    >
                      Remove
                    </button>
                    <button v-else class="btn-xs btn-auto" @click="onPickImage">
                      <svg width="1em" height="1em" viewBox="0 0 20 20">
                        <path
                          fill="currentColor"
                          d="M19 3H1v14h18zM3 14l3.5-4.5l2.5 3L12.5 8l4.5 6z"
                        />
                        <path
                          fill="currentColor"
                          d="M19 5H1V3h18zm0 12H1v-2h18z"
                        />
                      </svg>
                      Cover Image
                    </button>
                    <button
                      v-if="!src"
                      class="btn-xs btn-auto"
                      @click="showGifPicker = true"
                    >
                      <svg width="1em" height="1em" viewBox="0 0 24 24">
                        <path
                          d="M3 21V3h18v18zm4.5-7h3v-2h-1v1h-1v-2h2v-1h-3zm4 0h1v-4h-1zm2 0h1v-1.5H16v-1h-1.5V11h2v-1h-3z"
                        />
                      </svg>
                      GIF
                    </button>
                    <ModalDialog
                      v-if="showGifPicker"
                      title="Pick a GIF"
                      @close="showGifPicker = false"
                    >
                      <GIFPicker
                        :popular="[
                          'AI',
                          'The Office',
                          'Avatar',
                          'We did it',
                          'Happy Friday',
                          'Lets have party',
                        ]"
                        @select="
                          form.poster = $event;
                          form.poster_url = $event;
                          showGifPicker = false;
                        "
                      />
                    </ModalDialog>
                  </div>
                </div>
              </ImagePicker>
            </div>
            <input
              v-model="form.title"
              type="text"
              class="h1 my-2 w-full plain"
              placeholder="Title"
              autofocus
              maxlength="140"
            />
            <MarkdownEditor
              v-model="form.body"
              class="plain"
              :options="{ previewRender: mkToHtml }"
            />
          </div>
          <ul>
            <li>1. Keep it short or write as long as you wish</li>
            <li>2. Use hashtags</li>
            <li>3. Be respectful</li>
            <li>4. Use Markdown</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { $my } from "./helpers/api";
import { mkToHtml } from "./helpers/mkdown";
import { timeAgo } from "./lib";
import { $alert } from "./lib";
import Toast from "./lib";
import Avatar from "./components/Avatar.vue";
import MarkdownEditor from "./components/forms/MarkdownEditor.vue";
import { useStore } from "./store";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const auth = useStore();
const $router = useRouter();
const $route = useRoute();
const form = ref({ body: "" });
const showGifPicker = ref(false);

onMounted(() => {
  if ($route.name == "editpost" && $route.query.p) {
    $my.getPost({ id: $route.query.p }).then((p) => {
      form.value = { ...p };
    });
  }
});

async function onPublish() {
  if (auth.checkLogin()) {
    const text = form.value.body;
    if (text.length < 3)
      return $alert("Please type something longer than 2 words", {
        title: "Ouch",
      });
    const { sublink, error } = await $my.post({ ...form.value });
    if (!error) {
      Toast("Posted");
      form.value = {};
      $router.replace(sublink);
    }
  }
}
</script>
