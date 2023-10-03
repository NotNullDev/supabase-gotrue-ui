import { defineStore } from "pinia";
import type { Component } from "vue";

export const useModalStore = defineStore('modalStore', {
    state: () => {
        return { isOpen: false, title: "Modal", acceptButton: "accept", rejectButton: "cancel", onAccept: () => { }, onReject: () => { }, body: "" as Component | string, result: "" as any }
    },
    actions: {
        open() {
            this.isOpen = true;
        },
        close() {
            this.isOpen = false;
        }
    }
})