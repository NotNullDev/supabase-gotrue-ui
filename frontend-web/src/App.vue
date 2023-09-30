<script setup lang="ts">
import { clsx } from 'clsx'
import { RouterLink, RouterView, useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <header class="p-4 bg-base-100 shadow shadow-lg">
      <div class="container mx-auto flex justify-between shadow shadow-base-100">
        <RouterLink class="btn btn-ghost btn-sm" to="/">GoTrue UI</RouterLink>
        <nav class="flex gap-2">
          <RouterLink
            :class="
              clsx('btn btn-sm', {
                'btn-secondary': route.name === 'users',
                'btn-ghost': route.name !== 'users'
              })
            "
            to="/"
            >Users</RouterLink
          >
          <RouterLink
            :class="
              clsx('btn btn-sm', {
                'btn-secondary': route.name === 'audit-log',
                'btn-ghost': route.name !== 'audit-log'
              })
            "
            to="/audit-log"
            >Audit log</RouterLink
          >
        </nav>
      </div>
    </header>
    <RouterView />
  </div>
</template>
