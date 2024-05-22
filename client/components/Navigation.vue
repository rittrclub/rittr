<template>
  <header>
    <div class="flex gap-4 justify-between flex-1 md:flex-none">
      <RouterLink
        to="/"
        class="flex items-center text-xl font-bold"
        aria-label="Rittr"
      >
        <img src="/logo.svg" width="32" height="32" />
      </RouterLink>
    </div>
    <div
      class="flex md:flex-col md:static bg:nav gap-2 fixed bottom-0 left-0 right-0 px-4 py-2 md:px-0 backdrop-blur md:backdrop-blur-none justify-between"
    >
      <RouterLink
        class="flex items-center gap-2 rounded px-2"
        :class="$route.name == 'home' ? 'bg-auto' : ''"
        to="/"
        aria-label="Feed"
      >
        <svg width="32" height="32" viewBox="0 0 24 24">
          <path
            d="M6 19h3v-6h6v6h3v-9l-6-4.5L6 10zm-2 2V9l8-6l8 6v12h-7v-6h-2v6zm8-8.75"
          />
        </svg>
        <span class="hidden md:block">Home</span>
      </RouterLink>
      <RouterLink
        class="flex items-center gap-2 rounded px-2"
        :class="$route.name == 'search' ? 'bg-auto' : ''"
        to="/search"
        aria-label="Search"
      >
        <svg width="32" height="32" viewBox="0 0 24 24">
          <path
            d="M5 10a5 5 0 1 1 10 0a5 5 0 0 1-10 0m5-7a7 7 0 1 0 4.192 12.606l5.1 5.101a1 1 0 0 0 1.415-1.414l-5.1-5.1A7 7 0 0 0 10 3"
          />
        </svg>
        <span class="hidden md:block">Search</span>
      </RouterLink>
      <RouterLink
        class="flex items-center gap-2 rounded px-2"
        :class="$route.name == 'my' ? 'bg-auto' : ''"
        to="/my"
        aria-label="My Blog"
      >
        <svg width="32" height="32" viewBox="0 0 24 24">
          <path
            d="M15.71 12.71a6 6 0 1 0-7.42 0a10 10 0 0 0-6.22 8.18a1 1 0 0 0 2 .22a8 8 0 0 1 15.9 0a1 1 0 0 0 1 .89h.11a1 1 0 0 0 .88-1.1a10 10 0 0 0-6.25-8.19M12 12a4 4 0 1 1 4-4a4 4 0 0 1-4 4"
          />
        </svg>
        <span class="hidden md:block">My Blog</span>
      </RouterLink>
      <RouterLink
        class="flex items-center gap-2 rounded px-2"
        :class="$route.name == 'bookmarks' ? 'bg-auto' : ''"
        to="/bookmarks"
        aria-label="My Blog"
      >
        <svg width="32" height="32" viewBox="0 0 24 24">
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <path d="M15 10v11l-5-3l-5 3V10a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3" />
            <path d="M11 3h5a3 3 0 0 1 3 3v11" />
          </g>
        </svg>
        <span class="hidden md:block">Bookmarks</span>
      </RouterLink>
      <RouterLink
        class="flex items-center btn-sm"
        :class="{ ' btn-primary': $route.name !== 'newpost' }"
        to="/post"
        aria-label="New Post"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8m-4-4v8" />
          </g>
        </svg>
        <span class="hidden md:block"> New Post</span>
      </RouterLink>
    </div>
  </header>
</template>
