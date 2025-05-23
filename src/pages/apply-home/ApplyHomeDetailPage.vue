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
        <p>분양 사무실 번호: {{ detail?.businessTel }}</p>

        <button @click="openTransitModal" class="transit-btn">내 장소와 거리 비교하기</button>
      </div>

      <div class="gpt-comment">
        <div class="gpt-comment-header">
          <h3>GPT 분석 요약</h3>
          <button
            class="gpt-more-btn"
            v-if="authStore.isLoggedIn && ['USER', 'MEMBERSHIP'].includes(authStore.role) && gptComment !== null"
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
    <MembershipConfirmModal
      v-if="showModal"
      @confirm="openPaymentModal"
      @cancel="showModal = false"
    />

    <!-- 결제 모달 -->
    <MembershipPaymentModal
      v-if="showPaymentModal"
      @submit="submitPayment"
      @close="closePaymentModal"
    />


    <!-- GPT 질문 모달 -->
    <GptQueryModal
      v-if="showGptQueryModal"
      :isAsking="isAsking"
      :answer="gptAnswer"
      :history="gptHistory"
      @submit-query="submitGptQuery"
      @close="closeGptQueryModal"
    />

    <!-- 장소 선택 모달 -->
    <PlaceSelectModal
      v-if="showTransitModal"
      :places="userPlaces"
      @submit="handleTransitSubmit"
      @close="showTransitModal = false"
    />
    <!-- 경로 안내 모달 -->
    <TmapModal
      v-if="showTmapModal"
      :transitResult="transitResult"
      @close="showTmapModal = false"
    />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/libs/axios';
import { loadKakaoMap } from '@/libs/kakaoLoader';
import { useAuthStore } from '@/stores/auth';
import { formatDate, formatPriceToKorean } from '@/utils/format';
import MembershipConfirmModal from '@/components/apply-home/modals/MembershipConfirmModal.vue';
import MembershipPaymentModal from '@/components/apply-home/modals/MembershipPaymentModal.vue';
import GptQueryModal from '@/components/apply-home/modals/GptQueryModal.vue';
import PlaceSelectModal from '@/components/apply-home/modals/PlaceSelectModal.vue';
import TmapModal from '@/components/apply-home/modals/TmapModal.vue';

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


const openGptQueryModal =  async () => {
  showGptQueryModal.value = true;
  gptQueryText.value = '';
  gptAnswer.value = '';
  await fetchGptHistory(); // 이전 질문 내역 불러오기
};

const closeGptQueryModal = () => {
  showGptQueryModal.value = false;
};

const submitGptQuery = async (query) => {
  isAsking.value = true;
  try {
    const res = await api.get('/applyhome/ms/searchDetail', {
      params: {
        idx: route.params.id,
        request: query,
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

const submitPayment = async ({ cardNumber, name }) => {
  try {
    await api.patch('/members/upgrade');
    alert('멤버십 결제가 완료되었습니다!');
    showPaymentModal.value = false;

    await authStore.fetchProfile(); // 실패해도 로그인 유지
  } catch (err) {
    console.error('멤버십 업데이트 실패:', err);
    alert('결제에 실패했습니다. 다시 시도해주세요.');
  }
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

const handleTransitSubmit = ({ place, mode }) => {
  selectedPlace.value = place;
  selectedMode.value = mode;
  requestTransitRoute(); // 이 안에서 mode에 따라 API 분기 처리
  showTransitModal.value = false;
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

const userPlaces = ref([]);
const showTransitModal = ref(false);

const fetchUserPlaces = async () => {
  try {
    const res = await api.get('/members/registPlace');
    userPlaces.value = res.data || [];
    console.log("userPlaces: ", userPlaces.value)
  } catch (err) {
    console.error('장소 불러오기 실패:', err);
  }
};
const selectedPlace = ref(null);
const selectedMode = ref(null);
const transitResult = ref([]); // POST 결과
const showTmapModal = ref(false);

const requestTransitRoute = async () => {
  if (!selectedPlace.value || !detail.value?.geo) return;

  const reqBody = {
    startPlaceAlias: selectedPlace.value.alias,
    startPlaceAddress: selectedPlace.value.address,
    startX: selectedPlace.value.x,
    startY: selectedPlace.value.y,
    endPlaceAlias: detail.value.houseName,
    endPlaceAddress: detail.value.houseAddress,
    endX: detail.value.geo.x,
    endY: detail.value.geo.y
  };

  const mode = selectedMode.value === 'pedestrian' ? 'pedestrian' : 'car';
  const url = mode === 'pedestrian' ? '/route/pedestrian' : '/route/car';

  console.log(`${mode.toUpperCase()} 경로 요청 reqBody:`, reqBody);

  try {
    const res = await api.post(url, reqBody);
    transitResult.value = res.data.route.features;
    showTmapModal.value = true;

    nextTick(() => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  } catch (err) {
    alert(`${mode === 'pedestrian' ? '도보' : '자동차'} 경로 요청 실패`);
    console.error(err);
  }
};


const openTransitModal = async () => {
  await fetchUserPlaces(); // 내 장소 목록 불러오기
  showTransitModal.value = true;
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

.transit-btn {
  margin-top: 1.5rem;
  background-color: var(--color-primary);
  color: white;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-primary-container);
  }
}

.modal-content.tmap-modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  max-width: 1200px;
  width: 95%;
  height: auto;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: transparent;
    border: none;
    font-size: 1.75rem;
    font-weight: bold;
    color: #555;
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;

    &:hover {
      transform: scale(1.2);
      color: #d62828;
    }
  }

  .tmap-box {
    width: 100%;
    height: 600px;
    border-radius: 12px;
    border: 1px solid #ddd;
    overflow: hidden;
  }
}
</style>