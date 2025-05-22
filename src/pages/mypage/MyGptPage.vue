<template>
  <section class="my-gpt-page">
    <h2>GPT 질문 내역</h2>

    <div v-if="loading" class="loading">불러오는 중...</div>
    <div v-else-if="paginatedList.length === 0" class="empty">GPT 질문 내역이 없습니다.</div>

    <ul v-else class="gpt-list">
      <li v-for="(item, index) in paginatedList" :key="index" class="gpt-item">
        <h3>{{ item.houseName }}</h3>
        <p><strong>질문:</strong> {{ item.request }}</p>
        <p><strong>답변:</strong> {{ item.comment }}</p>
      </li>
    </ul>

    <!-- 페이지네이션 버튼 -->
    <div class="pagination" v-if="totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">이전</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/libs/axios'

const gptList = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = 3

const fetchGptHistory = async () => {
  try {
    const res = await api.get('/applyhome/ms/allComments', {
    })
    gptList.value = res.data
  } catch (err) {
    console.error('GPT 내역 불러오기 실패:', err)
  } finally {
    loading.value = false
  }
}

// 페이지네이션 관련 계산
const totalPages = computed(() => Math.ceil(gptList.value.length / pageSize))

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return gptList.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

onMounted(() => {
  fetchGptHistory()
})
</script>

<style scoped>
.my-gpt-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem;
  min-height: calc(100vh - 160px);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #333;
}

.loading,
.empty {
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  margin-top: 2rem;
}

.gpt-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.gpt-item {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;

  h3 {
    margin-bottom: 0.5rem;
    color: var(--color-primary);
  }

  p {
    margin: 0.3rem 0;
    line-height: 1.5;
  }

  strong {
    color: #444;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;

  button {
    padding: 0.4rem 1rem;
    border: none;
    border-radius: 5px;
    background-color: var(--color-primary);
    color: white;
    font-weight: 500;
    cursor: pointer;

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }

  span {
    font-weight: 600;
    color: #444;
  }
}
</style>
