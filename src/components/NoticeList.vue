<template>
    <div class="notice-list">
        <router-link
        v-for="notice in displayedNotices"
        :key="notice.idx"
        :to="`/notices/${notice.idx}`"
        class="notice-item"
        >
        <strong>{{ notice.houseName }}</strong><br />
        {{ notice.houseAddress }} | {{ formatDate(notice.pblancDate) }}
        </router-link>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/libs/axios'

const props = defineProps({ type: String, limit: Number })

const allNotices = ref([])

const fetchNotices = async () => {
    try {
        // 공고 유형 분기 처리
        let url = '/applyhome/list/top3/pblanc_date'
        if (props.type === 'latest') {
            url = '/applyhome/list/top3/pblanc_date'
        } 
        else if (props.type === 'popular') {
            url = '/applyhome/list/top3/view' 
        }

        const res = await api.get(url)
        allNotices.value = res.data
    } catch (err) {
        console.error('공고 조회 실패:', err)
    }
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const displayedNotices = computed(() => {
    return allNotices.value.slice(0, props.limit)
})

onMounted(fetchNotices)
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
