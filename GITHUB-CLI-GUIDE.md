# GitHub CLI 설치 및 사용 가이드

**작성일**: 2025-11-15
**버전**: 1.0

---

## 📋 목차

1. [GitHub CLI란?](#github-cli란)
2. [설치 방법](#설치-방법)
3. [인증 설정](#인증-설정)
4. [주요 명령어](#주요-명령어)
5. [실전 활용 예제](#실전-활용-예제)

---

## 🎯 GitHub CLI란?

**GitHub CLI (gh)**는 GitHub에서 공식 제공하는 명령줄 도구입니다.

### 장점

- ✅ 터미널에서 GitHub의 모든 작업 가능
- ✅ 웹 브라우저 없이 저장소/이슈/PR 관리
- ✅ 한 번 인증하면 계속 사용 가능 (토큰 자동 저장)
- ✅ 빠른 워크플로우 (저장소 생성 → 푸시가 한 줄로)

---

## 🔧 설치 방법

### macOS (Homebrew)

```bash
brew install gh
```

### 설치 확인

```bash
gh --version
```

**출력 예시**:
```
gh version 2.83.1 (2025-11-13)
```

---

## 🔐 인증 설정

### 1. 인증 시작

```bash
gh auth login
```

### 2. 인증 절차

1. **코드 복사**: 화면에 표시되는 코드 (예: `4637-41BC`)
2. **URL 접속**: https://github.com/login/device
3. **코드 입력**: 복사한 코드 입력
4. **로그인**: GitHub 계정으로 로그인
5. **승인**: "Authorize GitHub CLI" 클릭

### 3. 인증 확인

```bash
gh auth status
```

**출력 예시**:
```
github.com
  ✓ Logged in to github.com account ihong9059 (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
```

---

## 🚀 주요 명령어

### 저장소 관리

```bash
# 새 저장소 생성 (웹에서 생성할 필요 없음!)
gh repo create my-project --public

# 현재 폴더를 새 저장소로 생성 및 푸시
gh repo create my-project --public --source=. --push

# 저장소 복제
gh repo clone owner/repo

# 저장소 정보 보기
gh repo view

# 웹 브라우저에서 저장소 열기
gh browse
```

### Issue 관리

```bash
# 이슈 목록 보기
gh issue list

# 새 이슈 생성
gh issue create --title "버그 발견" --body "상세 설명"

# 이슈 상세 보기
gh issue view 123

# 웹에서 이슈 열기
gh issue view 123 --web

# 이슈 닫기
gh issue close 123
```

### Pull Request 관리

```bash
# PR 목록 보기
gh pr list

# 새 PR 생성
gh pr create --title "새 기능 추가" --body "설명"

# PR 상세 보기
gh pr view 456

# PR 체크아웃 (로컬에서 테스트)
gh pr checkout 456

# PR 병합
gh pr merge 456
```

### Release 관리

```bash
# Release 목록
gh release list

# 새 Release 생성
gh release create v1.0.0 --title "Version 1.0.0" --notes "릴리스 노트"
```

---

## 💡 실전 활용 예제

### 예제 1: 새 프로젝트 시작

**기존 방법** (여러 단계):
1. GitHub 웹에서 저장소 생성
2. `git remote add origin ...`
3. Personal Access Token 입력하여 푸시

**GitHub CLI 방법** (한 줄):
```bash
cd my-new-project
git init
git add .
git commit -m "Initial commit"
gh repo create my-new-project --public --source=. --push
```

### 예제 2: 이슈 기반 워크플로우

```bash
# 1. 이슈 확인
gh issue list

# 2. 이슈 생성
gh issue create --title "로그인 기능 추가" --body "OAuth 인증 구현"

# 3. 브랜치 생성 및 작업
git checkout -b feature/login

# 4. 작업 후 커밋
git add .
git commit -m "Add OAuth login feature"
git push -u origin feature/login

# 5. PR 생성
gh pr create --title "로그인 기능 추가" --body "Closes #123"

# 6. PR 병합 (리뷰 후)
gh pr merge --squash
```

### 예제 3: 기존 저장소에 연결

```bash
# 1. 저장소 복제
gh repo clone ihong9059/raspberry-weather-monitor

# 2. 브랜치 확인
gh pr list

# 3. 웹에서 보기
gh browse
```

---

## 🆚 Git vs GitHub CLI 비교

| 작업 | 기존 Git | GitHub CLI |
|------|---------|-----------|
| 저장소 생성 | 웹에서 생성 → `git remote add` | `gh repo create` |
| 저장소 푸시 | `git push` (토큰 입력) | `git push` (자동 인증) |
| PR 생성 | 웹 브라우저 접속 | `gh pr create` |
| 이슈 확인 | 웹 브라우저 접속 | `gh issue list` |
| 저장소 복제 | `git clone https://...` | `gh repo clone owner/repo` |

---

## 🔗 유용한 팁

### 1. 별칭(Alias) 설정

```bash
# ~/.zshrc 또는 ~/.bashrc에 추가
alias ghi="gh issue"
alias ghp="gh pr"
alias ghr="gh repo"
```

### 2. 자동 완성 설정

```bash
# zsh
echo "eval \"\$(gh completion -s zsh)\"" >> ~/.zshrc
source ~/.zshrc
```

### 3. 기본 에디터 설정

```bash
gh config set editor "code --wait"  # VS Code
gh config set editor "vim"          # Vim
```

---

## 📚 더 알아보기

### 공식 문서
- https://cli.github.com/manual/

### 전체 명령어 목록
```bash
gh help
```

### 특정 명령어 도움말
```bash
gh repo --help
gh issue --help
gh pr --help
```

---

## 🎓 학습 순서 추천

1. **기본**: `gh auth login`, `gh repo view`, `gh browse`
2. **저장소**: `gh repo create`, `gh repo clone`
3. **이슈**: `gh issue list`, `gh issue create`, `gh issue view`
4. **PR**: `gh pr list`, `gh pr create`, `gh pr view`
5. **고급**: `gh workflow`, `gh release`, `gh api`

---

## ✅ 체크리스트

- [ ] GitHub CLI 설치 완료
- [ ] `gh auth login` 인증 완료
- [ ] `gh auth status` 확인
- [ ] `gh repo view` 테스트
- [ ] `gh issue list` 테스트
- [ ] 별칭(alias) 설정 (선택)

---

**이 가이드는 프로젝트 표준 문서입니다.**
새로운 팀원이나 협업자에게 공유하세요!

© 2025 Weather Monitoring Project
