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
                <span class="writer">{{ c.memberId }}</span>
                <span class="date">{{ formatDate(c.createdAt) }}</span>
                </div>
                <div class="comment-text">{{ c.comment }}</div>
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

const submitComment = async () => {
    if (!authStore.isLoggedIn) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
    }

    if (!newComment.value.trim()) return;
    try {
        await api.post(`/community/${communityIdx}/comment`, {
        comment: newComment.value
        });
        newComment.value = '';
        await fetchComments(); // 댓글 다시 불러오기
    } catch (err) {
        console.error('댓글 등록 실패:', err);
    }
};

const fetchComments = async () => {
    try {
        const res = await api.get(`/community/comment/${communityIdx}`);
        comments.value = res.data.content || []; // Page 형태이므로 content 접근
    } catch (err) {
        console.error('댓글 불러오기 실패:', err);
    }
};

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
        font-size: 0.85rem;
        color: var(--color-on-surface-variant);
        margin-bottom: 0.2rem;
        display: flex;
        gap: 1rem;
        }

        .comment-text {
        font-size: 0.95rem;
        color: var(--color-on-surface);
        }
    }
}
</style>
