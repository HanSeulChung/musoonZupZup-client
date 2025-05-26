<template>
  <header class="header">
    <div class="brand">
      <RouterLink to="/" class="brand-link">
        <img src="@/assets/logo.png" alt="로고" class="logo-img" />
        <span class="brand-name">무순줍줍</span>
      </RouterLink>
    </div>

    <nav class="nav">
      <RouterLink to="/notices">공지사항</RouterLink>
      <RouterLink to="/communities">자유게시판</RouterLink>
      <RouterLink to="/apply-homes">청약 공고</RouterLink>

      <template v-if="isLoggedIn && (role==='USER' || role === 'MEMBERSHIP')">
        <RouterLink to="/likes">찜한 공고</RouterLink>
      </template>
      <template v-if="isLoggedIn">
        <RouterLink to="/mypage">마이페이지</RouterLink>
        <button @click="logout">로그아웃</button>
      </template>
      <template v-else>
        <RouterLink to="/login">로그인</RouterLink>
        <RouterLink to="/register">회원가입</RouterLink>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import api from "@/libs/axios";

const router = useRouter();
const auth = useAuthStore();
const { role, isLoggedIn } = storeToRefs(auth);

const logout = async () => {
  try {
    await api.post(
      "/members/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      }
    );
    auth.logout();
    alert("로그아웃 완료");
    router.push("/");
  } catch (err) {
    console.error("로그아웃 실패:", err);
    alert("로그아웃 중 오류가 발생했습니다.");
  }
};
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.header {
  position: fixed; // 💡 화면에 고정
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999; // 💡 다른 요소 위에 뜨도록
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: 1rem 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .logo-img {
      width: 40px;
      height: auto;
    }

    .brand-name {
      font-size: 1.4rem;
      font-weight: bold;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: inherit;
    }
  }

  .nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;

    a,
    button {
      color: var(--color-on-primary);
      background: none;
      border: none;
      font: inherit;
      cursor: pointer;
      text-decoration: none;
      padding: 0.3rem 0.5rem;

      &:hover {
        text-decoration: underline;
      }
    }

    button {
      border-radius: 4px;
      border: 1px solid var(--color-on-primary);
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--color-on-primary);
        color: var(--color-primary);
      }
    }
  }
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
