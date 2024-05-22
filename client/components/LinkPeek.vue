<template>
  <figure v-if="preview" class="link-peek">
    <figcaption>
      <a class="link" :href="link">{{ preview.title }}</a>
      <p>{{ preview.description }}</p>
      <div class="flex gap-2 my-4">
        <img class="w-4 h-4" :src="preview.logo?.url" />
        <small>{{ preview.publisher }}</small>
      </div>
    </figcaption>
    <img class="preview" :src="preview.image?.url" />
  </figure>
  <figure v-else class="link-peek">
    <svg class="icon"><use xlink:href="#icon-loading"></use></svg>
  </figure>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
const props = defineProps({ link: String });
const preview = ref();
const load = () => {
  if (props.link) {
    fetch(`https://api.microlink.io/?url=${props.link}`)
      .then((response) => response.json())
      .then(({ status, data }) => {
        if (status == "success") preview.value = data;
      });
  } else {
    preview.value = undefined;
  }
};

onMounted(load);
watch(() => props.link, load);
</script>

<style>
.link-peek figure {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, max-content));
  gap: 1rem;
  max-inline-size: max-content;
  border: 1px solid #ddd;
  padding: 1rem;
  margin: 0;
}

.link-peek img.preview {
  max-inline-size: 100%;
  block-size: auto;
}

.link-peek img.logo {
  inline-size: 1rem;
  block-size: 1rem;
  vertical-align: middle;
}
</style>
