# 📖 성경 CODE 묵상 앱

> 성경 말씀을 체계적으로 묵상하고 기록할 수 있는 웹 애플리케이션입니다.

![GitHub](https://img.shields.io/github/license/sizips32/bible-meditation-apps)

## 📋 목차

- [소개](#소개)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [사용 방법](#사용-방법)
- [기여하기](#기여하기)
- [라이선스](#라이선스)

## 🎯 소개

이 애플리케이션은 성경 말씀을 더 깊이 있게 묵상하고 기록하기 위한 도구입니다. CODE 묵상법을 통해 체계적인 말씀 묵상이 가능하며, 기록된 묵상을 쉽게 관리하고 찾아볼 수 있습니다.

## ✨ 주요 기능

### 1. CODE 묵상법

- **C**apture (포착하기) 📝
  - 말씀을 읽으며 마음에 와닿는 구절이나 단어를 포착
  - 성경 구절 참조 기능
- **O**rganize (조직화하기) 🔄
  - 포착한 말씀의 문맥을 살피기
  - 관련 구절들을 연결하고 정리
- **D**istill (압축하기) 💡
  - 말씀을 통해 깨달은 핵심 진리 정리
  - 중요 포인트 요약
- **E**xpress (표현하기) 🙏
  - 깨달은 진리를 기도로 표현
  - 일상에서의 적용점 찾기

### 2. 애플리케이션 기능

- 📅 **달력 기능**
  - 날짜별 묵상 기록 관리
  - 묵상 작성 여부 시각적 표시
  - 날짜 클릭으로 간편한 묵상 작성/조회
- 📚 **성경 목록**
  - 구약/신약 성경 분류
  - 각 성경별 묵상 기록 조회
  - 성경 각 권의 장/절 정보 제공
- 🔍 **검색 기능**
  - 제목, 성경 구절, 내용 검색
  - 최근 묵상 3개 자동 표시
  - 검색 결과 최대 10개 표시

## 📂 프로젝트 구조

```
bible-meditation-apps/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # 메인 JavaScript 파일
├── README.md           # 프로젝트 문서
└── LICENSE             # 라이선스 파일
```

### 주요 컴포넌트

1. **메인 화면**

   - CODE 묵상법 소개
   - 최근 묵상 목록 (3개)
   - 빠른 실행 버튼

2. **달력 화면**

   - 월간 캘린더 뷰
   - 묵상 기록 표시
   - 묵상 작성/수정 폼

3. **성경 목록 화면**

   - 구약/신약 분류
   - 성경 분류별 구성
   - 각 권별 묵상 목록

4. **검색 화면**
   - 검색 입력 필드
   - 검색 결과 목록
   - 최근 묵상 표시

## 🛠 기술 스택

- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
- LocalStorage를 이용한 데이터 저장

### 주요 기술 설명

- **Vanilla JavaScript**: 순수 자바스크립트로 구현하여 의존성 최소화
- **LocalStorage**: 브라우저 저장소를 활용한 데이터 관리
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험
- **모듈식 구조**: 유지보수와 확장이 용이한 코드 구조

## 🚀 시작하기

### 설치 방법

1. 저장소를 클론합니다

```bash
git clone https://github.com/sizips32/bible-meditation-apps.git
```

2. 프로젝트 폴더로 이동합니다

```bash
cd bible-meditation-apps
```

3. 의존성 패키지를 설치합니다

```bash
npm install
```

4. 개발 서버를 실행합니다

```bash
npm run dev
```

5. 브라우저에서 애플리케이션에 접속합니다

```
http://localhost:7780
```

### 요구사항

- 모던 웹 브라우저 (Chrome, Firefox, Safari, Edge 최신 버전)
- JavaScript 활성화 필요
- 로컬 저장소 접근 권한 필요
- Node.js 및 npm (개발 서버 실행 시)

## 📝 사용 방법

### 1. 묵상 작성하기

1. 달력에서 원하는 날짜 선택
2. 성경 구절 입력
3. CODE 방식에 따라 묵상 작성
   - Capture: 핵심 구절 기록
   - Organize: 문맥 정리
   - Distill: 핵심 메시지 도출
   - Express: 적용점 작성
4. 저장하기 클릭

### 2. 묵상 조회하기

- **달력으로 조회**
  - 날짜별 묵상 조회
  - 작성된 묵상 시각적 표시
- **성경 목록으로 조회**
  - 성경별 묵상 조회
  - 각 권의 묵상 수 표시
- **검색으로 조회**
  - 키워드 검색
  - 최근 묵상 자동 표시

### 3. 묵상 관리

- 작성된 묵상 수정
- 묵상 삭제
- 날짜 이동
- 성경 구절 변경

## 👥 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
