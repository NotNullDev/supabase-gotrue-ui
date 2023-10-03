<script setup lang="ts">
import { useModalStore } from '@/stores/modalStore';
import clsx from 'clsx';

defineProps({
  title: { required: true, type: String }
})

const modalStore = useModalStore()

</script>

<template>
  <Teleport to="body">
    <Transition>
      <div v-if="modalStore.isOpen" :class="clsx('w-[300px] bg-base-200/40 rounded-md shadow shadow-base-300 border border-base-100',
        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        'flex flex-col'
      )">
        <header class="p-2 text-xl font-semibold">{{ modalStore.title }}</header>
        <main class="flex-1 px-4 py-2">
          <component v-if="!(typeof modalStore.body === 'string')" :is="modalStore.body"></component>
          <div v-else>{{ modalStore.body }}</div>
        </main>
        <footer class="justify-end w-full flex p-2 gap-2">
          <button class="btn btn-secondary" @click="() => {
            modalStore.close();
            modalStore.onAccept();
          }">{{ modalStore.acceptButton }}</button>
          <button class="btn btn-ghost" @click="() => {
            modalStore.close();
            modalStore.onReject();
          }">{{ modalStore.rejectButton }}</button>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>