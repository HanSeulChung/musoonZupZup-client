<template>
  <div class="community-editor">
    <h2>게시물 수정</h2>
    <input
      v-model="title"
      placeholder="제목을 입력하세요"
      class="title-input"
    />
    <div ref="quillEditor" class="quill-editor"></div>
    <button @click="submitEdit">수정 완료</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "@/libs/axios";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const route = useRoute();
const router = useRouter();
const communityIdx = Number(route.params.id);
const { memberId } = storeToRefs(auth);
const title = ref("");
const content = ref("");
const quillEditor = ref(null);
let quillInstance = null;

// 에디터 초기화 + 기존 게시물 데이터 불러오기
onMounted(async () => {
  // Quill 에디터 먼저 초기화
  quillInstance = new Quill(quillEditor.value, {
    theme: "snow",
    placeholder: "내용을 입력하세요",
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
    },
  });

  try {
    const res = await api.get(`/community/${communityIdx}`);
    title.value = res.data.title;
    content.value = res.data.content;
    quillInstance.root.innerHTML = content.value;
  } catch (err) {
    console.error("게시물 불러오기 실패:", err);
    alert("게시물 정보를 불러오는 데 실패했습니다.");
    router.push("/communities");
  }
});

const submitEdit = async () => {
  content.value = quillInstance.root.innerHTML;

  if (!title.value.trim() || !content.value.trim()) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  try {
    await api.put(`/community/member/edit`, {
      idx: communityIdx,
      memberId: memberId.value,
      title: title.value,
      content: content.value,
    });
    alert("게시물이 수정되었습니다.");
    router.push(`/community/${communityIdx}`);
  } catch (err) {
    console.error("게시물 수정 실패:", err);
    alert("수정 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped>
.community-editor {
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

h2 {
  margin-bottom: 1.2rem;
}

.title-input {
  width: 100%;
  font-size: 1.2rem;
  padding: 0.6rem;
  margin-bottom: 1rem;
  border: 1px solid var(--color-outline);
  border-radius: 6px;
}

.quill-editor {
  height: 300px;
  margin-bottom: 1.5rem;

  img {
    max-width: 300px;
    display: block;
    margin: 1rem auto;
  }
}

button {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
}
</style>
