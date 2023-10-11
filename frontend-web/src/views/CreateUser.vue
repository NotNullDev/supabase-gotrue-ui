<script setup lang="ts">
import { auth } from '@/lib/gotrue';
import { useModalStore } from '@/stores/modalStore';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const modalStore = useModalStore();
const router = useRouter();


const newUser = ref<{
    email: string,
    password: string
}>({
    email: '',
    password: ''
})
const at = ref('')

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
    at.value = authResponse.data.session.access_token;
})


async function createUser() {
    const payload = {
        email: newUser.value.email,
        password: newUser.value.password
    }

    try {
        const resp = await fetch(`http://127.0.0.1:9999/admin/users`, {
            headers: {
                Authorization: `Bearer ${at.value}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
        if (!resp.ok) {
            console.log(`[BAN USER] received non-positive response from the server: ${resp.status}`)
            return;
        }
        await router.push('/')
    } catch (e) {
        console.error(e)
    }
}
</script>

<template>
    <form class="p-4 flex flex-col gap-2 mt-10 container mx-auto" @submit="(e) => {
        e.preventDefault()
    }">

        <input min="4" class="input input-bordered" type="email" placeholder="email" v-model="newUser.email" />
        <input min="4" class="input input-bordered" type="text" placeholder="password" v-model="newUser.password" />
        <label class="flex gap-2 items-center">
            <input type="checkbox" class="checkbox checkbox-sm checkbox-secondary" />
            <div>Confirm email (verification link won't be sent)</div>
        </label>
        <div class="flex gap-4 items-center mt-5 justify-end">
            <button class="btn btn-ghost w-min" @click="() => router.push('/')">Cancel</button>
            <button class="btn btn-secondary w-min" @click="createUser()">Create</button>
        </div>

    </form>
</template>