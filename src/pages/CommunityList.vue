<template>
    <section class="community-page">
        <h2 class="page-title">커뮤니티 게시글</h2>

        <div class="post-card" v-for="post in posts.content" :key="post.idx">
        <div class="card-header">
            <h3 class="title">
                <router-link :to="`/communities/${post.idx}`">{{ post.title }}</router-link>
            </h3>
            <span class="date">{{ formatDate(post.createdAt) }}</span>
        </div>

        <!-- <p class="preview">{{ post.content.text.slice(0, 100) }}...</p> -->

        <div class="card-footer">
            <div class="stats">
            <span>조회수: {{ post.views }}</span>
            <span>댓글수: {{ post.commentCnt }}</span>
            <span>좋아요 {{ post.like }}</span>
            <span>싫어요 {{ post.disLike }}</span>
            </div>
        </div>
        </div>

        <div class="pagination">
        <button :disabled="posts.first" @click="changePage(currentPage - 1)">이전</button>
        <span>{{ currentPage + 1 }} / {{ posts.totalPages }}</span>
        <button :disabled="posts.last" @click="changePage(currentPage + 1)">다음</button>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/libs/axios';

const posts = ref({
    content: [],
    totalPages: 0,
    first: true,
    last: false
});
const currentPage = ref(0);
const pageSize = 10;

const fetchPosts = async () => {
    const res = await api.get('/community/list', {
        params: {
        page: currentPage.value,
        size: pageSize
        }
    });
    posts.value = res.data;
    console.log(posts.value)
};

const changePage = (page) => {
    if (page < 0 || page >= posts.value.totalPages) return;
    currentPage.value = page;
    fetchPosts();
};

const formatDate = (str) => new Date(str).toLocaleDateString();

onMounted(fetchPosts);
</script>

<style scoped lang="scss">
.community-page {
    max-width: 1024px;
    margin: 0 auto;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--color-on-surface);
    }

    .post-card {
        border: 1px solid var(--color-outline);
        border-radius: 12px;
        background-color: var(--color-surface);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        padding: 1rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

    .card-header {
        display: flex;
        justify-content: space-between;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-on-surface);

        .title {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0 0 0.5rem;

            a {
                color: var(--color-on-surface);
                text-decoration: none;
                transition: color 0.2s, text-decoration 0.2s;

                &:hover {
                color: var(--color-primary);
                text-decoration: underline;
                cursor: pointer;
                }
            }
        }
    }

    .preview {
        font-size: 0.95rem;
        color: var(--color-on-surface-variant);
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stats {
            font-size: 0.85rem;
            color: var(--color-on-surface-variant);
            display: flex;
            gap: 1rem;
        }

        .link-btn {
            font-size: 0.9rem;
            color: var(--color-primary);
            font-weight: 500;
            text-decoration: none;

            &:hover {
            text-decoration: underline;
            }
        }
        }
    }

    .pagination {
        display: flex;
        justify-content: center;
        gap: 1.5rem;

        button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        background-color: var(--color-primary-container);
        color: var(--color-on-primary-container);
        border: none;
        border-radius: 6px;
        cursor: pointer;

        &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        }
    }
}
</style>
