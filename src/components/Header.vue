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
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import api from '@/libs/axios'

const router = useRouter()
const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)

const logout = async () => {
    try {
        await api.post('/members/logout', {}, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`
        }
        })
        auth.logout() 
        alert('로그아웃 완료')
        router.push('/')
    } catch (err) {
        console.error('로그아웃 실패:', err)
        alert('로그아웃 중 오류가 발생했습니다.')
    }
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
