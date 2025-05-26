<template>
  <!-- content 를 HTML 로 안전하게 렌더링 -->
  <div class="markdown-body" v-html="rendered"></div>
</template>

<script setup>
import { watch, ref } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * props.content:
 * - Array<string> 인 경우: 문자열만 골라서 \n\n 으로 합치고,
 * - String 인 경우: 그대로 사용
 * - 그 외 객체여도 .comment 필드가 있으면 문자열로 사용
 */
const props = defineProps({
  content: {
    type: [String, Array, Object],
    default: () => ''
  },
  animate: {
    type: Boolean,
    default: true
  }
})

const rendered = ref('')

// content가 바뀔 때마다 한 줄씩 찍어 주기
watch(() => props.content, (newC) => {
  // 1) 원본 텍스트 추출(기존 로직 그대로)
  let text = ''
  if (Array.isArray(newC)) {
    text = newC.filter(i=>typeof i==='string').join('\n\n')
  } else if (typeof newC === 'string') {
    text = newC
  } else if (newC && typeof newC.comment === 'string') {
    text = newC.comment
  }
  text = text.trim()

  if (!props.animate) {
    const html = marked(text, {
      gfm: true, breaks: true, smartLists: true
    })
    rendered.value = DOMPurify.sanitize(html)
    return
  }
  // 2) 문단 단위로 쪼개기 (혹은 .split('\n')로 한 줄씩)
  const lines = text.split(/\n{2,}/g)

  // 3) rendered 초기화
  rendered.value = ''

  // 4) 한 줄씩 순차적으로 붙이기
  lines.forEach((line, idx) => {
    setTimeout(() => {
      const html = marked(line + '\n\n', {
        gfm: true, breaks: true, smartLists: true
      })
      rendered.value += DOMPurify.sanitize(html)
    }, idx * 200)  // 200ms 간격으로 한 문단씩
  })
}, { immediate: true })
</script>

<style lang="scss">
.markdown-body ul,
.markdown-body ol {
  /* 1단계 리스트 */
  list-style-position: outside;
  padding-left: 1.2em;
  margin: 0.5em 0;
}

.markdown-body ul ul,
.markdown-body ol ol {
  /* 2단계 리스트 */
  padding-left: 2.4em;
}

.markdown-body ul ul ul,
.markdown-body ol ol ol {
  /* 3단계 리스트 */
  padding-left: 3.6em;
}

.markdown-body li {
  margin-bottom: 0.4em;
}

.markdown-body h1 {
    margin: 1rem 0 0.5rem;    /* 위 1rem, 아래 0.5rem */
    padding-top: 0.25rem;     /* 추가로 패딩을 주고 싶다면 */
    font-size: 1.5rem;       /* 필요시 크기도 조정 */
}

.markdown-body h2 {
    margin: 0.75rem 0 0.4rem;
    margin-top: 0.2rem;
    font-size: 1.2rem;
}

.markdown-body h3 {
    margin: 0.6rem 0 0.3rem;
    margin-top: 0.15rem;
    font-size: 1.0rem;
}
</style>

