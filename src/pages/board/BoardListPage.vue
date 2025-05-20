<template>
  <section class="community-page">
    <div class="header-with-button">
      <h2 class="page-title">
        {{ boardType === "notice" ? "공지사항" : "커뮤니티 게시글" }}
      </h2>
      <p class="post-count">총 {{ posts.totalElements }}개</p>

      <button v-if="canWrite" class="create-btn" @click="goToCreatePage">
        {{ boardType === "notice" ? "공지사항 작성하기" : "게시글 작성하기" }}
      </button>
    </div>

    <div class="post-list">
      <div class="post-card" v-for="post in posts.content" :key="post.idx">
        <div class="card-left">
          <h3 class="title">
            <router-link :to="`/${boardTypeUrl}/${post.idx}`">{{
              post.title
            }}</router-link>
          </h3>
          <div class="stats" v-if="boardType === 'community'">
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
import { ref, onMounted, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/libs/axios";

const auth = useAuthStore();
const { role, isLoggedIn } = storeToRefs(auth);

const props = defineProps({
  boardType: { type: String, required: true }, // 'community' or 'notice'
});

const router = useRouter();
const boardTypeUrl = computed(() => {
  return props.boardType === "notice" ? "notices" : "communities";
});

// 게시글 작성 버튼을 보여줄지 여부
const canWrite = computed(() => {
  if (!isLoggedIn.value) return false;
  if (props.boardType === "notice") {
    return role.value === "ADMIN" || role.value === "MASTER";
  }
  if (props.boardType === "community") {
    return role.value === "USER" || role.value === "MEMBERSHIP";
  }
  return false;
});

const posts = ref({
  content: [],
  totalPages: 0,
  totalElements: 0,
  first: true,
  last: false,
});
const currentPage = ref(0);
const pageSize = 10;

const fetchPosts = async () => {
  try {
    const endpoint =
      props.boardType === "notice" ? "/notice/list" : "/community/list";
    const res = await api.get(endpoint, {
      params: { page: currentPage.value, size: pageSize },
    });
    posts.value = res.data;
  } catch (err) {
    console.error("게시글 목록 조회 실패:", err);
  }
};

const changePage = (page) => {
  if (page < 0 || page >= posts.value.totalPages) return;
  currentPage.value = page;
  fetchPosts();
};

const formatDate = (str) => new Date(str).toLocaleDateString();

const goToCreatePage = () => {
  if (!auth.isLoggedIn) {
    alert("로그인이 필요합니다.");
    router.push("/login");
  } else {
    router.push(`/${boardTypeUrl.value}/create`);
  }
};

onMounted(fetchPosts);
watch(() => props.boardType, fetchPosts); // boardType이 바뀌면 다시 fetch
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.community-page {
  margin: 0;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1024px;
  min-height: calc(100vh - 160px);

  .header-with-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--color-on-surface);
    }

    .post-count {
      font-size: 0.95rem;
      color: var(--color-on-surface-variant);
      margin-top: 0.25rem;
    }

    .create-btn {
      background-color: var(--color-primary-container);
      color: var(--color-on-primary-container);
      padding: 0.5rem 1rem;
      font-size: 0.95rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--color-primary);
        color: white;
      }
    }
  }

  .post-list {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .post-card {
    display: flex;
    justify-content: space-between;
    padding: 1.2rem 1.5rem;
    border: 1px solid var(--color-outline);
    border-radius: 12px;
    background-color: var(--color-surface);
    transition: box-shadow 0.2s;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
        gap: 1.2rem;
      }
    }

    .card-right {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      min-width: 100px;

      .date {
        font-size: 0.95rem;
        color: var(--color-on-surface-variant);
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-top: 2rem;

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
