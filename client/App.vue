<template>
  <div>
    <div class="md:flex justify-center min-h-screen">
      <aside>
        <Navigation
          class="flex md:flex-col fixed md:sticky border-b md:border-none justify-between md:justify-start p-4 top-0 w-full md:w-48 gap-4 h-14 md:h-screen z-50 bg-body"
        />
      </aside>
      <div class="flex-1 md:border-x max-w-xl mt-14 md:mt-0 pb-20 md:pb-0">
        <router-view />
      </div>
      <div
        class="hidden max-w-[350px] flex-col pb-8 px-8 dark:border-white/10 lg:flex"
      >
        <div class="sticky top-0">
          <router-view name="rightcol">
            <div v-if="!tags" class="my-4 animate-pulse flex flex-wrap gap-4">
              <div class="w-16 h-6 bg-gray rounded"></div>
              <div class="w-12 h-6 bg-gray rounded"></div>
              <div class="w-16 h-6 bg-gray rounded"></div>
              <div class="w-12 h-6 bg-gray rounded"></div>
              <div class="w-16 h-6 bg-gray rounded"></div>
              <div class="w-12 h-6 bg-gray rounded"></div>
              <div class="w-12 h-6 bg-gray rounded"></div>
            </div>

            <div v-else class="tags my-4">
              <RouterLink
                v-for="t in tags"
                :key="t.tag"
                :to="`/tags/${t.tag.replace('#', '')}`"
                class="tag mb-1"
              >
                {{ t.tag }}
              </RouterLink>
            </div>
            <div class="my-4">
              <h5 class="h5">New Users</h5>
              <UserList :users="newUsers" />
            </div>
            <div>
              <div class="p-4">
                <a
                  href="https://www.producthunt.com/posts/rittr?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-rittr"
                  target="_blank"
                  ><img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=454870&theme=light"
                    alt="Rittr - Social&#0032;MicroBlogging&#0032;Platform | Product Hunt"
                    style="width: 250px; height: 54px"
                    width="250"
                    height="54"
                /></a>
              </div>
            </div>
          </router-view>
          <Footer />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import useSWRV from "swrv";
import { onMounted, watch } from "vue";
import Footer from "./components/Footer.vue";
import Navigation from "./components/Navigation.vue";
import UserList from "./components/UserList.vue";
import { $api } from "./helpers/api";
import { useStore } from "./store";

const auth = useStore();
const store = useStore();
const { data: tags } = useSWRV("/tags", () => $api.getTags());
const { data: newUsers } = useSWRV("newusers", () => $api.getNewUsers());

onMounted(() => {
  if (auth.id) store.getFollowing();
});

watch(
  () => auth.id,
  () => store.getFollowing()
);
</script>
