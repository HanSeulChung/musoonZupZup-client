<template>
  <form class="place-form" @submit.prevent="handleSubmit">
    <input v-model="alias" placeholder="장소 이름" required />
    <input v-model="address" placeholder="주소" required />
    <div class="form-actions">
      <button type="submit">등록</button>
      <button type="button" @click="$emit('cancel')">취소</button>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";

const alias = ref("");
const address = ref("");
const emit = defineEmits(["submit", "cancel"]);

const handleSubmit = () => {
  emit("submit", { alias: alias.value, address: address.value });
  alias.value = "";
  address.value = "";
};
</script>

<style scoped>
.place-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  input {
    padding: 0.5rem;
    border: 1px solid var(--color-outline);
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
