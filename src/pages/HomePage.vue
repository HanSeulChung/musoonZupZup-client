<template>
  <section class="home">
    <div class="container">
      <h2 class="title">무순위 청약 정보를 쉽고 빠르게</h2>
      <p class="subtitle">청약통장 없이 누구나 참여할 수 있는 기회를 확인해보세요!</p>
      <RouterLink to="/favorites" class="cta-button">공고 보러가기</RouterLink>
    </div>
  </section>
</template>

<script setup></script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.home {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  background-color: var(--color-surface);
  color: var(--color-on-surface);
}

.container {
  max-width: 768px;
  width: 100%;
  text-align: center;
  background-color: var(--color-surface-variant);
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: var(--color-on-surface-variant);
}

.cta-button {
  display: inline-block;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--color-primary-container);
    color: var(--color-on-primary-container);
  }
}
</style>
