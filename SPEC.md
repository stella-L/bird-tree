# 전선 위 새들 — 개발 스펙

> 관찰한 새 이름을 입력하면 전선 위에 3D 새가 앉는 탐조 기록 앱.
> GitHub Pages 정적 배포, Google Sheets 연동, Three.js 3D 렌더링.

---

## 링크

| 구분 | URL |
|------|-----|
| 서비스 | https://stella-l.github.io/bird-tree/ |
| GitHub | https://github.com/stella-L/bird-tree |
| Google Sheets 연동 | Apps Script (아래 참조) |
| **GLB 파일 확인 뷰어** | **https://gltf-viewer.donmccurdy.com** |

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | HTML / CSS / Vanilla JS (단일 파일) |
| 3D 렌더링 | [Three.js r168](https://threejs.org) (CDN importmap) |
| GLB 로더 | `GLTFLoader` (Three.js addons) |
| 데이터 저장 | `localStorage` (로컬 캐시) + Google Sheets (원격 동기화) |
| 백엔드 | Google Apps Script (서버리스 REST 엔드포인트) |
| 배포 | GitHub Pages (main 브랜치 루트) |

---

## 파일 구조

```
bird-tree/
├── index.html                          # 앱 전체 (HTML + CSS + JS 단일 파일)
├── google-apps-script.gs               # Google Sheets 연동 Apps Script
├── SPEC.md                             # 이 문서
│
├── Meshy_AI_Cheerful_Cardinal_Chi_*.glb  # 기본 새 모델 (전용 모델 없는 새에 사용)
├── 까마귀.glb
├── 직박구리.glb
├── 곤줄박이.glb
├── 괭이갈매기.glb
├── 검은등할미새.glb
├── 깝작도요.glb
└── ...그 외 새별 GLB
```

---

## 3D 씬 구조

```
scene
└── scenePivot (Group) ← 회전/줌 컨트롤 대상
    ├── 전선 4개 (TubeGeometry, 새그 커브)
    ├── 전봇대 구조물
    ├── 나무
    ├── 그림자 디스크
    └── birdsGroup (Group)
        └── 새 Group × N
            ├── GLB 모델 or 절차적 생성 메시
            └── Sprite 이름표 (CanvasTexture)
```

### 와이어 스팟
- 4줄 전선 × 7자리 = **최대 28마리** 동시 표시
- 29번째부터 레이어 스택(z/y 오프셋)으로 겹쳐 앉음

---

## 새 모델 시스템

### 전용 GLB 모델

| 새 이름 | 파일 | 비고 |
|---------|------|------|
| 검은등할미새 | `검은등할미새.glb` | |
| 곤줄박이 | `곤줄박이.glb` | |
| 괭이갈매기 | `괭이갈매기.glb` | |
| 까마귀 | `까마귀.glb` | |
| 깝작도요 | `깝작도요.glb` | |
| 동고비 | `동고비1.glb`, `동고비2.glb` | 기록별로 랜덤 변형 |
| 때까치 | `떼까치.glb` | 파일명 표기와 새 이름 매칭 |
| 멧비둘기 | `멧비둘기.glb` | |
| 물닭 | `물닭.glb` | |
| 물총새 | `물총새.glb` | |
| 민물가마우지 | `민물가마우지.glb` | |
| 바다직박구리 | `바다직박구리.glb` | |
| 박새 | `박새.glb` | |
| 방울새 | `방울새.glb` | |
| 직박구리 | `직박구리.glb` | |
| (기본) | `Meshy_AI_Cheerful_Cardinal_Chi_*.glb` | 전용 모델 없는 새에 공통 사용 |

> **GLB 파일 확인:** https://gltf-viewer.donmccurdy.com 에 파일 드래그 앤 드롭

### 새 GLB 추가 방법
1. `BIRD_MODEL_URLS` 객체에 `"새이름": "./파일명.glb"` 추가
   - 같은 새 이름에 여러 모델을 랜덤으로 쓰려면 `"새이름": ["./파일1.glb", "./파일2.glb"]` 형태로 추가
2. GLB 파일을 레포 루트에 추가
3. `MODELED_BIRDS` Set은 자동 갱신 (코드 수정 불필요)
4. 입력칸 추천 목록에 🪶 표시 자동 적용

### 절차적 새 생성 (전용 모델 없는 새)
- `birdProfiles` 맵에 정의된 종은 색상 팔레트로 커스텀 새 생성
- 미정의 종은 `palette` 배열의 색상으로 랜덤 생성
- 현재 프로파일 정의 종: 박새, 물총새, 직박구리, 참새, 까치, 까마귀, 동박새, 딱새, 오목눈이, 원앙, 청둥오리, 흰뺨검둥오리, 왜가리, 쇠백로, 황조롱이 등

---

## 데이터 구조

### Sighting 객체
```js
{
  name: "직박구리",        // 새 이름
  visitorName: "시은",    // 기록자 이름
  createdAt: "2026-06-18T...",
  savedAt: "2026-06-18T...",
  faceTurn: 0.72          // 0~1, 새 얼굴 방향 (0.5 미만 = 앞, 이상 = 뒤)
}
```

### localStorage 키
| 키 | 내용 |
|----|------|
| `bird-tree-sightings` | Sighting 배열 (JSON) |
| `bird-tree-visitor-name` | 기록자 이름 |

---

## Google Sheets 연동

### Apps Script 엔드포인트
```
https://script.google.com/macros/s/AKfycbzGmMQrl3Yw.../exec
```

### API

| 액션 | 메서드 | 설명 |
|------|--------|------|
| 새 저장 | `POST` | `{ name, visitorName, createdAt, savedAt, habitat }` |
| 얼굴 방향 업데이트 | `POST` | `{ action: "updateFaceTurn", createdAt, faceTurn }` |
| 전체 불러오기 | `GET` | `?action=getAll` → Sighting 배열 반환 |

### 동기화 방식
- 앱 로드 시 Sheets에서 전체 데이터 pull
- 새 추가 시 즉시 Sheets에 push
- 로컬 + 원격 데이터 머지 후 최신 48마리만 유지

---

## UI 구성

### 패널 (왼쪽, 모바일에서는 하단)
- 기록자 이름 표시 / 변경
- 새 이름 입력 (`<datalist>` 자동완성, 47종 + 서식지)
- 새 목록: **이름만** 표시, 얼굴 방향 바꾸기 / 삭제 버튼
- 불러오기 / 비우기 버튼
- Sheets 동기화 상태 메시지

### 3D 씬 인터랙션
| 동작 | 기능 |
|------|------|
| 드래그 | 씬 회전 (Y축 자유, X축 ±72° 제한) |
| 핀치 줌 | 0.5× ~ 2.2× |
| 마우스 휠 | 줌 |
| 새 클릭/탭 | 새 정보 팝업 (이름 · 서식지 · 기록자) |

### 새 정보 팝업
- 화면 하단 중앙에 카드 형태로 표시
- 새 이름, 서식지, 기록자 표시
- × 버튼 또는 빈 화면 클릭으로 닫기

### 모바일 전용
- 패널 아래로 스와이프하면 패널 dismiss
- 픽셀 레이션 1.5 제한 (발열 최소화)
- WebGL `powerPreference: "low-power"`

---

## 알려진 새 목록 (47종)
검은등할미새, 검은머리갈매기, 검은머리물떼새, 곤줄박이, 괭이갈매기, 까마귀, 까치, 깝작도요, 꿩, 노랑턱멧새, 논병아리, 동고비, 동박새, 딱새, 때까치, 매, 멧비둘기, 물까치, 물닭, 물총새, 민물가마우지, 바다직박구리, 박새, 방울새, 붉은머리오목눈이, 쇠가마우지, 쇠딱다구리, 쇠물닭, 쇠박새, 쇠백로, 수리부엉이, 어치, 오목눈이, 오색딱다구리, 왜가리, 원앙, 중대백로, 직박구리, 집비둘기, 찌르레기, 참새, 청둥오리, 청딱다구리, 큰부리까마귀, 큰오색딱다구리, 해오라기, 황조롱이, 흑비둘기, 흰목물떼새, 흰뺨검둥오리

> 출처: [국립중앙과학관 우리나라 텃새](https://www.science.go.kr/mps/scienceSubject/bird/list.do)

---

## 배포

```bash
# 변경사항 커밋
git add .
git commit -m "커밋 메시지"

# 배포 (푸시하면 GitHub Pages 자동 빌드, 1~2분 소요)
git push origin main
```

- GitHub Pages 설정: main 브랜치 `/` 루트
- 프라이빗 레포는 GitHub Pages 사용 불가 (무료 계정 기준) → 퍼블릭 유지 필요
