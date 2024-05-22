<template>
  <div class="relative">
    <textarea ref="editor" class="form-control" :value="modelValue"></textarea>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import "./simplemde/simplemde";
import "./simplemde/simplemde.css";
import { watch } from "vue";
import { ref } from "vue";

const editor = ref();
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  options: { type: Object, default: () => ({}) },
  modelValue: String,
});

onMounted(() => {
  let orig = false;
  // eslint-disable-next-line no-undef
  const mde = new SimpleMDE({
    hideIcons: ["guide", "heading"],
    element: editor.value,
    placeholder: "## Write your post with markdown.",
    spellChecker: false,
    ...props.options,
  });

  mde.codemirror.on("change", function () {
    orig = mde.value();
    emit("update:modelValue", mde.value());
  });

  watch(
    () => props.modelValue,
    (v) => (orig != v ? mde.value(v) : 0)
  );
});
</script>
