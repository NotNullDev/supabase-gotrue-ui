<script setup lang="ts">
import type { User } from '@supabase/gotrue-js';
import dayjs from 'dayjs';
import { computed, onMounted, ref } from 'vue';
import { auth } from '../lib/gotrue';

const users = ref<User[]>([])
const filters = ref({
  name: ''
})
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    let ok = true

    ok = u.email?.includes(filters.value.name) ?? false
    if (ok) return true

    ok = u.role?.includes(filters.value.name) ?? false
    if (ok) return true

    ok = u.aud?.includes(filters.value.name) ?? false
    if (ok) return true

    return false
  })
})
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

function toggleMarkToDeleteAll(user: User, shouldDelete = false) { }
</script>

<template>
  <main class="container mx-auto">
    <h1 class="text-3xl font-semibold my-10">Users</h1>

    <div class="rounded-md bg-base-100 p-4 my-4 flex justify-between">
      <div>
        <input type="search" class="input input-bordered input-sm" placeholder="Search" v-model="filters.name" />
      </div>
      <div class="flex gap-4">
        <RouterLink to="create-user" class="btn btn-primary">new user</RouterLink>
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
            <th>Phone</th>
            <th>Provider</th>
            <th>Last sign in</th>
            <th>Role</th>
            <th>Audition</th>
            <th>Created at</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <!-- row 1 -->
          <tr v-for="user in filteredUsers" :key="user.id">
            <th>
              <label>
                <input type="checkbox" class="checkbox" @input="(e) => {
                  console.log(e)
                  toggleMarkToDelete(user, (e.currentTarget as HTMLInputElement).checked)
                }
                  " />
              </label>
            </th>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.app_metadata.provider }}</td>
            <td>{{ dayjs(user.last_sign_in_at).format('DD.MM.YYYY HH:mm') }}</td>
            <td>
              {{ user.role }}
            </td>
            <td>
              {{ user.aud }}
            </td>
            <td>{{ dayjs(user.created_at).format('DD.MM.YYYY HH:mm') }}</td>
            <th>
              <RouterLink :to="`/users/${user.id}`" class="btn btn-secondary btn-xs">more</RouterLink>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
