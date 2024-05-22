<!-- (c) Santosh Sahoo -->
I
<template>
  <component
    :is="tag"
    ref="$el"
    :class="className || 'btn-xs'"
    type="button"
    role="menu"
    @click.stop.prevent="showMenu"
  >
    <slot name="reference" :close="closeMenu">
      <svg width="18" height="18" viewBox="0 0 24 24" title="Menu">
        <path
          v-if="vdots"
          d="M12 16q.8 0 1.4.6T14 18t-.6 1.4-1.4.6-1.4-.6T10 18t.6-1.4T12 16zm0-6q.8 0 1.4.6T14 12t-.6 1.4-1.4.6-1.4-.6T10 12t.6-1.4T12 10zm0-2q-.8 0-1.4-.6T10 6t.6-1.4T12 4t1.4.6T14 6t-.6 1.4T12 8z"
        />
        <path
          v-else
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m7 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0"
        />
      </svg>
    </slot>
    <teleport v-if="shown" to="body">
      <div ref="$dropdown" class="popover popover__menu">
        <slot :close="closeMenu" />
      </div>
    </teleport>
  </component>
</template>

<script setup>
import { createPopper } from "@popperjs/core";
import { nextTick, onUnmounted, ref } from "vue";

defineProps({
  tag: { default: "button", type: String },
  className: String,
  vdots: Boolean,
});

defineExpose({ close: closeMenu, show: showMenu });

const shown = ref(false),
  $el = ref(),
  $dropdown = ref();

let popper;

onUnmounted(() => {
  closeMenu();
});

function showMenu() {
  shown.value = true;
  nextTick(() => {
    popper = createPopper($el.value, $dropdown.value, {
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            padding: 8,
          },
        },
      ],
    });
    popper.forceUpdate();
    document.addEventListener("click", closeMenu, true);
  });
}

function closeMenu(event) {
  if (
    !event ||
    !$dropdown.value?.contains(event.target) ||
    event.target?.tagName === "A"
  ) {
    nextTick(() => {
      document.removeEventListener("click", closeMenu);
      shown.value = false;
      popper?.destroy();
    });
  }
}
</script>
