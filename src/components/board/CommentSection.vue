<template>
  <div class="comments">
    <h3>댓글</h3>

    <!-- 댓글 작성 폼 -->
    <form @submit.prevent="submitComment" class="comment-form">
      <textarea
        v-model="newComment"
        :placeholder="
          authStore.isLoggedIn
            ? '댓글을 입력하세요'
            : '댓글 작성을 하려면 로그인이 필요합니다.'
        "
        rows="3"
      />
      <button type="submit" :disabled="!authStore.isLoggedIn">댓글 등록</button>
    </form>

    <!-- 댓글 목록 -->
    <div v-if="comments.length === 0" class="no-comment">댓글이 없습니다.</div>
    <ul v-else>
      <CommentItem
        v-for="comment in comments"
        :key="comment.idx"
        :comment="comment"
        :myMemberId="myMemberId"
        :editingCommentId="editingCommentId"
        :editingCommentText="editingCommentText"
        :myRole="authStore.role"
        @toggle-blind="handleToggleBlind"
        @edit="editComment"
        @cancel="cancelEdit"
        @save="saveEditedComment"
        @delete="deleteComment"
      />
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/libs/axios";
import { useAuthStore } from "@/stores/auth";
import CommentItem from "@/components/board/CommentItem.vue";

const props = defineProps({
  communityIdx: [Number, String], // ← 문자열 가능성도 고려
  myMemberId: String,
  boardType: {
    type: String,
    default: "community", // 'notice' or 'community'
  },
});

const authStore = useAuthStore();
const comments = ref([]);
const newComment = ref("");

const editingCommentId = ref(null);
const editingCommentText = ref("");

// 댓글 목록 불러오기
const fetchComments = async () => {
  const endpoint =
    props.boardType === "notice"
      ? `/noticeComment/${props.communityIdx}`
      : `/community/comment/${props.communityIdx}`;
  try {
    const res = await api.get(endpoint);
    comments.value =
      props.boardType === "notice"
        ? res.data.content || []
        : res.data.commentList?.content || [];
    console.log("[댓글 목록]", comments.value);
  } catch (err) {
    console.error("댓글 불러오기 실패:", err);
  }
};

// 댓글 등록
const submitComment = async () => {
  if (!authStore.isLoggedIn || !newComment.value.trim()) return;
  const endpoint =
    props.boardType === "notice"
      ? `/noticeComment/member/post/${props.communityIdx}`
      : `/community/member/comment/${props.communityIdx}`;
  try {
    await api.post(endpoint, {
      comment: newComment.value,
      memberId: props.myMemberId,
      noticeIdx: props.communityIdx
    });
    newComment.value = "";
    await fetchComments();
  } catch (err) {
    console.error("댓글 등록 실패:", err);
  }
};

// 댓글 수정 모드 진입
const editComment = (commentIdx) => {
  const target = comments.value.find((c) => c.idx === commentIdx);
  if (target) {
    editingCommentId.value = commentIdx;
    editingCommentText.value = target.comment;
  }
};

// 수정 취소
const cancelEdit = () => {
  editingCommentId.value = null;
  editingCommentText.value = "";
};

// 수정 저장
const saveEditedComment = async (commentIdx, newText) => {
  if (!newText.trim()) return alert("댓글 내용을 입력해주세요.");

  const endpoint =
    props.boardType === "notice"
      ? `/noticeComment/member/edit/${commentIdx}`
      : `/community/member/comment/edit/${commentIdx}`;
  try {
    await api.put(endpoint, {
      idx: commentIdx,
      comment: newText,
      memberId: props.myMemberId,
    });
    console.log(newText);
    editingCommentId.value = null;
    editingCommentText.value = "";
    await fetchComments();
  } catch (err) {
    console.error("댓글 수정 실패:", err);
  }
};

// 댓글 삭제
const deleteComment = async (commentIdx) => {
  if (!confirm("댓글을 삭제하시겠습니까?")) return;
  const endpoint =
    props.boardType === "notice"
      ? `/noticeComment/member/delete/${commentIdx}`
      : `/community/member/comment/delete/${commentIdx}`;
  try {
    await api.put(endpoint, {
      memberId: props.myMemberId,
    });
    await fetchComments();
  } catch (err) {
    console.error("댓글 삭제 실패:", err);
  }
};

const handleToggleBlind = async (commentIdx, currentBlind) => {
  const targetBlind = currentBlind === 1 ? false : true;
  const endpoint =
    props.boardType === "notice"
      ? `/noticeComment/admin/blind/${commentIdx}`
      : `/community/admin/comment/blind/${commentIdx}`;
  try {
    await api.put(endpoint, targetBlind);
    alert(
      targetBlind === true
        ? "댓글이 숨김 처리되었습니다."
        : "숨김이 해제되었습니다."
    );
    await fetchComments(); // 갱신
  } catch (err) {
    alert("댓글 숨김 처리 실패");
  }
};

onMounted(() => {
  fetchComments();
});
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.comments {
  margin-top: 0.5rem;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: var(--color-on-surface);
  }

  .comment-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;

    textarea {
      resize: none;
      padding: 0.75rem;
      border: 1px solid var(--color-outline);
      border-radius: 6px;
      font-size: 0.95rem;
    }

    button {
      align-self: flex-end;
      padding: 0.4rem 1rem;
      background-color: var(--color-primary);
      color: var(--color-on-primary);
      border: none;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background-color: var(--color-primary-container);
        color: var(--color-on-primary-container);
      }
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .no-comment {
    font-size: 0.9rem;
    color: var(--color-on-surface-variant);
  }
}
</style>
