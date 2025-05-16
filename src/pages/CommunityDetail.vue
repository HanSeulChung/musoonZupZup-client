<template>
    <div class="community-detail-container">
        <div class="detail-card">
        <router-link to="/communities" class="back-link">← 게시물 목록으로</router-link>
        <h2 class="title">{{ detail?.title || '제목 없음' }}</h2>

        <div class="meta-info">
            <span>작성자: {{ detail?.memberId || '작성자 없음' }}</span>
            <span>작성일: {{ formatDate(detail?.createdAt) }}</span>
            <span>조회수 {{ detail?.views ?? 0 }}회</span>
        </div>

        <div class="content" v-html="formattedContent"></div>

        <div class="reactions">
            <button
                class="reaction-btn"
                @click="handleReaction(1)"
                :class="{ active: myReaction === 1 }"
            >
                👍 <span>{{ detail?.like ?? 0 }}</span>
            </button>
            <button
                class="reaction-btn"
                @click="handleReaction(0)"
                :class="{ active: myReaction === 0 }"
            >
                👎 <span>{{ detail?.disLike ?? 0 }}</span>
            </button>
        </div>

        <!-- 댓글 영역 시작 -->
        <div class="comments">
            <h3>댓글</h3>
            <!-- 댓글 작성 폼 -->
            <form @submit.prevent="submitComment" class="comment-form">
            <textarea
                v-model="newComment"
                :placeholder="authStore.isLoggedIn ? '댓글을 입력하세요' : '댓글 작성을 하려면 로그인이 필요합니다.'"
                rows="3"
            />
            <button type="submit" :disabled="!authStore.isLoggedIn">댓글 등록</button>
            </form>

            <!-- 댓글 목록 -->
            <div v-if="comments.length === 0" class="no-comment">댓글이 없습니다.</div>
            <ul v-else>
                <li v-for="c in comments" :key="c.idx" class="comment-item">
                <div class="comment-meta">
                    <span
                    class="writer"
                    :class="{ admin: c.role === 'ADMIN' || c.role === 'MASTER' }"
                    >
                    {{ c.role === 'ADMIN' || c.role === 'MASTER' ? '관리자' : c.memberId }}
                    </span>
                    <span class="date">{{ formatDateTime(c.createdAt) }}</span>
                </div>

                <!-- 수정 중일 때 -->
                <div v-if="editingCommentId === c.idx" class="comment-edit-form">
                    <textarea
                    v-model="editingCommentText"
                    rows="3"
                    />
                    <div class="edit-actions">
                    <button @click="saveEditedComment(c.idx)">저장</button>
                    <button @click="cancelEdit">취소</button>
                    </div>
                </div>

                <!-- 일반 표시 -->
                <div v-else class="comment-text">{{ c.comment }}</div>

                <div class="comment-actions" v-if="c.memberId === myMemberId && editingCommentId !== c.idx">
                    <button @click="editComment(c.idx)">수정</button>
                    <button @click="deleteComment(c.idx)">삭제</button>
                </div>
                </li>
            </ul>
        </div>
        <!-- 댓글 영역 끝 -->
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/libs/axios'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const route = useRoute()
const detail = ref({})

const communityIdx = route.params.id;
const myMemberId = ref(authStore.memberId || '')

const fetchDetail = async () => {
    try {
        const res = await api.get(`/community/${communityIdx}`);
        detail.value = res.data.communityDetail
    } catch (err) {
        console.error('상세글 조회 실패:', err);
    }
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

// 개행 문자를 <br>로 변환 (단순 표현용)
// TODO: front editor 입력시 개행 문자도 같이 저장할지 판단 후 없애던지 해야함
const formattedContent = computed(() =>
    detail.value.content?.replace(/\n/g, '<br />') || ''
)
// 좋아요, 싫어요 관리
const myReaction = ref(null); // 0 = 싫어요, 1 = 좋아요, null = 안누름

const fetchReaction = async () => {
    if (!authStore.isLoggedIn) return;
    console.log("fetchReaction start!")
    try {
        const res = await api.get(`/community/member/likeDisLike/${communityIdx}`);
        myReaction.value = res.data === '' || res.data === undefined ? null : res.data;
        console.log("myReaction.value: ", myReaction.value)
    } catch (err) {
        console.error('사용자 반응 정보 조회 실패:', err);
    }
};

const handleReaction = async (flag) => {
    if (!authStore.isLoggedIn) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
    }

    try {
        if (myReaction.value === flag) {
        // 이미 눌렀던 값이면 취소 (DELETE)
        console.log('[Reaction] current:', myReaction.value, 'flag:', flag);

        await api.delete(`/community/member/likeDisLike/${communityIdx}`);
        myReaction.value = null;
        } else {
        // 반대 반응을 누른 경우: 기존 반응 삭제 후 새 반응 등록
        if (myReaction.value !== null) {
            console.log('[Reaction] current:', myReaction.value, 'flag:', flag);

            await api.delete(`/community/member/likeDisLike/${communityIdx}`);
        }
        console.log('[Reaction] current:', myReaction.value, 'flag:', flag);

        await api.post(`/community/member/likeDisLike/${communityIdx}`, {
            likeFlag: flag
        });

        myReaction.value = flag;
        }

        await fetchDetail(); // 수치 갱신
    } catch (err) {
        console.error('반응 처리 실패:', err);
    }
};


// 댓글
const comments = ref([]);
const newComment = ref('');

const formatDateTime = (dateStr) => {
    const date = new Date(dateStr)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

const fetchComments = async () => {
    try {
        const res = await api.get(`/community/comment/${communityIdx}`);
        comments.value = res.data.content || []; // Page 형태이므로 content 접근
    } catch (err) {
        console.error('댓글 불러오기 실패:', err);
    }
};
const submitComment = async () => {
    if (!authStore.isLoggedIn) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
    }

    if (!newComment.value.trim()) return;
    try {
        await api.post(`/community/member/comment/${communityIdx}`, {
        comment: newComment.value
        });
        newComment.value = '';
        await fetchComments(); // 댓글 다시 불러오기
    } catch (err) {
        console.error('댓글 등록 실패:', err);
    }
};

const editingCommentId = ref(null)         // 현재 수정 중인 댓글 ID
const editingCommentText = ref('')  

const editComment = (commentIdx) => {
    const target = comments.value.find(c => c.idx === commentIdx)
    if (target) {
        editingCommentId.value = commentIdx
        editingCommentText.value = target.comment
    }
}

const cancelEdit = () => {
    editingCommentId.value = null
    editingCommentText.value = ''
}

const saveEditedComment = async (commentIdx) => {
    if (!editingCommentText.value.trim()) return alert('댓글 내용을 입력해주세요.')

    try {
        await api.put(`/community/member/comment/edit/${commentIdx}`, {
            comment: editingCommentText.value,
            memberId: myMemberId.value
        })
        editingCommentId.value = null
        editingCommentText.value = ''
        await fetchComments()
    } catch (err) {
        console.error('댓글 수정 실패:', err)
    }
}

const deleteComment = async (commentIdx) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    try {
        await api.put(`/community/member/comment/delete/${commentIdx}`)
        await fetchComments()
    } catch (err) {
        console.error('댓글 삭제 실패:', err)
    }
}

onMounted(() => {
    fetchDetail();
    fetchComments(); // 댓글 따로 가져옴
    if (authStore.isLoggedIn) {
        console.log("fetchReaction!")
        fetchReaction();// 사용자 반응 정보 가져오기
    }
});
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.community-detail-container {
    display: flex;
    justify-content: center;
    padding: 3rem 1rem;
    background-color: var(--color-background);
    min-width:  80%;
    min-height: calc(100vh - 160px); // header + footer 고려


    .back-link {
    display: inline-block;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
        text-decoration: underline;
        color: var(--color-primary-container);
    }
    }

    .reactions {
        display: flex;
        gap: 1rem;
        font-size: 1rem;
        color: var(--color-primary);
        margin-top: 1.5rem;

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

            &:hover {
            transform: scale(1.1);
            }
        }
        .reaction-btn.active {
            font-weight: bold;
            color: var(--color-primary);
            transform: scale(1.1);
            }
    }
}

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

.title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1rem;
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
    margin-bottom: 1.5rem;
}

.content {
    font-size: 1rem;
    line-height: 1.7;
    white-space: pre-wrap;
    min-height: 200px; 
}

.comments {
    margin-top: 2.5rem;

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

    .comment-item {
        padding: 0.75rem 0;
        border-bottom: 1px solid var(--color-outline);

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
}
</style>
