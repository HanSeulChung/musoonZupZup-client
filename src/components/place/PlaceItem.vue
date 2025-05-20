<template>
  <div class="place-item">
    <div class="info">
      <strong>{{ place.alias }}</strong>
      <p>{{ place.address }}</p>
    </div>
    <button @click="$emit('delete', place.idx)">삭제</button>
  </div>
</template>

<script setup>
defineProps({ place: Object });
defineEmits(["delete"]);
</script>

<style scoped>
.place-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--color-outline);
  border-radius: 8px;
  background-color: var(--color-surface);
}
</style>
