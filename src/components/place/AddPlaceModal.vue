<template>
  <div class="modal">
    <div class="modal-content">
      <h3>장소 추가</h3>
      <input v-model="keyword" placeholder="장소를 검색하세요" class="input" />
      <button @click="searchPlaces">검색</button>

      <ul class="results" v-if="places.length > 0">
        <li
          v-for="(place, index) in places"
          :key="index"
          @click="selectPlace(place)"
          :class="{ selected: selectedPlace && selectedPlace.id === place.id }"
        >
          {{ place.place_name }}<br />
          <small>{{ place.road_address_name || place.address_name }}</small>
        </li>
      </ul>

      <div v-if="selectedPlace" class="alias-section">
        <p>선택된 장소: {{ selectedPlace.place_name }}</p>
        <input v-model="alias" placeholder="별칭을 입력하세요" class="input" />
        <button @click="confirmAddPlace">추가하기</button>
      </div>

      <button class="close-btn" @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const keyword = ref("");
const alias = ref("");
const places = ref([]);
const selectedPlace = ref(null);

const searchPlaces = () => {
  if (!window.kakao || !window.kakao.maps) {
    alert("카카오 맵이 로드되지 않았습니다.");
    return;
  }

  const ps = new kakao.maps.services.Places();
  ps.keywordSearch(keyword.value, (data, status) => {
    if (status === kakao.maps.services.Status.OK) {
      places.value = data;
    } else {
      alert("검색 결과가 없습니다.");
    }
  });
};

const selectPlace = (place) => {
  selectedPlace.value = place;
};

const confirmAddPlace = () => {
  if (!alias.value.trim()) {
    alert("별칭을 입력해주세요.");
    return;
  }

  const payload = {
    alias: alias.value,
    address:
      selectedPlace.value.road_address_name || selectedPlace.value.address_name,
  };

  // 부모에게 등록 요청 emit
  emit("add", payload);
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.5rem 0;
}

.results {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.results li {
  padding: 0.5rem;
  border: 1px solid #ddd;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.results li.selected {
  background-color: #f0f8ff;
  border-color: #3498db;
}

.alias-section {
  margin-top: 1rem;
}

.close-btn {
  margin-top: 1rem;
}
</style>
