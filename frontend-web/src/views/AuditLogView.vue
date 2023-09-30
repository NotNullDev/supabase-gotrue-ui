<script setup lang="ts">
import { auth } from '@/lib/gotrue'
import type { Audit } from '@/lib/types'
import { onMounted, ref } from 'vue'

let auditLogs = ref<Audit[]>()

onMounted(async () => {
  const authResponse = await auth.signInWithPassword({
    email: 'admin',
    password: 'admin'
  })
  if (authResponse.error) {
    console.log('failed to login')
    console.error(authResponse.error)
    return
  }

  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/audit`, {
      headers: {
        Authorization: `Bearer ${authResponse.data.session.access_token}`
      }
    })
    auditLogs.value = (await resp.json()) as Audit[]
  } catch (e) {
    console.error(e)
  }
})
</script>
<template>
  <main class="container mx-auto pb-10">
    <h1 class="text-3xl font-semibold my-10">Audit log</h1>
    <h2 class="text-xl my-2">Raw data</h2>
    <div class="p-4 rounded-md bg-base-100">
      <pre>{{ auditLogs }}</pre>
    </div>
  </main>
</template>
