<template>
    <footer class="footer">
        <p>© 2025 무순줍줍. All rights reserved. </p>
        <p class="team">Team 정한슬 · 박재환</p>
    </footer>
</template>

<script setup></script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.footer {
    background-color: var(--color-surface-variant);
    color: var(--color-on-surface-variant);
    text-align: center;
    font-size: 0.875rem;
    padding: 1.5rem 1rem;
    border-top: 1px solid var(--color-outline);
}

.team {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--color-on-surface-variant);
}
</style>
