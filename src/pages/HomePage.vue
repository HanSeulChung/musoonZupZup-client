<template>
  <section class="home">
    <div class="container">
      <h2 class="title">무순위 청약 정보를 쉽고 빠르게</h2>
      <p class="subtitle">청약통장 없이 누구나 참여할 수 있는 기회를 확인해보세요!</p>
      <button class="cta-button">공고 보러가기</button>
    </div>
  </section>
</template>

<script setup></script>

<style scoped lang="scss">
@import "@/styles/theme";

.home {
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  padding: 4rem 1rem;
  display: flex;
  justify-content: center;
  min-height: 100vh; 
}

.container {
  text-align: center;
  max-width: 768px;
  width: 100%;
  padding: 2rem;
  border-radius: 12px;
  background-color: #f9fbfc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: var(--color-on-surface-variant);
}

.cta-button {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--color-primary-container);
    color: var(--color-on-primary-container);
  }
}
</style>