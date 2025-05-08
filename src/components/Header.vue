<template>
    <header class="header">
        <h1 class="logo">MUSOON ZUPZUP</h1>
    </header>
</template>

<script setup></script>

<style scoped lang="scss">
@import "@/styles/theme";

.header {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    padding: 1rem 2rem;
    text-align: center;

    .logo {
        font-size: 1.5rem;
        font-weight: bold;
    }
}
</style>
