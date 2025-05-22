<template>
  <section class="apply-home-detail">
    <div class="go-to-list">
        <router-link to="/apply-homes" class="list-link">← 목록으로 돌아가기</router-link>
    </div>
    <div class="detail-content">
      <!-- 지도 영역 -->
      <div class="map-section">
        <div class="summary-card">
          <span>{{ detail?.houseAddress }}</span>
          <button
            v-if="authStore.isLoggedIn && ['USER', 'MEMBERSHIP'].includes(authStore.role)"
            @click="toggleLike"
            :class="['like-btn', { liked: liked.value }]"
          >
            {{ liked.valueOf(true) ? '💔 찜 취소' : '❤️ 찜하기' }}
          </button>
        </div>
        <div v-if="detail?.geo" class="map" ref="mapContainer"></div>
        <p v-else class="map-loading">위치 정보를 가져오는 중입니다...</p>
      </div>

      <!-- 정보 영역 -->
      <div class="info">
        <div class="header-line">
          <h2>{{ detail?.houseName }}</h2>
          <a :href="detail?.applyhomeUrl" class="external-link" target="_blank">청약홈 바로가기 →</a>
        </div>
        <p class="address">{{ detail?.houseAddress }}</p>
        <p>공급 세대 수: {{ detail?.suplyCount }}세대</p>
        <p>공급 금액: {{ formatPriceToKorean(detail?.suplyPrice) }}</p>
        <p>공고일: {{ formatDate(detail?.pblancDate) }}</p>
        <p>공고 번호: {{ detail?.pblancNo }}</p>
        <p>당첨 발표일: {{ formatDate(detail?.applyAnnounceDate) }}</p>
        <p>청약기간: {{ formatDate(detail?.applyStartDate) }} ~ {{ formatDate(detail?.applyEndDate) }}</p>
    </div>

      <div class="gpt-comment">
        <div class="gpt-comment-header">
          <h3>GPT 분석 요약</h3>
          <button
            class="gpt-more-btn"
            v-if="authStore.isLoggedIn && (authStore.role === 'USER' || authStore.role === 'MEMBERSHIP') && gptComment"
            @click="handleGptMoreClick"
          >
            GPT 분석 더 알아보기
          </button>
        </div>

        <p v-if="gptComment === null">GPT 분석 중입니다...</p>
        <p v-else-if="!gptComment">분석 결과가 존재하지 않습니다.</p>
        <p v-else class="gpt-text">{{ gptComment }}</p>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <!-- 멤버십 전환 안내 모달 -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-content">
        <p>멤버십 전환이 필요합니다. 전환 하시겠습니까?</p>
        <div class="modal-buttons">
          <button @click="openPaymentModal">예</button>
          <button @click="showModal = false">아니오</button>
        </div>
      </div>
    </div>

    <!-- 결제 모달 -->
    <div v-if="showPaymentModal" class="modal-backdrop">
      <div class="modal-content">
        <h3>멤버십 결제</h3>
        <p>GPT 상세 분석을 보려면 멤버십 가입이 필요합니다.</p>
        <form @submit.prevent="submitPayment">
          <label>
            카드 번호:
            <input v-model="cardNumber" placeholder="1234-5678-9012-3456" required />
          </label>
          <label>
            이름:
            <input v-model="name" required />
          </label>
          <button type="submit">결제하기 (₩9,900)</button>
          <button type="button" @click="closePaymentModal">닫기</button>
        </form>
      </div>
    </div>

    <!-- GPT 질문 모달 -->
    <div
    v-if="showGptQueryModal"
    class="modal-backdrop"
    @mousedown.self="closeGptQueryModal"
    >
        <div
            class="modal-content gpt-modal"
            ref="gptModal"
            :style="{ top: gptModalTop + 'px', left: gptModalLeft + 'px' }"
        >
            <!-- 드래그 영역 -->
            <div class="modal-header" @mousedown="startDragging">
            <h3>GPT에게 물어보기</h3>
            <button class="close-btn" @click="closeGptQueryModal">×</button>
            </div>

            <p>궁금한 내용을 입력하세요:</p>

            <form @submit.prevent="submitGptQuery">
            <textarea v-model="gptQueryText" placeholder="예: 주변 교통은 어떤가요?" required />
            <button type="submit" class="submit-btn" :disabled="isAsking">
                {{ isAsking ? '질문 중...' : '질문하기' }}
            </button>
            </form>

            <div class="gpt-answer" v-if="isAsking || gptAnswer">
            <h4>답변 결과</h4>
            <p v-if="isAsking" class="loading-animation">GPT가 답변을 작성 중입니다...</p>
            <p v-else>{{ gptAnswer }}</p>
            </div>
            
            <div v-if="gptHistory.length > 0" class="gpt-history">
            <h4>이전 질문 내역</h4>
            <ul>
                <li v-for="(item, index) in gptHistory" :key="index">
                <strong>Q.</strong> {{ item.request }}  
                <br />
                <strong>A.</strong> {{ item.comment }}
                </li>
            </ul>
            </div>
        </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/libs/axios';
import { loadKakaoMap } from '@/libs/kakaoLoader';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const liked = ref(false);
const route = useRoute();
const router = useRouter();
const detail = ref(null);
const gptComment = ref(null);
const mapContainer = ref(null);

const showModal = ref(false);
const showPaymentModal = ref(false);
const cardNumber = ref('');
const name = ref('');
const showGptQueryModal = ref(false);
const gptQueryText = ref('');
const gptAnswer = ref('');
const isAsking = ref(false);

const gptModal = ref(null);
const gptModalTop = ref(100);
const gptModalLeft = ref(window.innerWidth / 2 - 300);

let isDragging = false;
let offsetX = 0;
let offsetY = 0;


const gptHistory = ref([]);
const fetchGptHistory = async () => {
  try {
    const res = await api.get('/applyhome/ms/allComments', {
      params: { idx: route.params.id }
    });

    console.log(res.data)
    gptHistory.value = res.data;
  } catch (err) {
    console.error('이전 GPT 질문 내역 불러오기 실패:', err);
  }
};


const startDragging = (e) => {
  isDragging = true;
  offsetX = e.clientX - gptModalLeft.value;
  offsetY = e.clientY - gptModalTop.value;
  document.addEventListener('mousemove', dragModal);
  document.addEventListener('mouseup', stopDragging);
};

const dragModal = (e) => {
  if (!isDragging) return;
  gptModalLeft.value = e.clientX - offsetX;
  gptModalTop.value = e.clientY - offsetY;
};

const stopDragging = () => {
  isDragging = false;
  document.removeEventListener('mousemove', dragModal);
  document.removeEventListener('mouseup', stopDragging);
};

const openGptQueryModal =  async () => {
  showGptQueryModal.value = true;
  gptQueryText.value = '';
  gptAnswer.value = '';
  await fetchGptHistory(); // 이전 질문 내역 불러오기
};

const closeGptQueryModal = () => {
  showGptQueryModal.value = false;
};

const submitGptQuery = async () => {
  isAsking.value = true;
  try {
    const res = await api.get('/applyhome/ms/searchDetail', {
      params: {
        idx: route.params.id,
        request: gptQueryText.value
      }
    });
    gptAnswer.value = res.data;
  } catch (err) {
    gptAnswer.value = '답변을 가져오는 데 실패했습니다.';
    console.error('GPT 분석 실패:', err);
  } finally {
    isAsking.value = false;
  }
};

const openPaymentModal = () => {
  showModal.value = false;
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
};

const submitPayment = () => {
  alert(`"${name.value}"님 결제 완료되었습니다!`);
  closePaymentModal();
};

const handleGptMoreClick = () => {
  const role = authStore.role;
  if (!authStore.isLoggedIn) {
    router.push('/login');
  } else if (role === 'USER') {
    showModal.value = true;
  } else {
    // MEMBERSHIP 이상
    openGptQueryModal();
  }
};

const fetchLikeStatus = async () => {
  if (!authStore.isLoggedIn) return;
  try {
    const res = await api.get('/applylike/list');
    const likedList = res.data.content || [];
    liked.value = likedList.some(item => item.applyIdx == route.params.id);
  } catch (err) {
    console.error('찜 상태 불러오기 실패:', err);
  }
};

const toggleLike = async () => {
  const id = route.params.id;
  try {
    if (liked.value) {
      await api.delete(`/applylike/${id}`);
      liked.value = false;
    } else {
      await api.post(`/applylike/${id}`);
      liked.value = true;
    }
  } catch (err) {
    console.error('찜 상태 변경 실패:', err);
  }
};

const fetchDetailHome = async () => {
  const res = await api.get('/applyhome/detail/apply', {
    params: { idx: route.params.id }
  });
  detail.value = res.data.pblanc;
  console.log(detail.value);
};

const fetchDetailGpt = async () => {
  const res = await api.get('/applyhome/detail/gpt', {
    params: { idx: route.params.id }
  });
  gptComment.value = res.data.comment;
};

const formatDate = (str) => new Date(str).toLocaleDateString();
const formatPriceToKorean = (price) => {
  if (!price && price !== 0) return '-';
  const amount = price * 10000;

  const 억 = Math.floor(amount / 100000000); // 1억 = 100,000,000
  const 만 = Math.floor((amount % 100000000) / 10000); // 나머지 만 단위

  let result = '';
  if (억 > 0) result += `${억}억`;
  if (만 > 0) result += ` ${만}만원`;

  return result.trim();
};

const loadMap = async () => {
  if (!detail.value?.geo) return;
  const kakaoKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
  await loadKakaoMap(kakaoKey);
  const { x, y } = detail.value.geo;
  const container = mapContainer.value;
  const options = {
    center: new window.kakao.maps.LatLng(y, x),
    level: 3,
  };
  const map = new window.kakao.maps.Map(container, options);
  new window.kakao.maps.Marker({ map, position: new window.kakao.maps.LatLng(y, x) });
};

watch(
    () => detail.value?.geo,
    async (geo) => {
        if (geo) {
        await nextTick();
        loadMap();
        }
    }
);
onMounted(async () => {
  await Promise.all([fetchDetailHome(), fetchDetailGpt()]);
  await fetchLikeStatus();
});
</script>

<style scoped lang="scss">
.apply-home-detail {
  max-width: 1024px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: calc(100vh - 160px);

  .detail-content {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    margin-top: 0.8rem;

    .map-section {
      flex: 1;
      min-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .summary-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: var(--color-surface);
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--color-on-surface);

        .like-btn {
          padding: 0.4rem 0.8rem;
          font-size: 0.9rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          background-color: var(--color-primary-container);
          color: var(--color-on-primary-container);
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--color-primary);
            color: white;
          }

          &.liked {
            background-color: var(--color-secondary-container);
            color: var(--color-on-secondary-container);

            &:hover {
              background-color: var(--color-secondary);
              color: white;
            }
          }
        }
      }

      .map {
        height: 400px;
        border-radius: 8px;
        border: 1px solid var(--color-outline);
        background-color: #eee;
      }
    }

    .info {
      flex: 1;
      min-width: 450px;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .header-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;

        h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--color-on-surface);
        }

        .external-link {
          font-size: 0.9rem;
          color: var(--color-primary);
          font-weight: 500;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .address {
        color: var(--color-on-surface-variant);
      }
    }

    .gpt-comment {
      background-color: var(--color-surface-variant);
      padding: 1rem;
      border-radius: 8px;

      .gpt-comment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-weight: bold;
          font-size: 1.1rem;
          color: var(--color-on-surface);
        }

        .gpt-more-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          background-color: var(--color-primary);
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;

          &:hover {
            background-color: var(--color-primary-container);
            transform: scale(1.05);
          }

          &:active {
            transform: scale(0.97);
          }
        }
      }

      .gpt-text {
        white-space: pre-line;
        font-size: 0.95rem;
        line-height: 1.6;
        margin-top: 0.75rem;
      }
    }
  }
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
    text-align: center;

    .modal-buttons {
      display: flex;
      justify-content: space-around;
      margin-top: 1rem;

      button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;

        &:first-child {
          background-color: var(--color-primary);
          color: white;
        }

        &:last-child {
          background-color: #ddd;
        }
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      label {
        text-align: left;
        font-weight: 500;
        font-size: 0.9rem;
      }

      input {
        padding: 0.5rem;
        font-size: 0.95rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      button[type="submit"] {
        background-color: var(--color-primary);
        color: white;
        font-weight: bold;
        border: none;
        padding: 0.5rem;
        border-radius: 5px;
        margin-top: 1rem;
        cursor: pointer;

        &:hover {
          background-color: var(--color-primary-container);
        }
      }

      button[type="button"] {
        background-color: #ddd;
        color: black;
        margin-top: 0.5rem;
      }
    }
  }
}
.modal-content.gpt-modal {
    position: absolute; // 드래그 가능하게
    width: 600px;
    max-height: 90vh;
    overflow-y: auto;

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;

        h3 {
        margin: 0;
        font-size: 1.2rem;
        }

        .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        }
    }
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    textarea {
      resize: vertical;
      padding: 0.6rem;
      font-size: 1rem;
      min-height: 100px;
      border-radius: 6px;
      border: 1px solid #ccc;
    }

   .submit-btn {
        background-color: var(--color-primary);
        color: white;
        font-weight: bold;
        border: none;
        padding: 0.6rem;
        border-radius: 5px;
        cursor: pointer;

        &:disabled {
            background-color: gray;
            cursor: not-allowed;
        }
    }
  }

  .gpt-answer {
    margin-top: 1.5rem;
    background-color: #f8f8f8;
    padding: 1rem;
    border-radius: 6px;
    line-height: 1.6;
    white-space: pre-line;
  }
}

.gpt-history {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f6f6f6;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.9rem;

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 1rem;
      line-height: 1.4;

      strong {
        display: inline-block;
        color: var(--color-primary);
        width: 1.5rem;
      }
    }
  }
}
.go-to-list {

  .list-link {
    font-size: 0.95rem;
    color: var(--color-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

</style>