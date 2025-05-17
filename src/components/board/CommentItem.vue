<template>
    <li class="comment-item">
        <div class="comment-meta">
        <span
            class="writer"
            :class="{ admin: comment.role === 'ADMIN' || comment.role === 'MASTER' }"
        >
            {{ comment.role === 'ADMIN' || comment.role === 'MASTER' ? '관리자' : comment.memberId }}
        </span>
        <span class="date">{{ formatDateTime(comment.createdAt) }}</span>
        </div>

        <div v-if="editing" class="comment-edit-form">
        <textarea v-model="localEditingText" rows="3" />
        <div class="edit-actions">
            <button @click="handleSave">저장</button>
            <button @click="$emit('cancel')">취소</button>
        </div>
        </div>

        <div v-else class="comment-text">{{ comment.comment }}</div>

        <div
        class="comment-actions"
        v-if="comment.memberId === myMemberId && !editing"
        >
        <button @click="$emit('edit', comment.idx)">수정</button>
        <button @click="$emit('delete', comment.idx)">삭제</button>
        </div>
    </li>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
    comment: Object,
    myMemberId: String,
    editingCommentId: [Number, null],
    editingCommentText: String
})

const emit = defineEmits(['edit', 'delete', 'save', 'cancel'])

// 현재 댓글이 수정 중인지 판단
const editing = computed(() => props.editingCommentId === props.comment.idx)

// 로컬 편집 텍스트
const localEditingText = ref('')

// props가 변경될 때 localEditingText를 동기화
watch(
    () => [props.editingCommentId, props.editingCommentText],
    ([newId, newText]) => {
        if (newId === props.comment.idx) {
        localEditingText.value = newText
        }
    },
    { immediate: true }
)

// 저장 시 상위 컴포넌트로 전달
const handleSave = () => {
    console.log("수정한 댓글 : ", localEditingText.value)
    emit('save', props.comment.idx, localEditingText.value)
}

const formatDateTime = (dateStr) => {
    const date = new Date(dateStr)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.comment-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--color-outline);
    list-style: none;

    .comment-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.85rem;
        color: var(--color-on-surface-variant);

        .writer {
        font-weight: bold;
        color: var(--color-primary);

        &.admin {
            color: var(--color-on-surface);
        }
        }
    }

    .comment-text {
        font-size: 0.95rem;
        color: var(--color-on-surface);
        margin-top: 0.3rem;
    }

    .comment-edit-form {
        margin-top: 0.5rem;

        textarea {
        width: 100%;
        resize: none;
        border: 1px solid var(--color-outline);
        border-radius: 6px;
        padding: 0.5rem;
        font-size: 0.9rem;
        }

        .edit-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;

        button {
            background-color: var(--color-primary-container);
            color: var(--color-on-primary-container);
            border: none;
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            font-size: 0.8rem;
            cursor: pointer;

            &:hover {
            background-color: var(--color-primary);
            color: white;
            }
        }
        }
    }

    .comment-actions {
        margin-top: 0.3rem;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;

        button {
        background: none;
        border: none;
        font-size: 0.8rem;
        color: var(--color-secondary);
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
        }
    }
}
</style>
