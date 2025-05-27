# 💻 musoon-zupzup-FE — 무순위 청약 정보 플랫폼 (Frontend)

Vue 3 + Vite 기반으로 개발된 무순위 청약 정보 플랫폼의 프론트엔드 프로젝트입니다.

> 🔗 백엔드 레포도 함께 확인해보세요 👉 [musoon-zupzup-BE (Spring Boot)](https://lab.ssafy.com/ssafy_13th_18class/999_final/ssafy_home_final_chunghanseul_parkjaehwan_shinhaebom)


## 🌐 주요 역할

- 사용자용 무순위 청약 공고 조회 및 상세 페이지
- 자유 게시판 및 댓글 기능
- 로그인/회원가입/마이페이지 UI
- 찜하기(즐겨찾기), 공지사항 열람
- Tmap 연동 경로 탐색 기능
- AI 분석 결과 시각화 (GPT 응답 뷰 구성)


## 🧱 기술 스택

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **언어**: JavaScript
- **스타일링**: SCSS
- **지도 API**: Kakao Map, Tmap
- **AI 분석 연동**: OpenAI (GPT)


## 📐 디자인 시안 (Figma)

👉 [Figma 디자인 링크](https://www.figma.com/board/oiNWP1yNI0blErRgM71TmP/musoonzup?node-id=0-1&p=f)


## ⚙️ 프로젝트 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행 (Hot Reload 포함)

```bash
npm run dev
```

### 3. 빌드 (배포용)

```bash
npm run build
```

---

## 💡 기타

- **권장 IDE**: [VSCode](https://code.visualstudio.com/) 
- `.env` 파일을 활용한 카카오 키 연동 필요(업로드 되어있음음)

