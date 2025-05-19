<template>
  <section class="add-place-page">
    <h2 class="title">장소 등록</h2>

    <div class="form">
      <label>장소 이름</label>
      <input
        v-model="alias"
        type="text"
        placeholder="예: 회사, 집, 자주 가는 카페 등"
      />

      <label>주소 검색</label>
      <input
        v-model="baseAddress"
        type="text"
        placeholder="주소를 검색해주세요"
        readonly
      />
      <button class="open-search-btn" @click="openAddressSearch">주소 검색</button>

      <label>상세 주소</label>
      <input
        v-model="detailAddress"
        type="text"
        placeholder="동, 호수 등 상세 주소 입력"
      />

      <div class="actions">
        <button @click="registerPlace">등록하기</button>
        <button class="cancel-btn" @click="goBack">취소</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/libs/axios'

const alias = ref('')
const baseAddress = ref('')
const detailAddress = ref('')
const router = useRouter()

const openAddressSearch = () => {
  new window.daum.Postcode({
    oncomplete: function (data) {
      baseAddress.value = data.address
    }
  }).open()
}

const registerPlace = async () => {
  const fullAddress = `${baseAddress.value} ${detailAddress.value}`.trim()

  if (!alias.value.trim() || !baseAddress.value.trim()) {
    alert('장소 이름과 주소를 모두 입력해주세요.')
    return
  }

  try {
    await api.post('/members/registPlace/regist', {
        alias: alias.value,
        address: baseAddress.value,
        detailAddress: detailAddress.value
    });
    alert('장소가 등록되었습니다.')
    router.push('/mypage/places')
  } catch (err) {
    console.error('장소 등록 실패:', err)
    alert('등록 중 오류가 발생했습니다.')
  }
}

const goBack = () => {
  router.push('/mypage/places')
}
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.add-place-page {
  min-width: 70%;
  margin: 3rem auto;
  padding: 2rem;
  background-color: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: calc(100vh - 160px);

  .title {
    font-size: 1.6rem;
    font-weight: bold;
    margin-bottom: 2rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    label {
      font-weight: 600;
      font-size: 0.95rem;
    }

    input {
      padding: 0.6rem;
      font-size: 1rem;
      border: 1px solid var(--color-outline);
      border-radius: 6px;
    }

    .open-search-btn {
      align-self: flex-start;
      background-color: var(--color-secondary-container);
      color: var(--color-on-secondary-container);
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;

      &:hover {
        background-color: var(--color-secondary);
        color: white;
      }
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;

      button {
        padding: 0.6rem 1.2rem;
        font-size: 0.95rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }

      button:first-child {
        background-color: var(--color-primary);
        color: var(--color-on-primary);
      }

      .cancel-btn {
        background-color: var(--color-outline);
        color: var(--color-on-surface);
      }
    }
  }
}
</style>
