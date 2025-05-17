<!-- BoardDetailPage.vue -->
<template>
  <div class="board-detail-container">
    <BoardContent
      class="section-box"
      v-if="detail && detail.idx"
      :detail="detail"
      :myReaction="myReaction"
      :reaction="reaction"
      :boardType="boardType"
      @updateReaction="handleReaction"
    />

    <CommentSection
      class="section-box"
      v-if="boardType === 'community'"
      :communityIdx="Number(boardIdx)"
      :myMemberId="authStore.memberId"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/libs/axios";

import BoardContent from "@/components/board/BoardContent.vue";
import CommentSection from "@/components/board/CommentSection.vue";

const props = defineProps({
  boardType: {
    type: String,
    required: true,
  },
  id: {
    type: [String, Number],
    required: true,
  },
});

const boardIdx = props.id;
const authStore = useAuthStore();
const router = useRouter();

const detail = ref({});
const myReaction = ref(null);
const reaction = ref({ like: 0, disLike: 0 });

const fetchDetail = async () => {
  const res = await api.get(`/${props.boardType}/${boardIdx}`);
  detail.value = res.data;
};

const fetchReactionCount = async () => {
  if (props.boardType !== "community") return;
  try {
    const res = await api.get(`/community/${boardIdx}/likeDisLike`);
    reaction.value = res.data.totalLikeDisLike || { like: 0, disLike: 0 };
  } catch (err) {
    console.error("좋아요/싫어요 수치 가져오기 실패:", err);
  }
};

const fetchMyReaction = async () => {
  if (!authStore.isLoggedIn || props.boardType !== "community") return;
  const res = await api.get(`/community/member/likeDisLike/${boardIdx}`);
  myReaction.value =
    res.data === "" || res.data === undefined ? null : res.data;
};

const handleReaction = async (flag) => {
  if (!authStore.isLoggedIn) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  try {
    if (myReaction.value === flag) {
      await api.delete(`/community/member/likeDisLike/${boardIdx}`);
      myReaction.value = null;
    } else {
      if (myReaction.value !== null) {
        await api.delete(`/community/member/likeDisLike/${boardIdx}`);
      }
      await api.post(`/community/member/likeDisLike/${boardIdx}`, {
        likeFlag: flag,
      });
      myReaction.value = flag;
    }

    await fetchReactionCount(); // 수치만 갱신
  } catch (err) {
    console.error("반응 처리 실패:", err);
  }
};

onMounted(() => {
  fetchDetail();
  fetchReactionCount();
  if (authStore.isLoggedIn) {
    fetchMyReaction();
  }
});
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.board-detail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  background-color: var(--color-background);
  min-width: 80%;
  min-height: calc(100vh - 160px);
}

.section-box {
  width: 100%;
  max-width: 800px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-outline);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  color: var(--color-on-surface);
}
</style>
