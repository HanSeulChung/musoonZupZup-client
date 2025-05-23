<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <h3>출발지 선택</h3>
      <select v-model="selected">
        <option disabled value="">출발지를 선택하세요</option>
        <option v-for="place in places" :key="place.idx" :value="place">
          {{ place.alias }} ({{ place.address }})
        </option>
      </select>
      <div class="modal-buttons" style="margin-top: 1rem;">
        <button @click="$emit('submit', selected)" :disabled="!selected">경로 보기</button>
        <button @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  places: Array,
})

const emit = defineEmits(['submit', 'close'])

const selected = ref(null)
watch(
  () => props.places,
  () => {
    selected.value = null // 목록 변경 시 선택 초기화
  }
)
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 400px;
  text-align: center;

  h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    font-size: 0.95rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;

      &:first-child {
        background-color: var(--color-primary);
        color: white;
      }

      &:last-child {
        background-color: #ddd;
        color: #333;
      }
    }
  }
}
</style>
