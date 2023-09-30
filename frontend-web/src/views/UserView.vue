<script setup lang="ts">
import type { User } from '@supabase/gotrue-js'
import { onMounted, ref } from 'vue'
import { auth } from '../lib/gotrue'

const users = ref<User[]>([])
const usersToDelete = ref<User[]>([])

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
    const resp = await fetch('http://127.0.0.1:9999/admin/users', {
      headers: {
        Authorization: `Bearer ${authResponse.data.session.access_token}`
      }
    })
    users.value = (await resp.json()).users as User[]
    console.log(users.value)
  } catch (e) {
    console.error(e)
  }
})

function toggleMarkToDelete(user: User, shouldDelete = false) {
  if (shouldDelete) {
    usersToDelete.value.push(user)
  } else {
    usersToDelete.value = usersToDelete.value.filter((u) => u !== user)
  }
}
function toggleMarkToDeleteAll(user: User, shouldDelete = false) {}
</script>

<template>
  <main class="container mx-auto">
    <h1 class="text-3xl font-semibold my-10">Users</h1>

    <div class="rounded-md bg-base-100 p-4 my-4 flex justify-between">
      <div>
        <input type="search" class="input input-bordered input-sm" placeholder="Search" />
      </div>
      <div>
        <button class="btn btn-error" :disabled="usersToDelete.length === 0">
          delete {{ usersToDelete.length ? usersToDelete.length : '' }}
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="table bg-base-100">
        <!-- head -->
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" class="checkbox" />
              </label>
            </th>
            <th>Email</th>
            <th>Role</th>
            <th>Audition</th>
            <th>Created at</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr v-for="user in users" :key="user.id">
            <th>
              <label>
                <input
                  type="checkbox"
                  class="checkbox"
                  @input="
                    (e) => {
                      console.log(e)
                      toggleMarkToDelete(user, (e.currentTarget as HTMLInputElement).checked)
                    }
                  "
                />
              </label>
            </th>
            <td>
              {{ user.email }}
            </td>
            <td>
              {{ user.role }}
            </td>
            <td>
              {{ user.aud }}
            </td>
            <td>{{ user.created_at }}</td>
            <th>
              <RouterLink :to="`/users/${user.id}`" class="btn btn-ghost btn-xs"
                >details</RouterLink
              >
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
