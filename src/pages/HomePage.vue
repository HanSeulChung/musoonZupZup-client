<template>
  <section class="home">
    <!-- 1. 서비스 소개 -->
    <div class="intro">
      <div class="intro-wrapper">
        <div class="intro-text">
          <h2>무순줍줍 - 누구나 쉽게 접근하는 무순위 청약 플랫폼</h2>
          <p>공고, 추천, 커뮤니티까지 한 곳에서 확인해보세요.</p>
        </div>
        <div class="intro-image">
          <img src="@/assets/AI_robot_character.png" alt="AI 로봇 이미지" />
        </div>
      </div>
    </div>

    <!-- 카드 박스로 나눈 섹션들 -->
    <div class="card-section">
      <!-- 2. 최신 청약 공고 BEST 3 -->
      <div class="section-card latest">
        <div class="card-header">
          🆕 최신 청약 공고
          <router-link to="/apply-homes" class="view-more"
            >전체 보기 →</router-link
          >
        </div>
        <div class="card-body">
          <ApplyHomeList :type="'latest'" :limit="3" />
        </div>
      </div>

      <!-- 3. 인기 청약 공고 BEST 3 -->
      <div class="section-card popular">
        <div class="card-header">
          🔥 인기 청약 공고
          <router-link to="/apply-homes" class="view-more"
            >전체 보기 →</router-link
          >
        </div>
        <div class="card-body">
          <!-- TODO: 찜 기능 추가 후 back이랑 연동 -->
          <ApplyHomeList :type="'popular'" :limit="3" />
        </div>
      </div>

      <!-- 4. 인기 커뮤니티 게시글 BEST 3 -->
      <div class="section-card posts">
        <div class="card-header">
          💬 인기 커뮤니티 게시글
          <router-link to="/communities" class="view-more"
            >전체 보기 →</router-link
          >
        </div>
        <div class="card-body">
          <PostList :type="'popular'" :limit="3" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ApplyHomeList from "@/components/homepage/ApplyHomeList.vue";
import PostList from "@/components/homepage/PostList.vue";
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.home {
  padding: 2rem 1rem;
  max-width: 1024px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.intro {
  display: flex;
  justify-content: center;

  .intro-wrapper {
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: var(--color-surface);
    padding: 1.5rem 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  .intro-text {
    h2 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    p {
      color: var(--color-on-surface-variant);
      font-size: 1rem;
    }
  }

  .intro-image {
    flex-shrink: 0;
    img {
      width: 120px;
      height: auto;
    }
  }
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-outline);
  background-color: var(--color-surface);
  color: var(--color-on-surface);

  .card-body {
    background-color: var(--color-on-tertiary);
    color: var(--color-on-tertiary);
    border-radius: 0 0 12px 12px;
    padding: 1rem 1.25rem;
  }
}

.card-header {
  display: flex;
  justify-content: space-between; // ← 좌우 정렬!
  align-items: center;

  background-color: var(--color-surface-variant);
  padding: 1rem 1.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-on-tertiary-container);
  border-bottom: 1px solid var(--color-outline);

  .view-more {
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-on-primary-container);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
