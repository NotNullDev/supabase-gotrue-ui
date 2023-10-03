<script setup lang="ts">
import AuditLogVue from '@/components/AuditLog.vue';
import { auth } from '@/lib/gotrue';
import type { Audit } from '@/lib/types';
import { onMounted, ref } from 'vue';

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

const showRawValue = ref(false);

</script>
<template>
  <main class="container mx-auto pb-10">
    <h1 class="text-3xl font-semibold my-10">Audit log</h1>

    <div class="flex flex-col gap-2">


      <div class="flex flex-col gap-1 bg-base-100 rounded-md p-4" v-for="log in auditLogs" :key="log.id">
        <AuditLogVue :log="log" />
      </div>


    </div>

    <button class="btn btn-secondary mt-5" @click="showRawValue = !showRawValue">Show raw data</button>

    <div class="p-4 rounded-md bg-base-100 mt-5" v-if="showRawValue">
      <pre>{{ auditLogs }}</pre>
    </div>

  </main>
</template>
