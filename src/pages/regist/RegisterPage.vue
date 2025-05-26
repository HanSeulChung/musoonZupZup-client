<template>
  <section class="auth">
    <div class="auth-card">
      <h2>회원가입</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group inline">
          <input type="email" v-model="email" placeholder="이메일" required />
          <button type="button" @click="sendEmail">이메일 인증 요청</button>
        </div>

        <div class="form-group inline" v-if="emailSent">
          <input type="text" v-model="code" placeholder="인증번호" required />
          <button type="button" @click="verifyCode">확인</button>
        </div>

        <div class="form-group inline">
          <input type="text" v-model="id" placeholder="아이디" required />
          <button type="button" @click="checkId">중복 확인</button>
        </div>

        <div class="form-group">
          <input
            type="password"
            v-model="password"
            placeholder="비밀번호"
            required
          />
        </div>

        <div class="form-group">
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="비밀번호 확인"
            required
          />
        </div>

        <div class="form-group">
          <input type="text" v-model="name" placeholder="이름" required />
        </div>

        <div class="form-group">
          <input type="tel" v-model="phone" placeholder="전화번호" required />
        </div>

        <div class="form-group radio">
          <label
            ><input type="radio" value="남성" v-model="gender" /> 남성</label
          >
          <label
            ><input type="radio" value="여성" v-model="gender" /> 여성</label
          >
        </div>
        <div class="form-group inline-label">
          <label for="birth-date">생년월일:</label>
          <input
            id="birth-date"
            type="date"
            v-model="birthDate"
            required
          />
        </div>
        <button type="submit" class="submit-button">회원가입</button>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const code = ref("");
const id = ref("");
const password = ref("");
const confirmPassword = ref("");
const name = ref("");
const phone = ref("");
const gender = ref("남성");
const emailSent = ref(false);
const birthDate = ref("");
const router = useRouter();

import api from "@/libs/axios";

const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const sendEmail = async () => {
  if (!isValidEmail(email.value)) {
    alert("유효한 이메일 형식을 입력해주세요.");
    return;
  }

  try {
    await api.post("members/send-verification", { email: email.value });
    emailSent.value = true;
    alert("인증코드가 발송되었습니다.");
  } catch {
    alert("이메일 전송에 실패했습니다.");
  }
};

const verifyCode = async () => {
  const { data } = await api.post("members/verify-code", {
    email: email.value,
    code: code.value,
  });
  alert(data ? "인증 성공" : "인증 실패");
};

const checkId = async () => {
  if (!id.value.trim()) {
    alert("아이디를 입력해주세요.");
    return;
  }

  try {
    await api.get("members/check-id", { params: { id: id.value } });
    alert("사용 가능한 아이디입니다.");
  } catch (err) {
    const message = (await err.response?.data) || "중복 확인에 실패했습니다.";
    alert(message);
  }
};

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (!birthDate.value) {
    alert("생년월일을 입력해주세요.");
    return;
  }

  const dto = {
    email: email.value,
    id: id.value,
    pw: password.value,
    name: name.value,
    phone: phone.value,
    gender: gender.value === "남성" ? 0 : gender.value === "여성" ? 1 : null,
    birthDate: birthDate.value,
  };

  try {
    await api.post("members/register", dto);
    alert("회원가입 완료");
    router.push("/login");
  } catch {
    alert("회원가입 실패");
  }
};
</script>

<style scoped lang="scss">
@use "@/styles/theme" as *;

.auth {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 160px); // header + footer 높이 고려
}

.auth-card {
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  border: 1px solid var(--color-outline);
  border-radius: 12px;
  padding: 2.5rem;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.form-group {
  margin-bottom: 1rem;
  width: 100%;
  input {
    font-size: 1rem;
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-outline);
    border-radius: 6px;
    background-color: var(--color-background);
    color: var(--color-on-background);
  }
}

.form-group.inline {
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
  }

  button {
    font-size: 0.9rem;
    white-space: nowrap;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-secondary-container);
    }
  }
}
.form-group.inline-label {
  display: flex;
  align-items: center;
  gap: 1rem;

  label {
    white-space: nowrap;
    font-weight: 500;
    color: var(--color-on-surface);
    font-size: 1rem;
  }

  input[type="date"] {
    text-align: center;

    flex: 1;
    font-size: 1rem;
    padding: 0.5rem;
    border: 1px solid var(--color-outline);
    border-radius: 6px;
    background-color: var(--color-background);
    color: var(--color-on-background);
  }
}

.form-group.radio {
  display: flex;
  justify-content: center;
  gap: 2.5rem;

  label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem; // 라디오와 텍스트 간격
    font-size: 1.1rem;
    color: var(--color-on-surface);
    cursor: pointer;

    white-space: nowrap;
  }

  input[type="radio"] {
    accent-color: var(--color-primary);
    cursor: pointer;
  }
}

.submit-button {
  width: 100%;
  font-size: 1rem;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-secondary-container);
  }
}
</style>
