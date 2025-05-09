<template>
  <section class="mypage">
    <h2 class="title">마이페이지</h2>

    <div class="mypage-content">
      <div class="info-box">
        <h3>내 정보</h3>
        <p><strong>이름:</strong> {{ user.name }}</p>
        <p><strong>이메일:</strong> {{ user.email }}</p>
        <p><strong>아이디:</strong> {{ user.id }}</p>
        <p><strong>성별:</strong> {{ user.gender }}</p>
        <button @click="goChangePw">비밀번호 변경하기</button>
      </div>

      <div class="action-box">
        <h3>내 활동</h3>
        <div v-for="(action, idx) in activityButtons" :key="idx">
          <button @click="goTo(action.path)">{{ action.label }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/libs/axios'

const auth = useAuthStore()
const user = ref({})
const role = ref('')
const router = useRouter()

const allActions = {
    USER: [
        { label: '찜한 공고 보러가기', path: '/favorites' },
        { label: '내가 쓴 글 보러가기', path: '/myposts' }
    ],
    MEMBERSHIP: [
        { label: 'gpt 내역 확인하기기', path: '/gptlists' },
        { label: '찜한 공고 보러가기', path: '/favorites' },
        { label: '내가 쓴 글 보러가기', path: '/myposts' }
    ],
    ADMIN: [
        { label: '사용자 전체 보기', path: '/admin/members' },
        { label: '공지사항 쓰러가기', path: '/admin/announcement' }
    ],
    MASTER: [
        { label: '사용자 전체 보기', path: '/admin/members' },
        { label: '공지사항 쓰러가기', path: '/admin/announcement' }
    ]
}
const goTo = (path) => {
    router.push(path)
}

const goChangePw = () => {
    router.push('/change-password') // 너가 정의한 비밀번호 변경 페이지로
}
const activityButtons = ref([])

onMounted(async () => {
    const { data } = await api.get('/members/mypage', {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`
        }
    })
    user.value = data
    role.value = data.role?.toUpperCase() || 'USER'
    activityButtons.value = allActions[role.value] || []
})
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.mypage {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  min-height: calc(100vh - 160px);
  background-color: var(--color-background);

  .title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-on-background);
    margin-bottom: 3rem;
  }

  .mypage-content {
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
    justify-content: center;

    .info-box,
    .action-box {
      background-color: var(--color-surface);
      border: 1px solid var(--color-outline);
      border-radius: 16px;
      padding: 2rem;
      width: 320px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    }

    h3 {
      font-size: 1.3rem;
      font-weight: bold;
      margin-bottom: 1.2rem;
      text-align: center;
    }

    p {
      margin: 0.6rem 0;
      font-size: 1rem;
      line-height: 1.5;
    }

    button {
      display: block;
      width: 100%;
      padding: 0.75rem;
      margin-top: 1rem;
      background-color: var(--color-primary);
      color: var(--color-on-primary);
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.25s;

      &:hover {
        background-color: var(--color-secondary-container);
      }
    }

    .action-box button {
      margin-top: 0.75rem;
    }
  }
}
</style>

