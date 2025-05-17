<template>
  <section class="community-page">
    <h2 class="page-title">내가 작성한 게시물</h2>

    <div class="post-list">
      <div class="post-card" v-for="post in posts.content" :key="post.idx">
        <div class="card-left">
          <h3 class="title">
            <router-link :to="`/communities/${post.idx}`">{{
              post.title
            }}</router-link>
          </h3>
          <div class="stats">
            <span>조회수 {{ post.views }}</span>
            <span>댓글수 {{ post.commentCnt }}</span>
            <span>좋아요 {{ post.like }}</span>
            <span>싫어요 {{ post.disLike }}</span>
          </div>
        </div>
        <div class="card-right">
          <span class="date">{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="pagination">
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
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/libs/axios";

const router = useRouter();
const authStore = useAuthStore();

const posts = ref({
  content: [],
  totalPages: 0,
  first: true,
  last: false,
});
const currentPage = ref(0);
const pageSize = 10;

const fetchMyPosts = async () => {
  try {
    const res = await api.get("/community/member/myposts", {
      params: {
        page: currentPage.value,
        size: pageSize,
      },
    });
    posts.value = res.data;
  } catch (err) {
    console.error("내 게시물 목록 불러오기 실패:", err);
    alert("내 게시물을 불러오는 중 오류가 발생했습니다.");
  }
};

const changePage = (page) => {
  if (page < 0 || page >= posts.value.totalPages) return;
  currentPage.value = page;
  fetchMyPosts();
};

const formatDate = (str) => new Date(str).toLocaleDateString();

onMounted(() => {
  if (!authStore.isLoggedIn) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }
  fetchMyPosts();
});
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.community-page {
  margin: 0;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 60%;
  min-height: calc(100vh - 160px);

  .page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-on-surface);
  }

  .post-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .post-card {
    display: flex;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--color-outline);
    background-color: var(--color-surface);
    border-radius: 12px;
    transition: box-shadow 0.2s;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

    &:hover {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }

    .card-left {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .title {
        font-size: 1.1rem;
        font-weight: 600;

        a {
          color: var(--color-on-surface);
          text-decoration: none;

          &:hover {
            color: var(--color-primary);
            text-decoration: underline;
          }
        }
      }

      .stats {
        font-size: 0.85rem;
        color: var(--color-on-surface-variant);
        display: flex;
        gap: 1rem;
      }
    }

    .card-right {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      height: 100%;

      .date {
        font-size: 1rem;
        color: var(--color-on-surface-variant);
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;

    button {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
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
