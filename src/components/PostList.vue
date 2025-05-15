<template>
    <div class="post-list">
        <router-link
        v-for="post in displayedPosts"
        :key="post.idx"
        :to="`/communities/${post.idx}`"
        class="post-item"
        >
        <h4>{{ post.title }}</h4>
        <div class="post-meta">
            <span>조회수: {{ post.views }}개</span>
            <span>좋아요 {{ post.like }}개</span>
            <span>싫어요 {{ post.disLike }}개</span>
            <span>댓글 {{ post.commentCnt }}개</span>
            <span>작성일 {{ formatDate(post.createdAt) }}</span>
        </div>
        </router-link>
    </div>
</template>


<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/libs/axios'

const props = defineProps({
    type: String, // 'popular'
    limit: Number
})

const allPosts = ref([])

const fetchPosts = async () => {
    try {
        // 커뮤니티 유형 분기 처리
        let url = '/community/list'
        // if (props.type === 'latest') {
        //     url = '/applyhome/list/top3/pblanc_date'
        // } 
        // else if (props.type === 'popular') {
        //     url = '/applyhome/list/top3/view' 
        // }

        const res = await api.get(url)
        console.log(res.data);
        allPosts.value = res.data?.content
        console.log(allPosts.value);
    } catch (err) {
        console.error('커뮤니티 조회 실패:', err)
    }
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const displayedPosts = computed(() => allPosts.value.slice(0, props.limit));

onMounted(fetchPosts)
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;
.post-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.post-item {
    display: block;
    padding: 1rem 1.25rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline);
    border-radius: 12px;
    text-decoration: none;
    color: var(--color-on-surface);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: var(--color-secondary-container);
        color: var(--color-on-secondary-container);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h4 {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-on-surface);
    }

    .post-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        font-size: 0.85rem;
        color: var(--color-on-surface-variant);

        span {
        line-height: 1.4;
        }
    }
}


</style>