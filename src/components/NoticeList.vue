<template>
    <div class="notice-list">
        <router-link
        v-for="notice in displayedNotices"
        :key="notice.id"
        :to="`/notices/${notice.id}`"
        class="notice-item"
        >
        <strong>{{ notice.title }}</strong><br />
        {{ notice.location }} | {{ notice.date }}
        </router-link>
    </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ type: String, limit: Number })

const allNotices = [
    { id: 1, title: '서울 A단지', location: '강남구', date: '2025-05-01' },
    { id: 2, title: '부산 B단지', location: '해운대구', date: '2025-04-28' },
    { id: 3, title: '인천 C단지', location: '연수구', date: '2025-04-25' }
]

const displayedNotices = computed(() => allNotices.slice(0, props.limit))
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.notice-item {
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
.notice-item:hover {
    background-color: var(--color-secondary-container);
    color: var(--color-on-secondary-container);
}
</style>
