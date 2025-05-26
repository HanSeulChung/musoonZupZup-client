<template>
  <div class="modal-backdrop" @mousedown.self="$emit('close')">
    <div
      class="modal-content gpt-modal"
      ref="gptModal"
      :style="{ top: modalTop + 'px', left: modalLeft + 'px' }"
    >
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
        <p v-if="isAsking" class="loading-animation">GPT가 답변을 작성 중입니다...</p>
        <div v-else class="answer-markdown">
         <MarkdownRenderer :content="answer" />
       </div>
      </div>

      <div v-if="history.length > 0" class="gpt-history">
        <h4>이전 질문 내역</h4>
        <ul>
          <li v-for="(item, index) in history" :key="index">
            <strong>Q.</strong> {{ item.request }}  
            <br />
            <strong>A.</strong> 
            <div class="history-markdown">
              <MarkdownRenderer :content="item.comment" />
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
  position: absolute;
  width: 900px;
  max-height: 90vh;
  background-color: #fff;
  border-radius: 16px;
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
  }
}
</style>
