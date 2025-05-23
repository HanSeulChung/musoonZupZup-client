<template>
  <div class="modal-overlay">
    <div class="modal-content">
        <button class="close-button" @click="emit('close')">×</button>
      <div class="tmap-wrapper">
        <div class="summary" v-if="summaryText">{{ summaryText }}</div>
        <div ref="tmapContainer" class="tmap-box"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';

// ✅ 로컬 마커 이미지 import
import startMarker from '@/assets/markers/start.png';
import endMarker from '@/assets/markers/start.png';
import normalMarker from '@/assets/markers/start.png';

const props = defineProps({
  transitResult: Array,
});
const emit = defineEmits(['close']);

const tmapContainer = ref(null);
let mapInstance = null;

// ✅ 총 거리, 시간, 요금 요약
const summaryText = computed(() => {
  const first = props.transitResult?.[0];
  if (!first?.properties) return '';

  const distance = (first.properties.totalDistance / 1000).toFixed(1);
  const time = Math.round(first.properties.totalTime / 60);
  const fare = first.properties.totalFare?.toLocaleString() ?? '0';
  const taxiFare = first.properties.taxiFare?.toLocaleString() ?? '0';

  return `총 거리 : ${distance}km, 총 시간 : ${time}분, 총 요금 : ${fare}원, 예상 택시 요금 : ${taxiFare}원`;
});

// ✅ 지도 초기화
const initializeMap = () => {
  const container = tmapContainer.value;
  if (!container) {
    console.warn('❗ container 없음');
    return;
  }

  const rect = container.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    setTimeout(initializeMap, 200);
    return;
  }

  if (mapInstance && mapInstance.destroy) {
    mapInstance.destroy();
  } else {
    container.innerHTML = '';
  }

  const center = getInitialCenter();
  mapInstance = new window.Tmapv2.Map(container, {
    center,
    width: '100%',
    height: '500px',
    zoom: 14,
  });

  drawRoute(mapInstance);
};

const safeInitialize = async () => {
  await nextTick();
  setTimeout(() => {
    initializeMap();
  }, 100);
};

onMounted(() => {
  safeInitialize();
});

watch(
  () => props.transitResult,
  (newVal) => {
    if (newVal?.length > 0) {
      safeInitialize();
    }
  },
  { immediate: true }
);

// ✅ 중심 좌표 계산
function getInitialCenter() {
  const first = props.transitResult?.[0];
  if (first?.geometry?.coordinates) {
    const [lon, lat] = first.geometry.coordinates;
    return new window.Tmapv2.LatLng(lat, lon);
  }
  return new window.Tmapv2.LatLng(37.5665, 126.9780); // fallback 서울시청
}

// ✅ 경로 및 마커 그리기
function drawRoute(map) {
  props.transitResult.forEach((feature) => {
    const { geometry, properties } = feature;

    // 📍 마커 처리
    if (geometry.type === 'Point') {
      const [lon, lat] = geometry.coordinates;
      const position = new window.Tmapv2.LatLng(lat, lon);

      let icon = normalMarker;
      if (properties.pointType === 'S') {
        icon = startMarker;
      } else if (properties.pointType === 'E') {
        icon = endMarker;
      }

      new window.Tmapv2.Marker({
        position,
        icon,
        iconSize: new window.Tmapv2.Size(24, 38),
        map,
      });
    }

    // 📍 선 경로 처리
    if (geometry.type === 'LineString') {
      const path = geometry.coordinates.map(([lon, lat]) =>
        new window.Tmapv2.LatLng(lat, lon)
      );

      new window.Tmapv2.Polyline({
        path,
        strokeColor: '#ff3b3b',
        strokeWeight: 6,
        map,
      });
    }
  });
}
</script>

<style scoped lang="scss">
/* ✅ 모달 전체 배경 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* ✅ 모달 본체 */
.modal-content {
  background-color: #fff;
  width: 800px;
  max-width: 90%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  position: relative;
  padding: 1.5rem;
}

/* ✅ 닫기 버튼 */
.close-button {
  position: absolute;
  top: 1rem;
  right: 1.2rem;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #888;
  transition: color 0.2s ease;
}
.close-button:hover {
  color: #222;
}

.tmap-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.summary {
  font-weight: 500;
  font-size: 16px;
  padding: 0.5rem 1rem;
  background-color: #f7f7f7;
  border-radius: 6px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.05);
}
.tmap-box {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  overflow: hidden;
}
</style>