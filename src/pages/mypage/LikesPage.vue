<template>
    <section class="likes-page">
        <h2 class="title">찜한 청약 공고</h2>

        <div v-if="likes.content.length > 0" class="likes-list">
            <div class="like-card" v-for="item in likes.content" :key="item.idx">
                <div class="card-info">
                <router-link :to="`/apply-homes/${item.applyIdx}`" class="name">
                    {{ item.applyName }}
                </router-link>
                <p class="date">찜한 날짜: {{ formatDate(item.createdAt) }}</p>
                </div>
                <button class="delete-btn" @click="unlike(item.applyIdx)">찜 취소</button>
            </div>
        </div>

        <div v-else class="empty-message">
            <p>찜한 공고가 없습니다.</p>
            <button class="explore-btn" @click="goToApplyHomes">공고 찾아보기</button>
        </div>

        <div class="pagination" v-if="likes.totalPages > 1">
        <button :disabled="likes.first" @click="changePage(currentPage - 1)">
            이전
        </button>
        <span>{{ currentPage + 1 }} / {{ likes.totalPages }}</span>
        <button :disabled="likes.last" @click="changePage(currentPage + 1)">
            다음
        </button>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/libs/axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const likes = ref({
    content: [],
    totalPages: 0,
    first: true,
    last: false
})
const currentPage = ref(0)
const pageSize = 10

const fetchLikes = async () => {
    if (!authStore.isLoggedIn) {
        alert('로그인이 필요합니다.')
        router.push('/login')
        return
    }

    try {
        const res = await api.get('/applylike/list', {
        params: { page: currentPage.value, size: pageSize }
        })
        likes.value = res.data
    } catch (err) {
        console.error('찜한 공고 조회 실패:', err)
        alert('찜한 공고 정보를 가져오는 데 실패했습니다.')
    }
}

const unlike = async (idx) => {
    if (!confirm('정말 이 공고를 찜 해제하시겠습니까?')) return
    try {
        await api.delete(`/applylike/${idx}`)
        alert('찜이 해제되었습니다.')
        fetchLikes()
    } catch (err) {
        console.error('찜 해제 실패:', err)
        alert('찜 해제 중 오류가 발생했습니다.')
    }
}

const changePage = (page) => {
    if (page < 0 || page >= likes.value.totalPages) return
    currentPage.value = page
    fetchLikes()
}

const goToApplyHomes = () => {
    router.push('/apply-homes')
}
const formatDate = (str) => new Date(str).toLocaleDateString()

onMounted(fetchLikes)
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.likes-page {
    min-width: 70%;
    margin: 2rem auto;
    padding: 1.5rem;
    background-color: var(--color-surface);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    min-height: calc(100vh - 160px);

    .title {
        font-size: 1.75rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
    }

    .likes-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .like-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid var(--color-outline);
        border-radius: 8px;
        background-color: var(--color-background);

        .card-info {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .name {
            font-weight: 600;
            font-size: 1.1rem;
            color: var(--color-primary);
            text-decoration: none;

            &:hover {
            text-decoration: underline;
            }
        }

        .date {
            font-size: 0.95rem;
            color: var(--color-on-surface-variant);
        }

        .delete-btn {
            background-color: var(--color-secondary-container);
            color: var(--color-on-secondary-container);
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;

            &:hover {
            background-color: var(--color-secondary);
            color: white;
            }
        }
        }
    }

    .empty-message {
        text-align: center;
        color: var(--color-on-surface-variant);
        margin-top: 2rem;

        .explore-btn {
            margin-top: 1rem;
            padding: 0.6rem 1.2rem;
            background-color: var(--color-primary);
            color: var(--color-on-primary);
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;

            &:hover {
            background-color: var(--color-primary-container);
            color: var(--color-on-primary-container);
            }
        }
    }
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;
        margin-top: 2rem;

        button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        background-color: var(--color-primary-container);
        color: var(--color-on-primary-container);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        }
    }
}
</style>
