<script setup lang="ts">
import JsonEditor from '@/components/JsonEditor.vue'
import IconArrowLeftVue from '@/components/icons/IconArrowLeft.vue'
import { auth } from '@/lib/gotrue'
import type { ActiveSession, LoginAudit } from '@/lib/types'
import { useModalStore } from '@/stores/modalStore'
import type { User } from '@supabase/gotrue-js'
import { clsx } from 'clsx'
import dayjs from 'dayjs'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const user = ref<User>()
const loginHistory = ref<LoginAudit[]>([])
const activeSessions = ref<ActiveSession[]>([])
const at = ref('')
const route = useRoute()
const router = useRouter()

const pageState = ref<'metadata' | 'login-history' | 'active-sessions'>('metadata')

const showActions = ref(false)
const showUserRaw = ref(false)

const modalStore = useModalStore()

const banned_until = computed(() => {
  return (user.value as any)?.banned_until as string | undefined
})

onMounted(async () => {
  await fetchInitialData()
})

async function fetchInitialData() {
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
    at.value = authResponse.data.session.access_token
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
}

async function invalidateAllSessionsTrigger() {
  modalStore.onAccept = async () => {
    await invalidateAllSessions();
    await fetchInitialData()
  }

  modalStore.onReject = () => { }

  modalStore.title = 'Invalidate all user session.';
  modalStore.body = 'User will be logged out from all devices.'
  modalStore.acceptButton = 'Invalidate'
  modalStore.rejectButton = 'Cancel';

  modalStore.open();
}

async function invalidateAllSessions() {
  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/logout/all/${user.value?.id}`, {
      headers: {
        Authorization: `Bearer ${at.value}`
      }
    })
    if (!resp.ok) {
      console.log(`received non-positive response from the server: ${resp.status}`)
    }
  } catch (e) {
    console.error(e)
  }
}

async function updateUserTrigger() {
  modalStore.onAccept = async () => {
    await updateUser();
    await fetchInitialData()
  }

  modalStore.onReject = () => { }

  modalStore.title = 'Update user';
  modalStore.body = 'User data will be update.'
  modalStore.acceptButton = 'Update'
  modalStore.rejectButton = 'Cancel';

  modalStore.open();
}

async function updateUser() {
  if (!user.value?.id) return
  const payload = {
    email: user.value.email,
    phone: user.value.phone,
    role: user.value.role,
    aud: user.value.aud,
    user_metadata: user.value.user_metadata
  }

  console.log('updating user with data: ', payload)

  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/users/${user.value?.id}`, {
      headers: {
        Authorization: `Bearer ${at.value}`,
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    if (!resp.ok) {
      console.log(`[USER UPDATE] received non-positive response from the server: ${resp.status}`)
    }
  } catch (e) {
    console.error(e)
  }
}

async function sendPasswordRecoveryTrigger() {
  modalStore.onAccept = async () => {
    await sendPasswordRecovery();
    await fetchInitialData()
  }

  modalStore.onReject = () => { }

  modalStore.title = 'Send password revovery';
  modalStore.body = 'User will receive password recovery on email.'
  modalStore.acceptButton = 'Send'
  modalStore.rejectButton = 'Cancel';

  modalStore.open();
}


async function sendPasswordRecovery() {
  if (!user.value) return

  try {
    const resp = await fetch(`http://127.0.0.1:9999/recover`, {
      headers: {
        Authorization: `Bearer ${at.value}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        email: user.value.email
      })
    })
    if (!resp.ok) {
      console.log(
        `[SEND PASSWORD RECOVERY] received non-positive response from the server: ${resp.status}`
      )
    }
  } catch (e) {
    console.error(e)
  }
}

async function sendMagicLinkTrigger() {
  modalStore.onAccept = async () => {
    await sendPasswordRecovery();
    await fetchInitialData()
  }

  modalStore.onReject = () => { }

  modalStore.title = 'Send magic link';
  modalStore.body = 'User will receive magic link on email.'
  modalStore.acceptButton = 'Send'
  modalStore.rejectButton = 'Cancel';

  modalStore.open();
}

async function sendMagicLink() {
  if (!user.value) return

  try {
    const resp = await fetch(`http://127.0.0.1:9999/magiclink`, {
      headers: {
        Authorization: `Bearer ${at.value}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        email: user.value.email
      })
    })
    if (!resp.ok) {
      console.log(
        `[SEND MAGIC LINK] received non-positive response from the server: ${resp.status}`
      )
    }
  } catch (e) {
    console.error(e)
  }
}

async function invokeBanDialog() {
  const banDuration = banned_until.value ? 0 : 24;
  const isUserBanned = banDuration === 0;

  modalStore.onAccept = async () => {
    await banUser(banDuration);
    await fetchInitialData()
  }

  modalStore.onReject = () => { }

  modalStore.title = isUserBanned ? "Unban user" : 'Ban user';
  modalStore.body = isUserBanned ? 'Action will unban selected user.' : "Action will ban selecter user for 24 hours."
  modalStore.acceptButton = isUserBanned ? 'Unban' : 'Ban';
  modalStore.rejectButton = 'Cancel';

  modalStore.open();
}

async function banUser(durationHours: number) {
  if (!user.value?.id) return
  const payload = {
    ban_duration: durationHours > 0 ? `${durationHours}h` : `none`
  }

  console.log('updating user with data: ', payload)

  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/users/${user.value?.id}`, {
      headers: {
        Authorization: `Bearer ${at.value}`,
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    if (!resp.ok) {
      console.log(`[BAN USER] received non-positive response from the server: ${resp.status}`)
    }
  } catch (e) {
    console.error(e)
  }
}

async function deleteUserTrigger() {
  modalStore.onAccept = async () => {
    const deletionSucceed = await deleteUser();
    if (deletionSucceed) {
      await router.push("/")
    }
  }

  modalStore.onReject = () => { }

  modalStore.title = 'Delete user';
  modalStore.body = 'User will deleted permanently. This operation is irreversible!.'
  modalStore.acceptButton = 'Delete'
  modalStore.rejectButton = 'Cancel';

  modalStore.open();
}


async function deleteUser(): Promise<boolean> {
  if (!user.value?.id) return false;

  try {
    const resp = await fetch(`http://127.0.0.1:9999/admin/users/${user.value?.id}`, {
      headers: {
        Authorization: `Bearer ${at.value}`,
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })
    if (!resp.ok) {
      console.log(`[DELETE USER] received non-positive response from the server: ${resp.status}`)
      return false;
    }

  } catch (e) {
    console.error(e)
  }

  return true;
}

function removeMFAFactors() {
  alert('TODO')
}
</script>

<template>
  <main class="container mx-auto pb-10">
    <div class="flex gap-2 items-center">
      <RouterLink to="/">
        <IconArrowLeftVue class="btn btn-square"></IconArrowLeftVue>
      </RouterLink>
      <h1 class="text-3xl font-semibold my-10">User Details</h1>
    </div>

    <div class="p-4 bg-base-100 rounded-md flex justify-between">
      <div class="flex gap-2">
        <button :class="clsx('btn', {
          'btn-ghost': pageState !== 'metadata',
          'btn-secondary': pageState === 'metadata'
        })
          " @click="pageState = 'metadata'">
          Metadata
        </button>
        <button :class="clsx('btn', {
          'btn-ghost': pageState !== 'login-history',
          'btn-secondary': pageState === 'login-history'
        })
          " @click="pageState = 'login-history'">
          Login history
        </button>
        <button :class="clsx('btn', {
          'btn-ghost': pageState !== 'active-sessions',
          'btn-secondary': pageState === 'active-sessions'
        })
          " @click="pageState = 'active-sessions'">
          Active sessions
        </button>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost" @click="invalidateAllSessionsTrigger">
          Invalidate all sessions
        </button>
        <div class="h-full w-[1px] bg-base-300 mx-2"></div>
        <button class="btn btn-primary w-[140px]" @click="showActions = !showActions">
          {{ showActions ? 'hide actions' : 'actions' }}
        </button>
      </div>
    </div>

    <div v-if="showActions" class="p-4 bg-base-100 rounded-md flex justify-between mt-2">
      <div class="gap-2">
        <button class="btn btn-ghost" @click="sendPasswordRecoveryTrigger">Send Reset password</button>
        <button class="btn btn-ghost" @click="sendMagicLinkTrigger">Send magic link</button>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-error" @click="removeMFAFactors">Remove MFA factors</button>
        <button class="btn btn-error" @click="invokeBanDialog">
          {{ !!banned_until ? 'Unban user' : 'Ban user' }}
        </button>
        <div class="h-full w-[1px] bg-base-300 mx-2"></div>
        <button class="btn btn-error" @click="deleteUser">Delete user</button>
      </div>
    </div>

    <div v-if="pageState === 'metadata' && user?.id">
      <div class="p-4 bg-base-100 rounded-md flex flex-col gap-1 mt-2">
        <div class="flex justify-between w-full items-center">
          <div class="flex">
            <div class="w-[200px]">ID:</div>
            <div>{{ user.id }}</div>
          </div>
          <button class="btn btn-secondary" @click="updateUserTrigger">Save changes</button>
        </div>

        <div class="flex">
          <div :class="clsx('w-[200px]', {
            'text-error': !!banned_until
          })
            ">
            Banned until:
          </div>
          <div class="text-error">
            {{ banned_until ? dayjs(banned_until).format('DD.MM.YYYY HH:mm') : '' }}
          </div>
        </div>

        <div class="flex">
          <div class="w-[200px]">Last sign in at:</div>
          <div>{{ dayjs(user.last_sign_in_at).format('DD.MM.YYYY HH:mm') }}</div>
        </div>

        <div class="flex items-center">
          <div class="w-[200px]">Email:</div>
          <input type="text" class="input input-bordered" v-model="user.email" />
        </div>

        <div class="flex">
          <div class="w-[200px]">Email confirmed at:</div>
          <div>{{ dayjs(user.email_confirmed_at).format('DD.MM.YYYY HH:mm') }}</div>
        </div>

        <div class="flex items-center">
          <div class="w-[200px]">Phone:</div>
          <input type="text" class="input input-bordered" v-model="user.phone" />
        </div>

        <div class="flex">
          <div class="w-[200px]">Phone confirmed at:</div>
          <div>{{ dayjs(user.phone_confirmed_at).format('DD.MM.YYYY HH:mm') }}</div>
        </div>

        <div class="flex">
          <div class="w-[200px]">Created at:</div>
          <div>{{ dayjs(user.created_at).format('DD.MM.YYYY HH:mm') }}</div>
        </div>

        <div class="flex">
          <div class="w-[200px]">Updated at:</div>
          <div>{{ dayjs(user.updated_at).format('DD.MM.YYYY HH:mm') }}</div>
        </div>

        <div class="flex items-center">
          <div class="w-[200px]">Role:</div>
          <input type="text" class="input input-bordered" v-model="user.role" />
        </div>

        <div class="flex items-center">
          <div class="w-[200px]">Audience:</div>
          <input type="text" class="input input-bordered" v-model="user.aud" />
        </div>

        <div class="flex flex-col gap-1">
          <div>User metadata:</div>
          <JsonEditor :initial-value="JSON.stringify(user.user_metadata, null, 2)" :key="user.id" @change="(e) => {
            if (!user) return
            try {
              user.user_metadata = JSON.parse(e)
            } catch (e) {
              console.log('failed to parse value from editor')
            }
          }
            " />
        </div>

        <button class="btn btn-secondary my-5" @click="showUserRaw = !showUserRaw">
          Show raw object
        </button>

        <pre v-if="showUserRaw">{{ user }}</pre>
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
              <td>{{ login.payload.traits?.provider }}</td>
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
