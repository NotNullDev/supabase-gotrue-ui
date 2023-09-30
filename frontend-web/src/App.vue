<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <header class="p-4 bg-base-100 shadow shadow-lg">
      <div class="container mx-auto flex justify-between shadow shadow-base-100">
        <RouterLink class="btn btn-ghost btn-sm" to="/">GoTrue UI</RouterLink>
        <nav class="flex gap-2">
          <RouterLink class="btn btn-ghost btn-sm" to="/">Users</RouterLink>
          <RouterLink class="btn btn-ghost btn-sm" to="/sessions">Sessions</RouterLink>
        </nav>
      </div>
    </header>
    <RouterView />
  </div>
</template>
