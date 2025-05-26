<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <h3>비밀번호 찾기</h3>
      <p class="desc">가입 시 사용한 정보를 입력해주세요.</p>

      <div class="form-group">
        <label for="userId">아이디</label>
        <input id="userId" v-model="userId" placeholder="아이디 입력" />
      </div>

      <div class="form-group">
        <label for="name">이름</label>
        <input id="name" v-model="name" placeholder="이름 입력" />
      </div>

      <div class="form-group">
        <label for="email">이메일</label>
        <input id="email" v-model="email" placeholder="이메일 입력" />
      </div>

      <div class="actions">
        <button type="button" class="submit" @click="handleFindPassword">확인</button>
        <button type="button" class="cancel" @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import api from '@/libs/axios'

const userId = ref('')
const name = ref('')
const email = ref('')

const emit = defineEmits(['close'])

const handleFindPassword = async () => {
  if (!userId.value.trim()) return alert('아이디를 입력해주세요.')
  if (!name.value.trim()) return alert('이름을 입력해주세요.')
  if (!email.value.trim()) return alert('이메일을 입력해주세요.')

  try {
    const res = await api.post('/members/find-password', {
      userId: userId.value,
      name: name.value,
      email: email.value
    })
    if(!res.data.success) throw e;
    alert('해당 이메일로 비밀번호 재설정 링크를 보냈습니다.');
    emit('close');
  } catch (err) {
    console.error('비밀번호 찾기 실패:', err)
    alert('비밀번호 찾기 중 오류가 발생했습니다.')
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.desc {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1.2rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;

  label {
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 500;
    font-size: 0.95rem;
  }

  input {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;

  button {
    flex: 1;
    padding: 0.6rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }

  .submit {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
  }

  .cancel {
    background-color: #ddd;
    color: #333;
  }
}
</style>
