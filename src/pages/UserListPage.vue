<template>
  <section class="user-list">
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
      <button @click="fetchUsers">검색</button>

      <select v-model="sortKey">
        <option value="createdAt">가입일</option>
        <option value="name">이름</option>
      </select>
      <select v-model="sortValue">
        <option value="ASC">오름차순</option>
        <option value="DESC">내림차순</option>
      </select>
      <button @click="fetchUsers">정렬 조회</button>
    </div>

    <p>총 사용자 {{ totalUsers }}명</p>

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

const fetchUsers = async () => {
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

<style scoped>
.controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: center;
}

.ban {
  background-color: red;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
}

.unban {
  background-color: green;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
}

.pagination {
  margin-top: 1rem;
  text-align: center;
}
.pagination span {
  margin: 0 0.4rem;
  cursor: pointer;
}
.pagination .active {
  font-weight: bold;
  text-decoration: underline;
}
</style>
