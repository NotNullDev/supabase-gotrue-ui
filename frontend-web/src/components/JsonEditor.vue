<script setup lang="ts">
import { loader, VueMonacoEditor } from '@guolao/vue-monaco-editor'

import * as monaco from 'monaco-editor'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { ref, shallowRef, watchEffect } from 'vue'

const props = defineProps({
  initialValue: { type: String, required: false }
})
const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

self.MonacoEnvironment = {
  getWorker(_, label) {
    console.log('returning json worker')
    return new jsonWorker()
  }
}

loader.config({ monaco })

const MONACO_EDITOR_OPTIONS = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true
} as monaco.editor.IStandaloneEditorConstructionOptions

const code = ref(props.initialValue ?? '{}')
const editorRef = shallowRef()
const handleMount = (editor: any) => (editorRef.value = editor)

// your action
function formatCode() {
  editorRef.value?.getAction('editor.action.formatDocument').run()
}

watchEffect(() => {
  emit('change', code.value)
})
</script>

<template>
  <VueMonacoEditor
    v-model:value="code"
    height="200px"
    language="json"
    theme="vs-dark"
    :options="MONACO_EDITOR_OPTIONS"
    @mount="handleMount"
  />
</template>
