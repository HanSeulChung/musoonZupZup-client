<template>
  <section class="user-list">
    <div class="user-card">
      <h2>사용자 전체 보기</h2>

      <!-- 검색/정렬 컨트롤 -->
      <div class="controls">
        <select v-model="searchKey">
          <option value="">전체</option>
          <option value="id">아이디</option>
          <option value="email">이메일</option>
          <option value="name">이름</option>
          <option value="role">권한</option>
        </select>
        <input v-model="searchValue" placeholder="검색어 입력" />
        <button @click="search">검색</button>

        <select v-model="sortKey">
          <option value="createdAt">가입일</option>
          <option value="name">이름</option>
        </select>
        <select v-model="sortValue">
          <option value="ASC">오름차순</option>
          <option value="DESC">내림차순</option>
        </select>
        <button @click="sort">정렬 조회</button>
      </div>

      <p class="summary">총 사용자 {{ totalUsers }}명</p>

      <!-- 사용자 목록 테이블 -->
      <table>
        <thead>
          <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>이메일</th>
            <th>성별</th>
            <th>가입일</th>
            <th>Role</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="7">표시할 사용자가 없습니다.</td>
          </tr>
          <tr v-for="user in users" :key="user.memberIdx">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email || "..." }}</td>
            <td>{{ user.gender || "..." }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button
                :class="user.banned ? 'unban' : 'ban'"
                @click="toggleBan(user)"
              >
                {{ user.banned ? "복구" : "차단" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div class="pagination">
        <button @click="goToPage(page - 1)" :disabled="page === 1">《</button>
        <span
          v-for="n in totalPages"
          :key="n"
          @click="goToPage(n)"
          :class="{ active: n === page }"
        >
          {{ n }}
        </span>
        <button @click="goToPage(page + 1)" :disabled="page === totalPages">
          》
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/libs/axios";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const users = ref([]);
const totalUsers = ref(0);
const totalPages = ref(1);

const searchKey = ref("");
const searchValue = ref("");
const sortKey = ref("createdAt");
const sortValue = ref("DESC");

const page = ref(1);
const size = 10;

const search = () => {
  page.value = 1; // 페이지 초기화
  fetchUsers();   // 유저 목록 새로 가져오기
};

const sort = () => {
  page.value = 1;
  fetchUsers();
};


const fetchUsers = async () => {
  if (!searchKey.value && searchValue.value) {
    // 전체 검색은 나중에 필요하면 추가
    alert("검색할 범위를 선택해주세요.");
    return;
  }

  try {
    const response = await api.get("/admin/members", {
      params: {
        key: searchKey.value,
        value: searchValue.value,
        sortKey: sortKey.value,
        sortValue: sortValue.value,
        page: page.value - 1, // 백엔드는 0-based
        size: size,
      },
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
    // console.log("✅ 전체 응답 content :", response.data.content);
    users.value = response.data?.content || [];
    totalUsers.value = response.data.totalElements;
    totalPages.value = response.data.totalPages;
  } catch (e) {
    alert("사용자 목록 조회 실패");
  }
};

const toggleBan = async (user) => {
  try {
    const url = `/admin/members/${user.memberIdx}/${
      user.banned ? "unban" : "ban"
    }`;
    await api.patch(
      url,
      {},
      {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      }
    );
    user.banned = !user.banned; // ← 여기도 key 바꿈
  } catch (e) {
    alert("차단/복구 실패");
  }
};

const formatDate = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

const goToPage = (n) => {
  if (n < 1 || n > totalPages.value) return;
  page.value = n;
  fetchUsers();
};

onMounted(fetchUsers);
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.user-list {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px); // header + footer 고려
  background-color: var(--color-background);
  padding: 2rem;

  .user-card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline);
    border-radius: 16px;
    padding: 2.5rem;
    max-width: 1000px;
    width: 100%;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  }

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-on-surface);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    justify-content: center;
    margin-bottom: 1.5rem;

    select,
    input {
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      border: 1px solid var(--color-outline);
      border-radius: 8px;
      background-color: var(--color-background);
      color: var(--color-on-background);
    }

    button {
      padding: 0.5rem 1.2rem;
      font-size: 0.95rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      background-color: var(--color-primary);
      color: var(--color-on-primary);
      cursor: pointer;
      transition: background-color 0.25s ease;

      &:hover {
        background-color: var(--color-secondary-container);
      }
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-surface);
    border-radius: 12px;
    overflow: hidden;

    th,
    td {
      border: 1px solid var(--color-outline);
      padding: 0.75rem 1rem;
      text-align: center;
      font-size: 1rem;
      white-space: nowrap;
    }

    th {
      background-color: var(--color-secondary-container);
      color: var(--color-on-surface);
      font-weight: 600;
    }
  }

  .ban,
  .unban {
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: white;
  }

  .ban {
    background-color: #d32f2f;
  }

  .unban {
    background-color: #388e3c;
  }

  .pagination {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.6rem;

    button {
      padding: 0.5rem 0.9rem;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      background-color: var(--color-primary);
      color: var(--color-on-primary);
      cursor: pointer;

      &:disabled {
        background-color: var(--color-outline);
        color: #888;
        cursor: not-allowed;
      }
    }

    span {
      cursor: pointer;
      padding: 0.5rem;
      font-size: 1rem;
      color: var(--color-on-surface);
      border-radius: 6px;

      &.active {
        font-weight: bold;
        text-decoration: underline;
        background-color: var(--color-secondary-container);
      }
    }
  }
}
</style>
