<template>
<section class="apply-home-page">
    <h2 class="page-title">청약 공고 목록</h2>

    <div class="search-bar">
    <select v-model="searchKey">
        <option value="">검색 기준</option>
        <option value="1">주택 관리 번호</option>
        <option value="2">공고 번호</option>
        <option value="3">지역</option>
        <option value="4">주택명</option>
    </select>
    <input v-model="searchValue" type="text" placeholder="검색어 입력" />
    
    <select v-model="sortKey">
        <option value="">정렬 기준</option>
        <option value="1">가격 순</option>
        <option value="2">공고 날짜 순</option>
        <option value="3">청약 시작일 순</option>
        <option value="4">청약 종료일 순</option>
        <option value="5">청약 당첨자 발표 순</option>
    </select>
    <select v-model="sortValue">
        <option value="DESC">내림차순</option>
        <option value="ASC">오름차순</option>
    </select>
    <button @click="applyFilter">조회</button>
    </div>
    <div class="apply-card" v-for="item in homes.content" :key="item.idx">
        <div class="card-header">
            <h3 class="house-name">{{ item.houseName }}</h3>
            <p class="address">{{ item.houseAddress }}</p>
        </div>

        <div class="card-body">
            <p>📅 공고일: {{ formatDate(item.pblancDate) }}</p>
            <p>🏠 공급: {{ item.suplyCount }}세대 / {{ formatPriceToKorean(item.suplyPrice) }}</p>
            <p>📆 청약: {{ formatDate(item.applyStartDate) }} ~ {{ formatDate(item.applyEndDate) }}</p>
        </div>

        <div class="card-footer">
        <div class="stats">
            <!-- TODO: 적절한 png로 수정 -->
            <!-- <img src="@/assets/icons/view.png" alt="조회수" /> -->
            <span>조회수: {{ item.views }}</span>
            <!-- <img src="@/assets/icons/like.png" alt="찜수" /> -->
            <span>찜: {{ item.likeCnt }}</span>
        </div>
            <RouterLink :to="`/apply-homes/${item.idx}`" class="link-btn">상세 보기 →</RouterLink>
        </div>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination">
        <button :disabled="homes.first" @click="changePage(currentPage - 1)">이전</button>
        <span>{{ currentPage + 1 }} / {{ homes.totalPages }}</span>
        <button :disabled="homes.last" @click="changePage(currentPage + 1)">다음</button>
    </div>  
</section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from "@/libs/axios";
import { formatDate, formatPriceToKorean } from '@/utils/format';

const homes = ref({
    content: [],
    totalPages: 0,
    number: 0,
    first: true,
    last: false,
});

const currentPage = ref(0);
const pageSize = 10;

const searchKey = ref('');
const searchValue = ref('');
const sortKey = ref('');
const sortValue = ref('ASC');

const applyFilter = () => {
  currentPage.value = 0;
  fetchHomes();
};

const fetchHomes = async () => {
  const res = await api.get('/applyhome/list', {
    params: {
      page: currentPage.value,
      size: pageSize,
      key: searchKey.value || undefined,
      value: searchValue.value || undefined,
      sortKey: sortKey.value || undefined,
      sortValue: sortValue.value || undefined,
    },
  });
  homes.value = res.data;
};

const changePage = (page) => {
    if (page < 0 || page >= homes.value.totalPages) return;
    currentPage.value = page;
    fetchHomes();
};

onMounted(fetchHomes);
</script>
<style scoped lang="scss">
@use '@/styles/theme' as *;

.apply-home-page {
  max-width: 1024px;
  margin: 0 10px;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;

  .page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-on-surface);
  }

  .apply-card {
    width: 100%; // 고정 너비 설정
    min-height: 200px; // 카드 높이도 일정 수준 확보 (선택 사항)
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
        align-items: flex-start;
        gap: 1rem;

        .house-name {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--color-on-surface);
            flex: 1;
            word-break: break-word;
            min-width: 0; // flex-item이 overflow 방지되도록
        }

        .address {
            font-size: 0.95rem;
            color: var(--color-on-surface-variant);
            max-width: 200px;
            text-align: right;
            flex-shrink: 0;
            word-break: break-word;
        }
    }

    .card-body {
      font-size: 0.95rem;
      color: var(--color-on-surface);
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;

      .stats {
        display: flex;
        align-items: center;
        gap: 10px;

        img {
          width: 18px;
          height: 18px;
        }

        span {
          font-size: 0.9rem;
          color: var(--color-on-surface-variant);
        }
      }

      .link-btn {
        font-size: 0.9rem;
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;

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
    margin-top: 1.5rem;

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

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  justify-content: space-around;

  select, input {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 0.9rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background-color: var(--color-primary-container);
    }
  }
}
</style>
