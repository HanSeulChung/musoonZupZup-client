<template>
  <div class="modal-backdrop">
    <div class="modal-content tmap-modal">
      <button class="close-btn" @click="$emit('close')">×</button>

      <div v-if="summaryText" class="summary-text">{{ summaryText }}</div>

      <div class="resubmit-bar">
        <label>출발지</label>
        <select v-model="selectedPlaceLocal">
          <option v-for="place in places" :key="place.idx" :value="place">
            {{ place.alias }} ({{ place.address }})
          </option>
        </select>

        <label>이동수단</label>
        <select v-model="selectedModeLocal">
          <option value="car">자동차</option>
          <option value="pedestrian">도보</option>
          <option value="transit">대중교통</option>
        </select>

        <button @click="emitResubmit">경로 다시 보기</button>
      </div>

      <div class="tmap-box" id="tmap-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import markerStart from '@/assets/markers/start.png';
import markerEnd from '@/assets/markers/end.png';
import markerWaypoint from '@/assets/markers/waypoint.png';

const props = defineProps({
  transitResult: Array,
  places: Array,
  selectedPlace: Object,
  mode: String,
});
const emit = defineEmits(['close', 'resubmit']);

const selectedPlaceLocal = ref(props.selectedPlace);
const selectedModeLocal = ref(props.mode);

const summaryText = computed(() => {
  const first = props.transitResult?.[0];
  if (!first) return '';

  if (props.mode === 'transit') {
    const dist = (first.totalDistance / 1000).toFixed(1);
    const time = Math.round(first.totalTime / 60);
    const fare = first.fare?.regular?.totalFare?.toLocaleString() ?? '0';
    return `총 거리: ${dist}km · 총 시간: ${time}분 · 요금: ${fare}원`;
  } else if (props.mode === 'pedestrian') {
    const dist = (first.properties.totalDistance / 1000).toFixed(1);
    const time = Math.round(first.properties.totalTime / 60);
    return `총 거리: ${dist}km · 총 시간: ${time}분`;
  } else {
    const dist = (first.properties.totalDistance / 1000).toFixed(1);
    const time = Math.round(first.properties.totalTime / 60);
    const fare = first.properties.totalFare?.toLocaleString() ?? '0';
    const taxiFare = first.properties.taxiFare?.toLocaleString() ?? '0';
    return `총 거리: ${dist}km · 총 시간: ${time}분 · 통행료: ${fare}원 · 예상 택시 요금: ${taxiFare}원`;
  }
});

const dynamicMarkers = [];

function drawRoute(map) {
  dynamicMarkers.forEach(marker => marker.setMap(null));
  dynamicMarkers.length = 0;

  if (props.mode === 'transit') {
    props.transitResult.forEach(itinerary => {
      itinerary.legs.forEach((leg, idx) => {
        const { start, end, mode, passShape, routeColor, steps } = leg;

        if (start) {
          const marker = new window.Tmapv2.Marker({
            position: new window.Tmapv2.LatLng(start.lat, start.lon),
            icon: idx === 0 ? markerStart : markerWaypoint,
            iconSize: new window.Tmapv2.Size(30, 45),
            map,
          });
          dynamicMarkers.push(marker);
        }

        if (end && idx === itinerary.legs.length - 1) {
          const marker = new window.Tmapv2.Marker({
            position: new window.Tmapv2.LatLng(end.lat, end.lon),
            icon: markerEnd,
            iconSize: new window.Tmapv2.Size(30, 45),
            map,
          });
          dynamicMarkers.push(marker);
        }

        if (mode === 'WALK') {
          if (passShape?.linestring) {
            const coords = passShape.linestring.split(' ').map(pair => {
              const [lon, lat] = pair.split(',').map(Number);
              return new window.Tmapv2.LatLng(lat, lon);
            });
            new window.Tmapv2.Polyline({
              path: coords,
              strokeColor: '#000000',
              strokeWeight: 4,
              lineStyle: 'dot',
              map,
            });
          } else if (steps) {
            steps.forEach(step => {
              if (step.linestring) {
                const coords = step.linestring.split(' ').map(pair => {
                  const [lon, lat] = pair.split(',').map(Number);
                  return new window.Tmapv2.LatLng(lat, lon);
                });
                new window.Tmapv2.Polyline({
                  path: coords,
                  strokeColor: '#000000',
                  strokeWeight: 4,
                  lineStyle: 'dot',
                  map,
                });
              }
            });
          }
        } else if (passShape?.linestring) {
          const coords = passShape.linestring.split(' ').map(pair => {
            const [lon, lat] = pair.split(',').map(Number);
            return new window.Tmapv2.LatLng(lat, lon);
          });
          new window.Tmapv2.Polyline({
            path: coords,
            strokeColor: '#' + (routeColor ?? '3b3b3b'),
            strokeWeight: 6,
            map,
          });
        }
      });
    });
  } else if (props.mode === 'pedestrian') {
    props.transitResult.forEach((feature, idx, arr) => {
      const { geometry } = feature;

      if (geometry.type === 'Point') {
        const [lon, lat] = geometry.coordinates;
        // 첫 번째 → 시작, 마지막 → 도착, 그 외 → 경유지
        const iconUrl = idx === 0
          ? markerStart
          : idx === arr.length - 1
            ? markerEnd
            : markerWaypoint;

        const marker = new window.Tmapv2.Marker({
          position: new window.Tmapv2.LatLng(lat, lon),
          icon: iconUrl,
          iconSize: new window.Tmapv2.Size(30, 45),
          map,
        });
        dynamicMarkers.push(marker);
      }

      if (geometry.type === 'LineString') {
        const path = geometry.coordinates.map(
          ([lon, lat]) => new window.Tmapv2.LatLng(lat, lon)
        );
        new window.Tmapv2.Polyline({
          path,
          strokeColor: '#000000',
          strokeWeight: 4,
          lineStyle: 'dot',
          map,
        });
      }
    });
  } else {
    props.transitResult.forEach(({ geometry, properties }) => {
      if (geometry.type === 'Point') {
        const [lon, lat] = geometry.coordinates;
        const iconUrl =
          properties.pointType === 'S' ? markerStart :
          properties.pointType === 'E' ? markerEnd :
          markerWaypoint;
        const marker = new window.Tmapv2.Marker({
          position: new window.Tmapv2.LatLng(lat, lon),
          icon: iconUrl,
          iconSize: new window.Tmapv2.Size(30, 45),
          map,
        });
        dynamicMarkers.push(marker);
      }

      if (geometry.type === 'LineString') {
        const path = geometry.coordinates.map(([lon, lat]) => new window.Tmapv2.LatLng(lat, lon));
        new window.Tmapv2.Polyline({
          path,
          strokeColor: '#ff3b3b',
          strokeWeight: 6,
          map,
        });
      }
    });
  }
}

const initializeMap = async () => {
  await nextTick();
  const container = document.getElementById('tmap-container');
  if (!container) return;

  container.innerHTML = '';
  const map = new window.Tmapv2.Map(container, {
    center: new window.Tmapv2.LatLng(37.5665, 126.9780),
    width: '100%',
    height: '600px',
    zoom: 14,
  });

  map.addListener("zoom_changed", () => drawRoute(map));

  const bounds = new window.Tmapv2.LatLngBounds();
  if (props.mode === 'transit') {
    props.transitResult.forEach(itinerary => {
      itinerary.legs.forEach(leg => {
        if (leg.passShape?.linestring) {
          leg.passShape.linestring.split(' ').forEach(pair => {
            const [lon, lat] = pair.split(',').map(Number);
            bounds.extend(new window.Tmapv2.LatLng(lat, lon));
          });
        } else if (leg.steps) {
          leg.steps.forEach(step => {
            if (step.linestring) {
              step.linestring.split(' ').forEach(pair => {
                const [lon, lat] = pair.split(',').map(Number);
                bounds.extend(new window.Tmapv2.LatLng(lat, lon));
              });
            }
          });
        }
      });
    });
  } else {
    props.transitResult.forEach(({ geometry }) => {
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
  }

  map.fitBounds(bounds);
  drawRoute(map);
};

const emitResubmit = () => {
  if (selectedPlaceLocal.value && selectedModeLocal.value) {
    emit('resubmit', {
      place: selectedPlaceLocal.value,
      mode: selectedModeLocal.value,
    });
  }
};

onMounted(() => {
  initializeMap();
});
watch(() => props.transitResult, initializeMap, { immediate: true });
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
  width: 80vw;             /* 뷰포트 너비의 90% */
  max-width: 800px;        /* 최대 800px */
  max-height: 80vh;        /* 뷰포트 높이의 90% */
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.75rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #555;

    &:hover {
      transform: scale(1.2);
      color: #d62828;
    }
  }

  .summary-text {
    font-size: 1rem;
    background-color: #f7f7f7;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    color: #333;
  }

  .resubmit-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background-color: #fafafa;
    border: 1px solid #eee;
    border-radius: 8px;

    label {
      font-size: 0.9rem;
      font-weight: 600;
    }

    select {
      padding: 0.4rem 0.6rem;
      font-size: 0.9rem;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    button {
      padding: 0.5rem 1rem;
      background-color: var(--color-primary);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;

      &:hover {
        background-color: var(--color-primary-container);
      }
    }
  }

  .tmap-box {
    width: 100%;
    height: 600px;
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
  }
}
</style>
