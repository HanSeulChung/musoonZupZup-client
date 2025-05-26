<template>
  <div class="modal-backdrop" @mousedown.self="$emit('close')">
    <div class="modal-content gpt-modal" ref="gptModal">
      <!-- 드래그 영역 -->
      <div class="modal-header" @mousedown="startDragging">
        <h3>GPT에게 물어보기</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <p>궁금한 내용을 입력하세요:</p>

      <form @submit.prevent="$emit('submit-query', queryText)">
        <textarea
          v-model="queryText"
          placeholder="예: 주변 교통은 어떤가요?"
          required
        />
        <button type="submit" class="submit-btn" :disabled="isAsking">
          {{ isAsking ? '질문 중...' : '질문하기' }}
        </button>
      </form>

      <div class="gpt-answer" v-if="isAsking || answer">
        <h4>답변 결과</h4>
         <!-- 로딩 스피너 -->
        <div v-if="isAsking" class="loading-container">
          <div class="spinner"></div>
          <p>GPT가 답변을 작성 중입니다<span class="dots"></span></p>
        </div>
         <!-- 실제 답변 -->
        <div v-else class="answer-markdown">
         <MarkdownRenderer :content="answer" />
       </div>
      </div>

      <div v-if="history.length > 0" class="gpt-history">
        <h4>이전 질문 내역</h4>
        <ul>
          <li v-for="(item, index) in history" :key="index">
            <!-- index > 0일 때만 상단에 구분선 -->
            <hr v-if="index > 0" class="history-divider" />

            <strong class="history-label">Q.</strong>
            <!-- 질문 내용은 span으로 -->
            <span class="history-content">{{ item.request }}</span>

            <br />
            <strong class="history-label">A.</strong>
            <div class="history-markdown">
              <MarkdownRenderer :content="item.comment" :animate="false" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const props = defineProps({
  isAsking: Boolean,
  answer: String,
  history: Array,
})


const emit = defineEmits(['submit-query', 'close'])

const queryText = ref('')
const modalTop = ref(100)
const modalLeft = ref(window.innerWidth / 2 - 300)

const gptModal = ref(null)
let isDragging = false
let offsetX = 0
let offsetY = 0

const startDragging = (e) => {

  isDragging = true
  offsetX = e.clientX - modalLeft.value
  offsetY = e.clientY - modalTop.value
  document.addEventListener('mousemove', drag)
  document.addEventListener('mouseup', stopDragging)
}

const drag = (e) => {
  if (!isDragging) return
  modalLeft.value = e.clientX - offsetX
  modalTop.value = e.clientY - offsetY
}

const stopDragging = () => {
  isDragging = false
  document.removeEventListener('mousemove', drag)
  document.removeEventListener('mouseup', stopDragging)
}

onMounted(async () => {
  await nextTick()  
  if (gptModal.value) {
    const { offsetWidth, offsetHeight } = gptModal.value
    modalLeft.value = window.innerWidth  / 2 - offsetWidth  / 2
    modalTop.value  = window.innerHeight / 2 - offsetHeight / 2
  }
})

onUnmounted(() => {
  stopDragging()
})
</script>
<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content.gpt-modal {
  position: relative;
  width: 900px;
  max-height: 90vh;
  background-color: #fff;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  overflow-y: auto;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;

    h3 {
      font-size: 1.4rem;
      font-weight: bold;
      margin: 0;
      color: #333;
    }

    .close-btn {
      font-size: 1.5rem;
      font-weight: bold;
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #e74c3c;
      }
    }
  }

  p {
    margin: 1rem 0 0.5rem;
    font-size: 0.95rem;
    color: #444;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    textarea {
      resize: vertical;
      padding: 0.75rem;
      font-size: 1rem;
      min-height: 120px;
      border-radius: 8px;
      border: 1px solid #ccc;
      transition: border 0.2s;
      font-family: inherit;

      &:focus {
        border-color: var(--color-primary);
        outline: none;
      }
    }

    .submit-btn {
      align-self: flex-end;
      background-color: var(--color-primary);
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--color-primary-container);
      }

      &:disabled {
        background-color: gray;
        cursor: not-allowed;
      }
    }
  }

  .gpt-answer {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: 10px;
    background-color: #f3f8ff;
    border: 1px solid #cfe2ff;
    color: #333;
    line-height: 1.3;

    h4 {
      margin-top: 0;
      font-size: 1.1rem;
      color: var(--color-primary);
    }
  }

  .gpt-history {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #fcfcfc;
    border: 1px solid #eee;
    border-radius: 10px;

    h4 {
      font-size: 1rem;
      color: #555;
      margin-bottom: 0.5rem;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        margin-bottom: 1rem;
        font-size: 0.9rem;
        line-height: 1.4;

        strong {
          color: var(--color-primary);
          display: inline-block;
          width: 1.5rem;
        }
      }
    }
      /* 인라인 라벨 너비 고정 */
    .history-label {
      color: var(--color-primary);
      display: inline-block;
      width: 1.5rem;
      /* 텍스트가 잘리지 않도록 */
      white-space: nowrap;
      font-size: 1.105rem;
    }

    /* 질문/답변 본문은 라벨 옆에 흐르게 */
    .history-content {
      display: inline-block;
      /* 긴 텍스트도 잘리지 않고 줄 바꿈 */
      white-space: normal;
      word-break: break-word;
      font-weight: bold;
      color: var(--color-primary);
      font-size: 1.105rem;
    }

    /* 구분선 */
    .history-divider {
      border: none;
      border-top: 1px solid #ddd;
      margin: 0.75rem 0;
    }
  }
}

.history-divider {
  border: none;
  border-top: 1px solid #ddd;
  margin: 0.75rem 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 4px solid var(--color-outline);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dots::after {
  content: '';
  animation: dots 1.5s steps(4,end) infinite;
}

@keyframes dots {
  0%,20%   { content: ''; }
  40%      { content: '.'; }
  60%      { content: '..'; }
  80%,100% { content: '...'; }
}
</style>
