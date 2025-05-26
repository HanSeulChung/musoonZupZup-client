<template>
  <!-- content 를 HTML 로 안전하게 렌더링 -->
  <div class="markdown-body" v-html="rendered"></div>
</template>

<script setup>
import { computed } from 'vue'
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
  }
})

const rendered = computed(() => {
  let text = ''

  if (Array.isArray(props.content)) {
    text = props.content
      .filter(item => typeof item === 'string')
      .join('\n\n')

  } else if (typeof props.content === 'string') {
    text = props.content

  } else if (props.content && typeof props.content.comment === 'string') {
    text = props.content.comment
  }

  // 1) marked 로 HTML 생성
  const html = marked(text.trim(), {
    gfm: true,
    breaks: true,
    smartLists: true
  })
  // 2) DOMPurify 로 sanitize
  return DOMPurify.sanitize(html)
})
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
</style>

