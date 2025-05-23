<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <h2 class="modal-title">💳 멤버십 결제</h2>
      <p class="modal-desc">GPT 상세 분석을 이용하려면 멤버십 가입이 필요합니다.</p>

      <form @submit.prevent="$emit('submit', { cardNumber, name })">
        <div class="form-group">
          <label>카드 번호</label>
          <input
            v-model="cardNumber"
            type="text"
            placeholder="1234-5678-9012-3456"
            required
          />
        </div>

        <div class="form-group">
          <label>이름</label>
          <input v-model="name" type="text" placeholder="이름 입력" required />
        </div>

        <div class="button-group">
          <button type="submit" class="primary">₩9,900 결제하기</button>
          <button type="button" class="secondary" @click="$emit('close')">닫기</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
defineEmits(['submit', 'close']);

const cardNumber = ref('');
const name = ref('');
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-card {
  background: #fff;
  width: 100%;
  max-width: 440px;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #222;
}

.modal-desc {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1.5rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .form-group {
    display: flex;
    flex-direction: column;
    text-align: left;

    label {
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.4rem;
    }

    input {
      padding: 0.6rem 0.8rem;
      font-size: 0.95rem;
      border: 1px solid #ccc;
      border-radius: 8px;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.15);
      }
    }
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    button {
      padding: 0.75rem;
      font-size: 1rem;
      font-weight: bold;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .primary {
      background-color: var(--color-primary);
      color: white;

      &:hover {
        background-color: var(--color-primary-container);
      }
    }

    .secondary {
      background-color: #f2f2f2;
      color: #333;

      &:hover {
        background-color: #e0e0e0;
      }
    }
  }
}
</style>