import { defineStore } from "pinia";
import { $my } from "./helpers/api";

export const useStore = defineStore("my", {
  state: () => ({
    me: { id: undefined },
    following: [],
  }),
  getters: {
    id(v) {
      return v.me?.id;
    },
  },
  actions: {
    async getFollowing() {
      this.following = await $my.getFollowing();
    },
  },
});
