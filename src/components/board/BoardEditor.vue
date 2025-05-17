<template>
    <div class="community-editor">
        <input v-model="title" placeholder="제목을 입력하세요" class="title-input" />

        <div ref="quillEditor" class="quill-editor"></div>

        <button @click="submitPost">작성 완료</button>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const title = ref('')
const content = ref('')
const quillEditor = ref(null)
let quillInstance = null

onMounted(() => {
    quillInstance = new Quill(quillEditor.value, {
        theme: 'snow',
        placeholder: '내용을 입력하세요',
        modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
        ]
        }
    })
})

const submitPost = async () => {
    content.value = quillInstance.root.innerHTML

    try {
        await api.post('/community/create', {
        title: title.value,
        content: content.value
        })
        alert('게시물이 등록되었습니다.')
        // router.push('/communities')
    } catch (err) {
        console.error('게시물 작성 실패:', err)
        alert('등록 중 오류 발생')
  }
}
</script>

<style scoped>
.title-input {
    width: 100%;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
}
.quill-editor {
    height: 300px;
    margin-bottom: 1.5rem;
}
</style>
