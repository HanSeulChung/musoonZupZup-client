<template>
    <section class="auth">
        <div class="auth-card">
        <h2>로그인</h2>
        <form @submit.prevent="handleLogin">
            <div class="form-group">
            <input
                type="text"
                v-model="id"
                placeholder="아이디"
                required
            />
            </div>

            <div class="form-group">
            <input
                type="password"
                v-model="password"
                placeholder="비밀번호"
                required
            />
            </div>

            <button type="submit" class="submit-button">로그인</button>
        </form>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/libs/axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const id = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
    if (!id.value.trim() || !password.value.trim()) {
        alert('아이디와 비밀번호를 입력해주세요.')
        return
    }

    try {
        const res = await api.post('/members/login', {
            id: id.value,
            pw: password.value
            }, {
            withCredentials: true 
        });
        authStore.login(res.data.accessToken, res.data.role)
        alert('로그인 성공')
        router.push('/')
    } catch (err) {
        console.log(err);
        if (err.response?.status === 400) {
            alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요.');
        }
        // 다른 에러는 인터셉터에서 처리됨 (403, 401 등)
        }
}
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.auth {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 160px);
    padding: 2rem 1rem;
}

.auth-card {
    background-color: var(--color-surface);
    color: var(--color-on-surface);
    border: 1px solid var(--color-outline);
    border-radius: 12px;
    padding: 2.5rem;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.6rem;
}

.form-group {
    margin-bottom: 1rem;
    input {
        width: 100%;
        padding: 0.65rem;
        border: 1px solid var(--color-outline);
        border-radius: 6px;
        background-color: var(--color-background);
        color: var(--color-on-background);
    }
}

.submit-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--color-primary-container);
    }
}
</style>
