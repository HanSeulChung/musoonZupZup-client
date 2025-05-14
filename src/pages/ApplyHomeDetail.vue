<template>
    <section class="apply-home-detail">
    <div class="detail-content">
        <!-- 지도 영역 -->
        <div class="map-section">
            <div class="summary-card">
                <span>{{ detail?.houseAddress }}</span>
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
            <p>공고일: {{ formatDate(detail?.pblancDate) }}</p>
            <p>공고 번호: {{ detail?.pblancNo }}</p>
            <p>당첨 발표일: {{ formatDate(detail?.applyAnnounceDate) }}</p>
            <p>청약기간: {{ formatDate(detail?.applyStartDate) }} ~ {{ formatDate(detail?.applyEndDate) }}</p>
        </div>

        <div class="gpt-comment">
            <h3>GPT 분석 요약</h3>
            <p v-if="gptComment === null">GPT 분석 중입니다...</p>
            <p v-else-if="!gptComment">분석 결과가 존재하지 않습니다.</p>
            <p v-else class="gpt-text">{{ gptComment }}</p>
        </div>
    </div>
    </section>
</template>


<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/libs/axios';
import { loadKakaoMap } from '@/libs/kakaoLoader';

const route = useRoute();
const detail = ref(null);
const gptComment = ref(null);
const mapContainer = ref(null);

import { watch } from 'vue';

watch(
    () => detail.value?.geo,
    async (geo) => {
        if (geo) {
        await nextTick();
        loadMap();
        }
    }
);


const fetchDetail = async () => {
    const res = await api.get('/applyhome/detail', {
        params: {
        idx: route.params.id
        }
    });
    detail.value = res.data.pblanc;
    gptComment.value = res.data.gptComment.comment;
};

const formatDate = (str) => new Date(str).toLocaleDateString();

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
    new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(y, x),
    });
};

onMounted(fetchDetail);
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
        flex-wrap: wrap; // 모바일 대응
        margin-top: 2rem;
        .map-section {
            flex: 1;
            min-width: 400px;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;

            .summary-card {
                display: flex;
                justify-content: space-around;
                align-items: center;
                padding: 0.75rem 1rem;
                background-color: var(--color-surface);
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                font-size: 0.9rem;
                font-weight: 500;
                color: var(--color-on-surface);
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
                a {
                    margin: 0;
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

        .external-link {
            margin-top: 1rem;
            color: var(--color-primary);
            font-weight: 500;
            text-decoration: none;

            &:hover {
            text-decoration: underline;
            }
        }
        }
        .gpt-comment {
            background-color: var(--color-surface-variant);
            padding: 1rem;
            border-radius: 8px;

            h3 {
            margin-bottom: 0.5rem;
            font-weight: bold;
            }
            .gpt-text {
                white-space: pre-line; // \n을 줄바꿈으로 표시해줌
                font-size: 0.95rem;
                line-height: 1.6;
            }
        }
    }
}

</style>
