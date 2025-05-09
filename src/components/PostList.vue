<template>
    <div class="post-list">
        <router-link
            v-for="post in displayedPosts"
            :key="post.id"
            :to="`/posts/${post.id}`"
            class="post-item"
            >
            <h4>{{ post.title }}</h4>
            <p>좋아요 {{ post.likes }}개</p>
        </router-link>
    </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
    type: String, // 'popular'
    limit: Number
})

// 임시 데이터 예시
const allPosts = [
    { id: 1, title: '무순위 청약 당첨 후기', likes: 52 },
    { id: 2, title: '서울 vs 인천 어디가 나을까요?', likes: 44 },
    { id: 3, title: '요즘 핫한 단지는?', likes: 37 },
    { id: 4, title: '무순위 청약 꿀팁 정리', likes: 33 }
]

const displayedPosts = computed(() => allPosts.slice(0, props.limit))
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

// .post-list {
//     display: flex;
//     flex-direction: column;
//     gap: 1rem;
// }

// .post-card {
//     background: var(--color-surface);
//     border: 1px solid var(--color-outline);
//     border-radius: 8px;
//     padding: 1rem;
//     color: var(--color-on-surface);
// }

.post-item {
    display: block;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline);
    border-radius: 8px;
    text-decoration: none;
    color: var(--color-on-surface);
    transition: background-color 0.2s;
}
.post-item:hover {
    background-color: var(--color-secondary-container);
    color: var(--color-on-secondary-container);
}
</style>