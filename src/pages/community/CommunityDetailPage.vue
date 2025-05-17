<template>
    <div class="community-detail-container">
        <CommunityContent
        class="section-box"
        v-if="detail && detail.idx"
        :detail="detail"
        :myReaction="myReaction"
        :reaction="reaction"
        @updateReaction="handleReaction"
        />

        <CommentSection
        class="section-box"
        :communityIdx="Number(communityIdx)"
        :myMemberId="authStore.memberId"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/libs/axios'
import { useAuthStore } from '@/stores/auth'
import CommunityContent from '@/components/community/CommunityContent.vue'
import CommentSection from '@/components/community/CommentSection.vue'

const route = useRoute()
const authStore = useAuthStore()
const communityIdx = route.params.id

const detail = ref({})
const myReaction = ref(null)
const reaction = ref({ like: 0, disLike: 0 });


const fetchDetail = async () => {
    const res = await api.get(`/community/${communityIdx}`)
    detail.value = res.data;
}

const fetchReactionCount = async () => {
    try {
        const res = await api.get(`/community/${communityIdx}/likeDisLike`);
        reaction.value = res.data.totalLikeDisLike || { like: 0, disLike: 0 };
    } catch (err) {
        console.error('좋아요/싫어요 수치 가져오기 실패:', err);
    }
};

const fetchMyReaction = async () => {
    if (!authStore.isLoggedIn) return
    const res = await api.get(`/community/member/likeDisLike/${communityIdx}`)
    myReaction.value = res.data === '' || res.data === undefined ? null : res.data;
}

const handleReaction = async (flag) => {
    if (!authStore.isLoggedIn) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
    }

    try {
        if (myReaction.value === flag) {
        await api.delete(`/community/member/likeDisLike/${communityIdx}`);
        myReaction.value = null;
        } else {
        if (myReaction.value !== null) {
            await api.delete(`/community/member/likeDisLike/${communityIdx}`);
        }
        await api.post(`/community/member/likeDisLike/${communityIdx}`, {
            likeFlag: flag,
        });
            myReaction.value = flag;
        }

        await fetchReactionCount(); // 수치만 갱신
    } catch (err) {
        console.error('반응 처리 실패:', err);
    }
};



onMounted(() => {
    fetchDetail()
    fetchReactionCount()
    if (authStore.isLoggedIn) {
        console.log("fetchReaction!")
        fetchMyReaction();// 사용자 반응 정보 가져오기
    }
})
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.community-detail-container {
    display: flex;
    flex-direction: column; // 세로 정렬
    align-items: center;
    padding: 3rem 1rem;
    background-color: var(--color-background);
    min-width:  80%;
    min-height: calc(100vh - 160px); // header + footer 고려
}

.section-box {
    width: 100%;
    max-width: 800px;
    background-color: var(--color-surface);
    border: 1px solid var(--color-outline);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    color: var(--color-on-surface);
}
</style>