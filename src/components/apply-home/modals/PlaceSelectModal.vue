<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <h3>출발지와 이동 수단 선택</h3>

      <!-- 출발지 선택 -->
      <select v-model="selectedPlace">
        <option disabled value="">출발지를 선택하세요</option>
        <option v-for="place in places" :key="place.idx" :value="place">
          {{ place.alias }} ({{ place.address }})
        </option>
      </select>

      <!-- 이동 수단 선택 -->
      <div class="mode-select">
        <label><input type="radio" value="car" v-model="selectedMode" /> 자동차</label>
        <label><input type="radio" value="pedestrian" v-model="selectedMode" /> 도보</label>
        <label><input type="radio" value="transit" v-model="selectedMode" /> 대중교통</label>
    </div>

      <!-- 버튼 -->
      <div class="modal-buttons">
        <button
          @click="$emit('submit', { place: selectedPlace, mode: selectedMode })"
          :disabled="!selectedPlace || !selectedMode"
        >
          경로 보기
        </button>
        <button @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  places: Array,
});
const emit = defineEmits(['submit', 'close']);

const selectedPlace = ref(null);
const selectedMode = ref(null);

watch(
  () => props.places,
  () => {
    selectedPlace.value = null;
    selectedMode.value = null;
  }
);
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
    margin-bottom: 1rem;
  }

  .mode-select {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;

    label {
      font-size: 0.95rem;
      cursor: pointer;

      input {
        margin-right: 0.4rem;
      }
    }
  }

  .modal-buttons {
    display: flex;
    justify-content: space-between;

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
