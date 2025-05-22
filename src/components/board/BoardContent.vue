<template>
  <div class="detail-card">
    <router-link :to="listPath" class="back-link"
      >← 게시물 목록으로</router-link
    >
    <h2 class="title">{{ detail?.title || "제목 없음" }}
    <span v-if="authStore.role === 'ADMIN' || authStore.role === 'MASTER'">
      <span v-if="detail?.blind === 1" class="blind-tag">[숨김됨]</span>
    </span>
    </h2>
    <div class="meta-info">
      <span>작성자: {{ detail?.memberId || "작성자 없음" }}</span>
      <span>작성일: {{ formatDate(detail?.createdAt) }}</span>
      <span>조회수 {{ detail?.views ?? 0 }}회</span>
    </div>

    <div class="content" v-html="formattedContent"></div>

    <div class="reactions" v-if="boardType === 'community'">
      <button
        class="reaction-btn"
        @click="$emit('update-reaction', 1)"
        :class="{ active: myReaction === 1 }"
      >
        👍 <span>{{ reaction?.like ?? 0 }}</span>
      </button>
      <button
        class="reaction-btn"
        @click="$emit('update-reaction', 0)"
        :class="{ active: myReaction === 0 }"
      >
        👎 <span>{{ reaction?.disLike ?? 0 }}</span>
      </button>
    </div>

    <div class="post-actions" v-if="isMyPost">
      <button @click="onEdit">수정</button>
      <button @click="onDelete">삭제</button>
    </div>
    <div
      class="admin-actions"
      v-if="
        props.boardType === 'community' &&
        (authStore.role === 'ADMIN' || authStore.role === 'MASTER')
      "
    >
      <button @click="toggleBlind">
        {{ detail?.blind === 1 ? "숨김 해제" : "숨김 처리" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import api from "@/libs/axios";

const props = defineProps({
  detail: Object,
  myReaction: Number,
  reaction: Object,
  boardType: {
    type: String,
    default: "community", // 'notice' or 'community'
  },
});

const emit = defineEmits(["update-reaction", "update-blind"]);

const authStore = useAuthStore();
const router = useRouter();
const isMyPost = computed(() => props.detail?.memberId === authStore.memberId);
const boardIdx = props.detail?.idx;

const listPath = computed(
  () => `/${props.boardType === "notice" ? "notices" : "communities"}`
);
const editPath = computed(() => `${listPath.value}/edit/${boardIdx}`);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

const formattedContent = computed(
  () => props.detail?.content?.replace(/\n/g, "<br />") || ""
);

const toggleBlind = async () => {
  const targetBlind = props.detail.blind === 1 ? 0 : 1; // 숫자 0 또는 1로 보냄
  try {
    await api.put(`/${props.boardType}/admin/blind/${boardIdx}`, targetBlind);
    alert(
      targetBlind === 1
        ? "게시물이 숨김 처리되었습니다."
        : "숨김이 해제되었습니다."
    );
    emit("update-blind", targetBlind); // 부모에게도 숫자로 전달
  } catch (err) {
    console.error("숨김 처리 에러:", err);
    alert("숨김 처리 중 오류가 발생했습니다.");
  }
};

const onEdit = () => {
  router.push(editPath.value);
};

const onDelete = async () => {
  if (!confirm("정말 게시물을 삭제하시겠습니까?")) return;
  const endpoint =
    props.boardType === "notice"
      ? `/notice/admin/delete/${boardIdx}`
      : `/community/member/delete/${boardIdx}`;
  try {
    await api.put(endpoint);
    alert("게시물이 삭제되었습니다.");
    router.push(listPath.value);
  } catch (err) {
    console.error("게시물 삭제 실패:", err);
    alert("게시물 삭제 중 오류가 발생했습니다.");
  }
};
</script>

<style lang="scss" scoped>
@use "@/styles/theme" as *;
.detail-card {
  width: 100%;
  max-width: 800px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  color: var(--color-on-surface);
}
.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}
.meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  font-size: 0.95rem;
  color: var(--color-on-surface-variant);
  margin-bottom: 1rem;
}
.reactions {
  display: flex;
  gap: 1rem;
  font-size: 1rem;
  color: var(--color-primary);
  margin-top: 1.5rem;
}
.reaction-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--color-primary);
  transition: transform 0.1s;
}
.reaction-btn:hover {
  transform: scale(1.1);
}
.reaction-btn.active {
  font-weight: bold;
  transform: scale(1.1);
}
.content {
  font-size: 1rem;
  line-height: 1.7;
  white-space: pre-wrap;
  min-height: 200px;
}
.post-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
.post-actions button {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: var(--color-secondary);
  cursor: pointer;
}
.post-actions button:hover {
  text-decoration: underline;
}

.admin-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;

  button {
    background-color: var(--color-outline);
    border: none;
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;

    &:hover {
      background-color: var(--color-secondary-container);
    }
  }
}

.title {
  .blind-tag {
    margin-left: 0.5rem;
    font-size: 0.9rem;
    color: red;
    font-weight: bold;
  }
}
</style>
