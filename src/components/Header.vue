<template>
    <header class="header">
    <div class="brand">
    <RouterLink to="/" class="brand-link">
        <img src="@/assets/logo.png" alt="로고" class="logo-img" />
        <span class="brand-name">무순줍줍</span>
    </RouterLink>
    </div>

    <nav class="nav">
        <template v-if="isLoggedIn">
        <RouterLink to="/mypage">마이페이지</RouterLink>
        <RouterLink to="/favorites">찜한 공고</RouterLink>
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
import { ref } from 'vue'

// 예시: 로그인 여부 (추후 Pinia나 Auth 연동)
const isLoggedIn = ref(false)

function logout() {
    alert('로그아웃 처리')
    isLoggedIn.value = false
}
</script>


<style scoped lang="scss">
@use "@/styles/theme" as *;

.header {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

.brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .logo-img {
        width: 40px;
        height: auto;
    }

    .brand-name {
        font-size: 1.25rem;
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
    gap: 1rem;

    a,
    button {
        color: var(--color-on-primary);
        background: none;
        border: none;
        font: inherit;
        cursor: pointer;
        text-decoration: none;
    }

    button:hover,
    a:hover {
        text-decoration: underline;
    }
}
}
</style>
