<template>
    <section class="my-places-page">
        <div class="header">
        <h2 class="title">내 관심 장소</h2>
        <button
            class="add-btn"
            @click="goToAddPage"
            :disabled="places.length >= 3"
        >
            장소 등록하기
        </button>
        </div>

        <div class="place-count">장소 개수: {{ placesCount }}</div>

        <div class="place-list" v-if="places.length > 0">
        <div v-for="place in places" :key="place.idx" class="place-card">
            <p class="alias">{{ place.alias }}</p>
            <p class="address">{{ place.address }}</p>
            <button class="delete-btn" @click="deletePlace(place.idx)">삭제</button>
        </div>
        </div>

        <div v-else class="empty-message">등록된 장소가 없습니다.</div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/libs/axios'

const router = useRouter()
const places = ref([])
const placesCount = ref(0)

const fetchPlacesCount = async () => {
    try {
        const res = await api.get('/members/registPlace/cnt')
        placesCount.value = res.data
    } catch (err) {
        console.error('장소 개수 불러오기 실패:', err)
        alert('장소 개수 정보를 가져오는 데 실패했습니다.')
    }
}

const fetchPlaces = async () => {
    try {
        const res = await api.get('/members/registPlace')
        places.value = res.data || []
    } catch (err) {
        console.error('장소 불러오기 실패:', err)
        alert('장소 정보를 가져오는 데 실패했습니다.')
    }
}

const deletePlace = async (idx) => {
    if (!confirm('정말 이 장소를 삭제하시겠습니까?')) return
    try {
        await api.put(`/members/registPlace/delete/${idx}`)
        alert('장소가 삭제되었습니다.')
        fetchPlaces()
        fetchPlacesCount()
    } catch (err) {
        console.error('장소 삭제 실패:', err)
        alert('장소 삭제 중 오류가 발생했습니다.')
    }
}

const goToAddPage = () => {
    router.push('/places/add')
}

onMounted(() => {
    fetchPlaces()
    fetchPlacesCount()
})
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.my-places-page {
//   max-width: 960px;
    min-width: 70%;
    margin: 2rem auto;
    padding: 2rem;
    background-color: var(--color-surface);
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    min-height: calc(100vh - 160px);

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .title {
        font-size: 1.75rem;
        font-weight: bold;
        }

        .add-btn {
        background-color: var(--color-primary);
        color: var(--color-on-primary);
        padding: 0.6rem 1rem;
        font-size: 0.95rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;

        &:disabled {
            background-color: gray;
            cursor: not-allowed;
        }
        }
    }

    .place-count {
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
        color: var(--color-on-surface-variant);
        text-align: right;
    }

    .place-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;

        .place-card {
        background-color: var(--color-background);
        border: 1px solid var(--color-outline);
        border-radius: 10px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .alias {
            font-weight: 600;
            font-size: 1.15rem;
            margin-bottom: 0.5rem;
        }

        .address {
            font-size: 0.95rem;
            color: var(--color-on-surface-variant);
            margin-bottom: 1rem;
        }

        .delete-btn {
            align-self: flex-end;
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
            background-color: var(--color-secondary-container);
            color: var(--color-on-secondary-container);
            border: none;
            border-radius: 6px;
            cursor: pointer;

            &:hover {
            background-color: var(--color-secondary);
            color: white;
            }
        }
        }
    }

    .empty-message {
        text-align: center;
        color: var(--color-on-surface-variant);
        margin-top: 2rem;
    }
}
</style>
