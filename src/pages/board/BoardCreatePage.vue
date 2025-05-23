<template>
  <div class="community-editor">
    <h2>{{ boardType === "notice" ? "공지사항 작성" : "게시물 작성" }}</h2>
    <input
      v-model="title"
      placeholder="제목을 입력하세요"
      class="title-input"
    />
    <div ref="quillEditor" class="quill-editor"></div>
    <button @click="submitPost">작성 완료</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import api from "@/libs/axios";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const boardType = route.path.includes("/notices") ? "notice" : "community";

const auth = useAuthStore();
const { role, isLoggedIn } = storeToRefs(auth);

const title = ref("");
const content = ref("");
const quillEditor = ref(null);
let quillInstance = null;

onMounted(() => {
  if (!isLoggedIn.value) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  // 자유 게시판은 사용자(일반 사용자, 멤버십 사용자)만, 공지사항은 관리자만 가능
  if (
    (boardType === "notice" &&
      !(role.value === "ADMIN" || role.value === "MASTER")) ||
    (boardType === "community" && !(role.value !== "USER" || role.value === "MASTER"))
  ) {
    alert("작성 권한이 없습니다.");
    router.push("/");
    return;
  }

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
});

const submitPost = async () => {
  content.value = quillInstance.root.innerHTML;

  if (!title.value.trim() || !content.value.trim()) {
    alert("제목과 내용을 모두 입력해주세요.");
    return;
  }

  const endpoint =
    boardType === "notice" ? "/notice/admin/post" : "/community/member/post";
  const redirectPath = boardType === "notice" ? "/notices" : "/communities";

  try {
    await api.post(endpoint, {
      title: title.value,
      content: content.value,
    });
    alert("게시물이 등록되었습니다.");
    router.push(redirectPath);
  } catch (err) {
    console.error("게시물 작성 실패:", err);
    alert("등록 중 오류가 발생했습니다.");
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
