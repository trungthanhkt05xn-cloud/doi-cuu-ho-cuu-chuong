# Technical Architecture

## MVP recommendation

### Stack
- HTML5
- CSS3
- Vanilla JavaScript ES Modules
- localStorage
- static assets

### Deployment
Có thể chạy bằng:
- GitHub Pages;
- Cloudflare Pages;
- Netlify;
- Vercel static;
- local static server.

Không cần backend.

## Suggested structure

```text
math-rescue-adventure/
├─ index.html
├─ css/
│  ├─ base.css
│  ├─ layout.css
│  ├─ components.css
│  └─ game.css
├─ js/
│  ├─ app.js
│  ├─ state.js
│  ├─ router.js
│  ├─ game/
│  │  ├─ missionEngine.js
│  │  ├─ missionCatalog.js
│  │  └─ progression.js
│  ├─ learning/
│  │  ├─ questionGenerator.js
│  │  ├─ adaptiveEngine.js
│  │  └─ mastery.js
│  ├─ ui/
│  │  ├─ mapView.js
│  │  ├─ missionView.js
│  │  ├─ feedback.js
│  │  └─ settingsView.js
│  └─ storage/
│     └─ localStore.js
├─ assets/
│  ├─ images/
│  ├─ icons/
│  └─ audio/
└─ docs/
```

Có thể rút gọn file nếu implementation còn nhỏ. Không bắt buộc đúng cấu trúc nếu tạo ra quá nhiều boilerplate.

## State shape gợi ý

```json
{
  "profile": {
    "name": "",
    "stars": 0
  },
  "progress": {
    "currentZone": "village",
    "completedMissions": []
  },
  "learning": {
    "facts": {}
  },
  "settings": {
    "sound": true
  }
}
```

## Mission definition gợi ý

```json
{
  "id": "village_bridge_01",
  "zone": "village",
  "type": "repair",
  "title": "Sửa cây cầu",
  "steps": 4,
  "tables": [2,3,4],
  "difficulty": 1,
  "reward": {
    "stars": 3
  }
}
```

## Mission engine
Mission engine không chứa logic cụ thể của cửu chương.

Nó yêu cầu question từ learning engine.

Learning engine trả:
```json
{
  "factKey": "3x4",
  "a": 3,
  "b": 4,
  "answer": 12,
  "mode": "keypad"
}
```

Mission chỉ quyết định:
- câu hỏi xuất hiện ở thời điểm nào;
- correct → action nào;
- wrong → feedback nào;
- mission complete khi nào.

## Persistence
- save sau mỗi answer/mission event quan trọng;
- schema có `version`;
- code cần chịu được localStorage hỏng/missing;
- Reset Progress phải có confirm.

## PWA
Không bắt buộc MVP đầu.

Có thể thêm phase 2:
- manifest;
- service worker;
- Add to Home Screen;
- offline cache.

Không để PWA làm chậm core MVP.
