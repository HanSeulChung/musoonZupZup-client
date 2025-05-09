<template>
  <div id="app">
    <Header />

    <main class="main-content">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<style scoped lang="scss">

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background-color: var(--color-background);
  color: var(--color-on-background);
  padding: 2rem;
}
</style>
