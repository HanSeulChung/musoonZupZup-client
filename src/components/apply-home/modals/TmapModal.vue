<!-- src/components/apply-home/modals/TmapModal.vue -->
<template>
  <div class="modal-backdrop">
    <div class="modal-content tmap-modal">
      <button class="close-btn" @click="$emit('close')">×</button>
      <div class="tmap-box" id="tmap-container"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, nextTick, ref } from 'vue';

const props = defineProps({
  transitResult: Array
});
const emit = defineEmits(['close']);
const mapRef = ref(null);

function drawRoute(map) {
  props.transitResult.forEach((feature) => {
    const { geometry, properties } = feature;

    // 📍 시작/도착 마커
    if (geometry.type === 'Point') {
      const [lon, lat] = geometry.coordinates;
      const position = new window.Tmapv2.LatLng(lat, lon);

      let iconUrl = '';
      if (properties.pointType === 'S') {
        iconUrl = 'https://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_s.png';
      } else if (properties.pointType === 'E') {
        iconUrl = 'https://tmapapi.sktelecom.com/upload/tmap/marker/pin_r_m_e.png';
      }

      if (iconUrl) {
        new window.Tmapv2.Marker({
          position,
          icon: iconUrl,
          iconSize: new window.Tmapv2.Size(24, 38),
          map,
        });
      }
    }

    // 📍 경로 선
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

  container.innerHTML = ''; // 이전 지도 제거
  const center = new window.Tmapv2.LatLng(37.5665, 126.9780);

  const map = new window.Tmapv2.Map(container, {
    center,
    width: '100%',
    height: '600px',
    zoom: 14,
  });

  mapRef.value = map;

  if (props.transitResult?.length > 0) {
    drawRoute(map);
  }
};

onMounted(() => {
  initializeMap();
});

watch(
  () => props.transitResult,
  () => {
    initializeMap();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 150);
  }
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

  .tmap-box {
    width: 100%;
    height: 600px;
    border-radius: 12px;
    border: 1px solid #ddd;
    overflow: hidden;
  }
}
</style>
