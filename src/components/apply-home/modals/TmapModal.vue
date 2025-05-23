<template>
  <div class="modal-backdrop">
    <div class="modal-content tmap-modal">
      <button class="close-btn" @click="$emit('close')">×</button>
      <div v-if="summaryText" class="summary-text">{{ summaryText }}</div>
      <div class="tmap-box" id="tmap-container"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick, computed } from 'vue';

const props = defineProps({
  transitResult: Array
});

const summaryText = computed(() => {
  const first = props.transitResult?.[0];
  if (!first?.properties) return '';

  const distance = (first.properties.totalDistance / 1000).toFixed(1);
  const time = Math.round(first.properties.totalTime / 60);
  const fare = first.properties.totalFare?.toLocaleString() ?? '0';
  const taxiFare = first.properties.taxiFare?.toLocaleString() ?? '0';

  return `총 거리: ${distance}km · 총 시간: ${time}분 · 통행료: ${fare}원 · 예상 택시 요금: ${taxiFare}원`;
});

function drawRoute(map) {
  props.transitResult.forEach((feature) => {
    const { geometry, properties } = feature;

    // 📍 마커
    if (geometry.type === 'Point') {
      const [lon, lat] = geometry.coordinates;
      const position = new window.Tmapv2.LatLng(lat, lon);

      let iconUrl = 'https://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_p.png';
      if (properties.pointType === 'S') {
        iconUrl = 'https://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png';
      } else if (properties.pointType === 'E') {
        iconUrl = 'https://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png';
      }

      new window.Tmapv2.Marker({
        position,
        icon: iconUrl,
        iconSize: new window.Tmapv2.Size(24, 38),
        map,
      });
    }

    // 📍 경로 라인
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

const initializeMap = async () => {
  await nextTick();
  const container = document.getElementById('tmap-container');
  if (!container) return;

  container.innerHTML = '';
  const map = new window.Tmapv2.Map(container, {
    center: new window.Tmapv2.LatLng(37.5665, 126.9780), // fallback
    width: '100%',
    height: '600px',
    zoom: 14,
  });

  // ✅ bounds 계산
  const bounds = new window.Tmapv2.LatLngBounds();

  props.transitResult.forEach((feature) => {
    const { geometry } = feature;

    if (geometry.type === 'Point') {
      const [lon, lat] = geometry.coordinates;
      bounds.extend(new window.Tmapv2.LatLng(lat, lon));
    }

    if (geometry.type === 'LineString') {
      geometry.coordinates.forEach(([lon, lat]) => {
        bounds.extend(new window.Tmapv2.LatLng(lat, lon));
      });
    }
  });

  map.fitBounds(bounds); // ✅ 중심 및 줌 자동 설정
  drawRoute(map);
};

onMounted(() => {
  initializeMap();
});

watch(
  () => props.transitResult,
  () => {
    initializeMap();
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
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

  .summary-text {
    font-size: 1rem;
    font-weight: 500;
    background-color: #f7f7f7;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    color: #333;
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