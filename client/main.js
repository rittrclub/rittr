import "./style.css";

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  linkExactActiveClass: "active",
  routes: [
    {
      name: "home",
      path: "/",
      component: () => import("./Home.vue"),
      meta: { title: "Home" },
    },
    {
      path: "/my",
      name: "my",
      component: () => import("./Profile.vue"),
      meta: { secure: true },
    },
    {
      path: "/post",
      component: () => import("./NewPost.vue"),
      meta: { secure: true, title: "New Post" },
      name: "newpost",
    },
    {
      path: "/edit",
      component: () => import("./NewPost.vue"),
      meta: { secure: true, title: "Edit Post" },
      name: "editpost",
    },
    {
      name: "search",
      path: "/search",
      component: () => import("./Search.vue"),
    },
    {
      name: "bookmarks",
      path: "/bookmarks",
      component: () => import("./Bookmarks.vue"),
      meta: { secure: true, title: "Bookmarks" },
    },
    {
      name: "tag",
      path: "/tags/:tag",
      component: () => import("./Search.vue"),
    },
    {
      name: "profile",
      alias: "/@:username",
      path: "/:username/:tab(\\w+)?",
      component: () => import("./Profile.vue"),
    },
    {
      path: "/:username/post/:slug",
      meta: { handled: true },
      component: () => import("./Post.vue"),
    },
  ],
});

const app = createApp(App).use(pinia).use(router);
app.config.globalProperties.$t = (s) => s;
app.mount("#app");
