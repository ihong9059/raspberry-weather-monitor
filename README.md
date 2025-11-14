# 라즈베리파이 온습도 모니터링 시스템

AHT20 센서로 온도/습도를 측정하여 실시간 웹 대시보드에 표시하는 IoT 시스템

---

## 🚀 빠른 시작

### 접속 URL
- **웹 대시보드**: http://3.35.139.224:4000/

### 주요 기능
- 📊 실시간 온도/습도 차트 (Chart.js)
- 📅 기간별 데이터 조회 (기본: 최근 24시간)
- 🔄 5분마다 자동 데이터 수집
- 💾 MySQL 데이터베이스 저장

---

## 📁 프로젝트 구조

```
raspberry-weather-monitor/
├── raspberry/           # 라즈베리파이 센서 코드
├── server/              # EC2 Node.js API 서버
├── public/              # 웹 클라이언트
├── PROJECT-STATUS.md    # 📋 상세 프로젝트 상태
├── PROJECT-PLAN.md      # 전체 계획서
└── README.md            # 이 파일
```

---

## 📋 상세 정보

**모든 프로젝트 정보는 [PROJECT-STATUS.md](PROJECT-STATUS.md)를 참조하세요!**

이 파일에는 다음 정보가 포함되어 있습니다:
- ✅ 구현 상태
- 🗂️ 파일 구조
- 🔧 기술 스택
- 🗄️ 데이터베이스 스키마
- 🔌 API 설계
- 🚀 배포 방법
- 🔄 **다음 세션 시작 방법**
- 📚 **히스토리 기록 정책**

---

## 📚 주요 문서

- **[프로젝트히스토리.html](프로젝트히스토리.html)** - 프로젝트 작업 타임라인 (시각화)
- **[GITHUB-CLI-GUIDE.md](GITHUB-CLI-GUIDE.md)** - GitHub CLI 설치 및 사용법
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - 배포 및 운영 가이드
- **[PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)** - 프로젝트 완료 요약

---

## 🔄 세션 중단 후 재개 방법

### Claude에게 이렇게 말하세요:

```
raspberry-weather-monitor/ 폴더의 PROJECT-STATUS.md 파일을 읽고,
현재 프로젝트 상태를 파악한 후 작업을 계속해주세요.
```

### 예시:
```
PROJECT-STATUS.md를 확인하고,
웹 대시보드의 차트 디자인을 개선해주세요.
```

---

## 📊 시스템 구조

```
┌─────────────────────┐
│  라즈베리파이         │
│  AHT20 센서          │
│  Python (5분 주기)   │
└──────────┬──────────┘
           │ HTTP POST
           │ (온도, 습도, 시간)
           ▼
┌─────────────────────┐
│  AWS EC2            │
│  3.35.139.224:4000  │
│  Node.js + MySQL    │
└──────────┬──────────┘
           │ HTTP GET
           │ (JSON 데이터)
           ▼
┌─────────────────────┐
│  웹 브라우저         │
│  Chart.js 차트      │
└─────────────────────┘
```

---

## 🔧 기술 스택

- **센서**: AHT20 (온도/습도)
- **라즈베리파이**: Python 3
- **서버**: Node.js + Express.js
- **데이터베이스**: MySQL
- **웹**: HTML5 + Chart.js
- **배포**: AWS EC2 (포트 4000)

---

## 📝 작업 전 확인사항

1. `PROJECT-STATUS.md` 파일이 최신인지 확인
2. EC2 서버 및 MySQL 상태 확인
3. 라즈베리파이 네트워크 연결 확인

---

## 🤝 기여 방법

새로운 기능을 추가하거나 수정한 후에는:
1. `PROJECT-STATUS.md` 업데이트
2. 변경 사항을 명확히 문서화
3. 필요 시 GitHub에 커밋

---

© 2025 Weather Monitoring Project. All rights reserved.
