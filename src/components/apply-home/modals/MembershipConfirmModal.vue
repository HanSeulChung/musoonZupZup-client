<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <p>멤버십 전환이 필요합니다. 전환 하시겠습니까?</p>
      <div class="modal-buttons">
        <button @click="$emit('confirm')">예</button>
        <button @click="$emit('cancel')">아니오</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['confirm', 'cancel']);
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  text-align: center;

  .modal-buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;

      &:first-child {
        background-color: var(--color-primary);
        color: white;
      }

      &:last-child {
        background-color: #ddd;
      }
    }
  }
}
</style>