# GitHub Pages 배포 메모

## 현재 프로젝트 위치

```bash
cd /Users/stella/Documents/sieun_project/bird-tree
```

## 먼저 해야 할 일

채팅이나 터미널에 노출된 GitHub 토큰은 폐기한다.

1. https://github.com/settings/tokens 접속
2. 노출된 토큰을 찾아 `Revoke` 또는 삭제
3. 새 토큰을 만들더라도 채팅에 붙여넣지 않는다

## 안전한 GitHub 로그인 방법

토큰을 직접 전달하지 말고 브라우저 로그인으로 인증한다.

```bash
gh auth login -h github.com -w
```

터미널에 표시되는 코드를 GitHub 브라우저 화면에 입력하고 승인한다.

인증 확인:

```bash
gh auth status
```

## 저장소 만들고 푸시하기

```bash
gh repo create bird-tree --public --source=. --remote=origin --push
```

이미 원격 저장소가 있으면:

```bash
git remote add origin https://github.com/stella-L/bird-tree.git
git push -u origin main
```

## GitHub Pages 켜기

```bash
gh api repos/stella-L/bird-tree/pages -f source.branch=main -f source.path=/
```

배포 주소는 보통 다음 형식이다.

```text
https://stella-L.github.io/bird-tree/
```

## 현재 앱에서 확인할 것

- `index.html` 안의 `APPS_SCRIPT_URL`은 정상 작동하는 Apps Script URL로 설정되어 있다.
- Google Sheets 저장/불러오기는 브라우저 테스트에서 동작 확인했다.
- 배포 후에도 이름 입력, 새 저장, 새 위 `by 이름` 표시를 확인한다.
