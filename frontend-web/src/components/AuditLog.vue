<script setup lang="ts">
import type { Audit } from '@/lib/types';
import dayjs from 'dayjs';
import { ref } from 'vue';

const props = defineProps<{
    log: Audit
}>()

const showRawValue = ref(false);

</script>

<template>
    <div class="flex gap-2 items-center justify-between">
        <div class="flex gap-2">
            <div>Activity:</div>
            <div>[{{ log.payload.action }}]</div>
            <div>at {{ dayjs(log.created_at).format("MM.DD.YYYY HH:mm") }}</div>
            <div>from IP: [{{ log.ip_address ? log.ip_address : 'Unknown' }}]</div>
        </div>
        <button class="btn btn-secondary w-min" @click="showRawValue = !showRawValue">Details</button>
    </div>


    <pre class="whitespace-pre" v-if="showRawValue">
        {{ JSON.stringify(props.log, null, 2) }}
    </pre>
</template>