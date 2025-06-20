# 미디어 내 패션 제품 추천 시스템 🛒

📑 [DBPia 논문 바로가기](https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE11667690)

<img src="asset/논문 포스터.png" alt="포스터" width="600px" />

</br>

## 📄 파일 구조
- manifest.json
    - 크롬 익스텐션 정의
- background.js
    - 브라우저 영역에서 작동하는 스크립트
    - .env에서 api key 받아옴
- popup.html
    - 크롬 익스텐션 아이콘을 클릭하면 뜨는 팝업창
- popup.js
    - popup.html에서 작동하는 스크립트
- page.js
    - content script - 현재 페이지에서의 UI 수정 가능
    - 유튜브 우측 컨트롤러에 쇼핑 카트 버튼 추가
    - 영상 속 제품들을 감지하여 popup2.js로 데이터 전송
- popup2.html
    - 쇼핑 카트 버튼 클릭 시 뜨는 새로운 팝업창
    - 감지한 제품들의 버튼이 뜸
- popup2.js
    - popup2.html에서 작동하는 스크립트
    - 감지한 제품들의 버튼을 생성함
    - 제품 버튼을 클릭하면 해당 제품의 이미지 크롭 및 다운로드
- .env
    - api key와 같은 민감한 정보는 .env에 작성
- .gitignore
    - .env처럼 깃허브에 올라가면 안되는 파일 및 폴더 이름 작성
