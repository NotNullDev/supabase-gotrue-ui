<script setup lang="ts">
import { auth } from '@/lib/gotrue'
import type { ActiveSession, LoginAudit } from '@/lib/types'
import type { User } from '@supabase/gotrue-js'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const user = ref<User>()
const loginHistory = ref<LoginAudit[]>([])
const activeSessions = ref<ActiveSession[]>([])
const route = useRoute()

const pageState = ref<'metadata' | 'login-history' | 'active-sessions'>('metadata')

const showMore = ref(false)

onMounted(async () => {
  const userId = route.params.id

  const authResponse = await auth.signInWithPassword({
    email: 'admin',
    password: 'admin'
  })
  if (authResponse.error) {
    console.log('failed to login')
    console.error(authResponse.error)
    return
  }

  // user metadata
  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authResponse.data.session.access_token}`
      }
    })
    user.value = (await resp.json()) as User
  } catch (e) {
    console.error(e)
  }

  // login history
  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/audit/login-history/${userId}`, {
      headers: {
        Authorization: `Bearer ${authResponse.data.session.access_token}`
      }
    })
    const loginHistoryResp = (await resp.json()) as LoginAudit[]
    loginHistory.value = loginHistoryResp
  } catch (e) {
    console.error(e)
  }

  // active sessions
  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/sessions/${userId}`, {
      headers: {
        Authorization: `Bearer ${authResponse.data.session.access_token}`
      }
    })
    const activeSessionsResponse = (await resp.json()) as ActiveSession[]
    activeSessions.value = activeSessionsResponse
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <main class="container mx-auto pb-10">
    <h1 class="text-3xl font-semibold my-10">User Details</h1>

    <div class="p-4 bg-base-100 rounded-md flex justify-between">
      <div class="flex gap-2">
        <button
          :class="
            clsx('btn', {
              'btn-ghost': pageState !== 'metadata',
              'btn-secondary': pageState === 'metadata'
            })
          "
          @click="pageState = 'metadata'"
        >
          Metadata
        </button>
        <button
          :class="
            clsx('btn', {
              'btn-ghost': pageState !== 'login-history',
              'btn-secondary': pageState === 'login-history'
            })
          "
          @click="pageState = 'login-history'"
        >
          Login history
        </button>
        <button
          :class="
            clsx('btn', {
              'btn-ghost': pageState !== 'active-sessions',
              'btn-secondary': pageState === 'active-sessions'
            })
          "
          @click="pageState = 'active-sessions'"
        >
          Active sessions
        </button>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost">Invalidate all sessions</button>
        <div class="h-full w-[1px] bg-base-300 mx-2"></div>
        <button class="btn btn-primary w-[140px]" @click="showMore = !showMore">
          {{ showMore ? 'hide actions' : 'actions' }}
        </button>
      </div>
    </div>

    <div v-if="showMore" class="p-4 bg-base-100 rounded-md flex justify-between mt-2">
      <div class="gap-2">
        <button class="btn btn-ghost">Send Reset password</button>
        <button class="btn btn-ghost">Send magic link</button>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-error">Remove MFA factors</button>
        <button class="btn btn-error">Ban user</button>
        <div class="h-full w-[1px] bg-base-300 mx-2"></div>
        <button class="btn btn-error">Delete user</button>
      </div>
    </div>

    <div v-if="pageState === 'metadata'">
      <h2 class="text-xl my-2">Raw data</h2>
      <div class="p-4 bg-base-100 rounded-md">
        <pre>{{ user }}</pre>
      </div>
    </div>

    <div v-else-if="pageState === 'login-history'" class="flex flex-col gap-2 mt-5">
      <div class="overflow-x-auto">
        <table class="table bg-base-100">
          <!-- head -->
          <thead>
            <tr>
              <th>Created at</th>
              <th>Provider</th>
              <th>SSO</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
            <tr v-for="login in loginHistory" :key="login.id">
              <td>{{ dayjs(login.created_at).format('DD.MM.YYYY HH:mm') }}</td>
              <td>{{ login.payload.traits.provider }}</td>
              <td>{{ !!login.payload.actor_via_sso }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="pageState === 'active-sessions'" class="flex flex-col gap-2 mt-5">
      <div class="overflow-x-auto">
        <table class="table bg-base-100">
          <!-- head -->
          <thead>
            <tr>
              <th>ID</th>
              <th>Created at</th>
              <th>AAL</th>
              <th>Authentication Method</th>
              <th>Factor ID</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
            <tr v-for="(session, idx) in activeSessions" :key="idx">
              <td>{{ session.amr[0]?.id }}</td>
              <td>{{ dayjs(session.created_at).format('DD.MM.YYYY HH:mm') }}</td>
              <td>{{ session.aal }}</td>
              <td>{{ session.amr[0]?.authentication_method }}</td>
              <td>{{ session.factor_id }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>
