<template>
  <section class="my-posts-page">
    <h2 class="title">내가 작성한 게시글</h2>
    <p class="post-count">총 {{ posts.totalElements }}개</p>
    <div v-if="posts.content.length > 0" class="post-list">
      <div class="post-card" v-for="post in posts.content" :key="post.idx">
        <router-link :to="`/communities/${post.idx}`" class="post-title">
          {{ post.title }}
        </router-link>
        <p class="meta">
          {{ formatDate(post.createdAt) }} · 조회수 {{ post.views }}
        </p>
      </div>
    </div>

    <div v-else class="empty-message">작성한 게시글이 없습니다.</div>

    <div class="pagination" v-if="posts.totalPages > 1">
      <button :disabled="posts.first" @click="changePage(currentPage - 1)">
        이전
      </button>
      <span>{{ currentPage + 1 }} / {{ posts.totalPages }}</span>
      <button :disabled="posts.last" @click="changePage(currentPage + 1)">
        다음
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/libs/axios";
import { useRouter } from "vue-router";

const posts = ref({
  content: [],
  totalPages: 0,
  totalElements: 0,
  first: true,
  last: false,
});
const currentPage = ref(0);
const pageSize = 10;
const router = useRouter();

const fetchPosts = async () => {
  try {
    const res = await api.get("/community/member/list", {
      params: { page: currentPage.value, size: pageSize },
    });
    posts.value = res.data;
    // console.log(posts.value)
  } catch (err) {
    console.error("내 게시글 조회 실패:", err);
    alert("게시글 정보를 가져오는 데 실패했습니다.");
  }
};

const changePage = (page) => {
  if (page < 0 || page >= posts.value.totalPages) return;
  currentPage.value = page;
  fetchPosts();
};

const formatDate = (str) => new Date(str).toLocaleDateString();

onMounted(fetchPosts);
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.my-posts-page {
  min-width: 60%;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: calc(100vh - 160px);
  .title {
    font-size: 1.75rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .post-count {
    font-size: 0.95rem;
    color: var(--color-on-surface-variant);
    margin-bottom: 1.5rem;
  }
  .post-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .post-card {
      padding: 1rem;
      border: 1px solid var(--color-outline);
      border-radius: 8px;
      background-color: var(--color-background);

      .post-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .meta {
        font-size: 0.9rem;
        color: var(--color-on-surface-variant);
        margin-top: 0.4rem;
      }
    }
  }

  .empty-message {
    text-align: center;
    color: var(--color-on-surface-variant);
    margin-top: 2rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;

    button {
      padding: 0.5rem 1rem;
      background-color: var(--color-primary-container);
      color: var(--color-on-primary-container);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }
}
</style>
