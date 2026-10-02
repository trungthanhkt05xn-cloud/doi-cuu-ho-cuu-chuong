// Tiny i18n: one interface language at a time (vi default, en). Semantic keys, {param} placeholders.
// World content (zones / missions / friends) keeps its Vietnamese text in catalog.js; English lives here
// under zone.* / badge.* / m.<id>.* and falls back to the catalog text when a key is missing.

export const LANGS = ['vi', 'en'];
let lang = 'vi';

const vi = {
  "pulse.title": "Thế giới gọi bạn!",
  "pulse.invite": "{place} cần bạn giúp một chút.",
  "pulse.later": "Để lúc khác",
  "pulse.intro": "Bạn cũ cần giúp thêm một chút. Cùng làm thế giới sáng lên nhé!",
  "pulse.bloom": "Một chú bướm đã ghé khu vườn!",
  "garden.grow": "Khu vườn lớn lên cùng bạn.",
  "garden.book": "Mỗi lần luyện tập, khu vườn lại lớn thêm. Bạn bè luôn chờ bạn!",
  "adaptive.add": "Thêm một đom đóm",
  "adaptive.remove": "Bớt một đom đóm",
  "adaptive.fill": "Đưa vào tổ ✨",
  "adaptive.ffAct": "Gom đủ một nhóm rồi đưa vào từng tổ.",
  "adaptive.ffNudge": "Chạm + để gom nhóm, rồi đưa vào tổ.",
  "adaptive.sgAct": "Chọn nhóm đèn vừa với mỗi trạm rồi nối dây.",
  "adaptive.sgNudge": "Chọn nhóm có cùng số đèn với trạm.",
  "adaptive.lights": "Nhóm {n} đèn",
  "adaptive.route": "Nối trạm 📡",

  'doc.title': 'Đội Cứu Hộ Cửu Chương · Math Rescue Adventure',
  'screen.home': 'Trang chủ', 'screen.map': 'Bản đồ', 'screen.mission': 'Nhiệm vụ', 'screen.album': 'Sổ cứu hộ', 'screen.profile': 'Nhân vật của bạn',

  'home.title1': 'Đội Cứu Hộ', 'home.title2': 'Cửu Chương',
  'home.sub': 'Giải cứu thế giới bằng phép nhân!',
  'home.hello': 'Chào {nick}!',
  'home.start': 'Bắt đầu phiêu lưu ▶', 'home.continue': '▶ Chơi tiếp',
  'home.stars': '⭐ {n} sao', 'home.next': ' · Tiếp theo: {m}', 'home.hero': ' · 🏆 Anh hùng Cửu Chương',

  'ui.sound': 'Âm thanh', 'ui.music': 'Nhạc nền', 'ui.settings': 'Cài đặt', 'ui.back': 'Quay lại', 'ui.home': 'Trang chủ',
  'ui.album': 'Sổ cứu hộ', 'ui.totalStars': 'Tổng số sao', 'ui.done': 'Xong',

  'set.title': 'Cài đặt', 'set.sound': 'Âm thanh', 'set.music': 'Nhạc nền', 'set.lang': 'Ngôn ngữ',
  'set.reset': 'Xóa tiến trình', 'set.resetAsk': 'Xóa hết sao, sticker và tiến trình học?',
  'set.resetNo': 'Không', 'set.resetYes': 'Xóa hết',

  'nick.default': 'Bạn nhỏ',
  'pf.pick': 'Chọn nhân vật của bạn', 'pf.ask': 'Bạn muốn mọi người gọi mình là gì?',
  'pf.placeholder': 'Ví dụ: Bin, Na, Minh', 'pf.skip': 'Bỏ qua', 'pf.done': 'Xong ✓',
  'av.bip': 'Rô-bốt Bíp', 'av.cap': 'Mũ Đỏ', 'av.buns': 'Tóc Búi', 'av.fox': 'Cáo Phi Công', 'av.panda': 'Gấu Trúc',
  'av.dino': 'Khủng Long', 'av.squirrel': 'Sóc Con', 'av.turtle': 'Rùa Con', 'av.rabbit': 'Thỏ Con',

  'map.locked': '🔒 Chưa mở', 'map.lockedAria': ' (chưa mở)', 'map.fog': '{m} để mở',
  'map.fogToast': '🔒 Vùng này chưa mở. Hoàn thành vùng trước nhé!',
  'map.newZone': '🗺️ Vùng mới: <b>{z}</b>!',
  'map.intro': 'Chào {nick}! Chạm vào bạn Vịt để bắt đầu cứu hộ nhé!',
  'map.allDone': '🏆 Bạn đã cứu tất cả bạn bè! <b>Anh hùng Cửu Chương!</b>',

  'ms.exit': 'Về bản đồ', 'ms.progress': 'Tiến độ', 'ms.hint': 'Gợi ý', 'ms.closeHint': 'Đóng gợi ý',
  'ms.exitAsk': 'Về bản đồ nhé?', 'ms.stay': 'Chơi tiếp', 'ms.leave': 'Về bản đồ',
  'ms.needsYou': '{nick} ơi, {npc} cần bạn!', 'ms.go': 'Bắt đầu! ▶',
  'ms.del': 'Xóa', 'ms.ok': 'Xong',
  'ms.again': '🔁 Phép này quay lại nè!', 'ms.echo': '🔁 Nhớ phép này ở {place} không?', 'ms.recovered': '✓ Nhớ rồi! Giỏi quá!', 'ms.combo': '🔥 {n} lần liền! Siêu quá!',
  'ms.typeIt': 'Bấm số đó nhé!', 'ms.tapIt': 'Chạm vào số đó nhé!',

  'rw.finale': 'Giải cứu thành công!', 'rw.t1': 'Hoàn thành!', 'rw.t2': 'Giỏi lắm!', 'rw.t3': 'Xuất sắc!',
  'rw.why': '{a}/{b} câu đúng ngay lần đầu — {s} ⭐', 'rw.tryFor3': 'Chơi lại để thử lấy 3 ⭐',
  'rw.best': 'Kỷ lục của bạn vẫn là {n} ⭐', 'rw.hintFree': '💡 Dùng gợi ý vẫn được đủ sao!',
  'rw.thanks': 'Cảm ơn {nick}!', 'rw.sticker': 'Sticker mới:', 'rw.zone': '🗺️ Mở vùng mới:',
  'rw.replay': '↺ Chơi lại', 'rw.continue': 'Tiếp tục ▶',

  'bk.title': 'Sổ Cứu Hộ', 'bk.captain': 'Đội trưởng', 'bk.change': '✏️ Đổi', 'bk.badges': 'Huy hiệu',
  'bk.friends': 'Bạn bè đã cứu', 'bk.power': 'Sức mạnh cửu chương', 'bk.legend': 'Pha lê sáng dần:',
  'bk.table': 'Bảng {t}: {s}', 'bk.notMet': 'chưa gặp',
  'stage.new': 'Mới gặp', 'stage.grow': 'Đang nhớ', 'stage.ok': 'Gần thuộc', 'stage.strong': 'Đã thuộc',
  'stageShort.new': 'Mới gặp', 'stageShort.grow': 'Đang nhớ', 'stageShort.ok': 'Gần thuộc', 'stageShort.strong': 'Đã thuộc',

  'mech.repair': 'Đoạn cầu cần bao nhiêu tấm ván?', 'mech.repairOk': 'Cầu chắc hơn rồi!|Chuẩn luôn!|Đủ ván rồi!',
  'mech.repairCap': 'Mỗi bó {a} tấm · {b} bó', 'mech.repairCap1': 'Mỗi bó {a} tấm · {b} bó',
  'mech.light': 'Đèn cần bao nhiêu bóng nhỏ?', 'mech.lightKey': 'Cần bao nhiêu bóng? Bấm số!',
  'mech.lightOk': 'Sáng rồi!|Rực rỡ quá!|Đủ bóng rồi!', 'mech.lightCap': 'Mỗi chùm {a} bóng · {b} chùm',
  'mech.lightCap1': 'Mỗi chùm {a} bóng · {b} chùm',
  'mech.path': 'Chọn biển báo có số đúng!', 'mech.pathOk': 'Đúng đường rồi!|Đi tiếp nào!|Chuẩn luôn!',
  'mech.balloon': 'Chạm quả bóng có số đúng!', 'mech.lantern': 'Chạm đèn lồng có số đúng!', 'mech.bubble': 'Chạm bong bóng có số đúng!',
  'mech.rescueOk': 'Bay lên nào!|Lên cao hơn rồi!|Cố lên bạn ơi!',
  'mech.unlock': 'Bấm số để mở khóa!', 'mech.unlockOk': 'Mở được rồi!|Cạch! Mở rồi!|Tuyệt!',

  // V1.1 — build the groups in the world, then answer
  'mech.ffAct': 'Đánh thức từng tổ đom đóm!', 'mech.ffHow': 'Chạm hoặc vuốt qua các tổ',
  'mech.ffNudge': 'Tổ nào còn tối? Chạm vào nhé!', 'mech.ffCap': 'Mỗi tổ {a} con đom đóm',
  'mech.ff': 'Có tất cả bao nhiêu đom đóm?', 'mech.ffOk': 'Đường sáng rồi!|Đom đóm bay lên!|Rực rỡ quá!',
  'mech.sgAct': 'Nối cây tín hiệu với từng trạm!', 'mech.sgHow': 'Chạm từng trạm, hoặc kéo từ cây tín hiệu',
  'mech.sgNudge': 'Trạm nào còn tắt? Chạm vào nhé!', 'mech.sgCap': 'Mỗi trạm {a} đèn tín hiệu',
  'mech.sg': 'Bao nhiêu đèn tín hiệu đang sáng? Bấm số!', 'mech.sgOk': 'Tín hiệu mạnh rồi!|Sương tan dần!|Kết nối xong!',
  'mech.rlAct': 'Nạp năng lượng cho từng phao!', 'mech.rlHow': 'Chạm vào phao, thuyền sẽ chở tới',
  'mech.rlNudge': 'Phao nào còn tắt? Chạm vào nhé!', 'mech.rlCap': 'Mỗi phao {a} gói năng lượng',
  'mech.rl': 'Cần bao nhiêu gói năng lượng tất cả?', 'mech.rlOk': 'Phao sáng rồi!|Ra khơi thôi!|Tiếp sức thành công!',
  'mech.bcAct': 'Quay máy phát để nạp đèn!', 'mech.bcHow': 'Chạm vào tay quay, mỗi vòng một bó tia sáng',
  'mech.bcNudge': 'Chạm vào tay quay màu cam nhé!', 'mech.bcCap': 'Mỗi vòng {a} tia sáng',
  'mech.bc': 'Tầng đèn có bao nhiêu tia sáng? Bấm số!', 'mech.bcOk': 'Tầng đèn sáng rồi!|Hải đăng tỉnh dần!|Sáng rực!',
  'mech.nrFind': 'Cú Con ở cây có số đúng. Chạm vào cây đó!', 'mech.nrCap': '{b} chùm tín hiệu, mỗi chùm {a}', 'mech.nrCap1': '1 chùm tín hiệu, mỗi chùm {a}',
  'mech.nrMushAct': 'Thắp sáng từng cây nấm!', 'mech.nrMushHow': 'Chạm hoặc vuốt qua các cây nấm',
  'mech.nrMushNudge': 'Cây nấm nào còn tối? Chạm vào nhé!', 'mech.nrMushCap': 'Mỗi cây nấm {a} đốm sáng',
  'mech.nrMush': 'Có tất cả bao nhiêu đốm sáng?',
  'mech.nrLiftAct': 'Thắp từng đèn lồng để nâng giỏ!', 'mech.nrLiftHow': 'Chạm hoặc vuốt qua các đèn lồng',
  'mech.nrLiftNudge': 'Đèn lồng nào còn tắt? Chạm vào nhé!', 'mech.nrLiftCap': 'Mỗi đèn lồng {a} con đom đóm',
  'mech.nrLift': 'Bao nhiêu đom đóm nâng giỏ lên? Bấm số!', 'mech.nrOk': 'Tuyệt vời!|Sắp tới rồi!|Cố lên Cú Con!',
  'nr.find': 'Tín hiệu rừng đang dò tìm Cú Con…', 'nr.findSig': 'Mạng tín hiệu bạn nối đang dò tìm Cú Con!',
  'nr.found': 'Thấy Cú Con rồi! Thắp sáng lối đi nào!', 'nr.cross2': 'Thêm một con suối nữa thôi!',
  'nr.helpers': 'Đom đóm bạn đánh thức bay tới giúp!', 'nr.helpersNew': 'Gọi đom đóm tới giúp nào!',
  // The world remembers (map, after a first rescue)
  'wr.v1': '🌉 Cầu gỗ sửa xong rồi! Vịt Vàng đã qua sông.', 'wr.f2': '✨ Đom đóm thức dậy rồi! Rừng sáng hơn hẳn.',
  'wr.f4': '📡 Tín hiệu rừng đã bật! Nghe rừng hát kìa.', 'wr.f5': '🦉 Cú Con về nhà rồi. Rừng Thì Thầm sống lại!',
  'wr.c2': '⛵ Phao cứu hộ sáng suốt đường ra khơi!', 'wr.c4': '🌟 Hải đăng thức dậy rồi, sáng mãi luôn!',

  'hint.encourage': 'Gần đúng rồi!|Thử cách này nhé!|Không sao, mình thử lại!|Cố lên, sắp được rồi!',
  'hint.help': 'Cùng xem nhé!|Mẹo nhỏ nè!|Nhìn kỹ nè!',
  'hint.meaning': '{a} × {b} là {a} được lấy {b} lần', 'hint.meaning1': '{a} × {b} là {a} được lấy {b} lần',
  'hint.count': 'Đếm thêm từng nhóm nhé!', 'hint.trick': 'Mẹo nè!', 'hint.look': 'Xem nè!',
  'hint.times1': 'Số nào nhân 1 cũng bằng chính nó', 'hint.times10': 'Nhân 10: viết thêm số 0 vào sau {a}',
  'hint.plusOne': 'thêm 1 lần {a} nữa: {x} + {y}', 'hint.plusMany': 'thêm {k} lần {a} nữa: {x} + {y}',
};

const en = {
  "pulse.title": "The world is calling!",
  "pulse.invite": "{place} could use a little help.",
  "pulse.later": "Another time",
  "pulse.intro": "An old friend could use a little help. Let’s brighten the world together!",
  "pulse.bloom": "A butterfly has joined your garden!",
  "garden.grow": "Your garden grows with you.",
  "garden.book": "Each practice helps your garden grow. Your friends are always here!",
  "adaptive.add": "Add one firefly",
  "adaptive.remove": "Remove one firefly",
  "adaptive.fill": "Fill a nest ✨",
  "adaptive.ffAct": "Make one group, then fill each nest.",
  "adaptive.ffNudge": "Tap + to make a group, then fill a nest.",
  "adaptive.sgAct": "Choose lights that fit a station, then connect it.",
  "adaptive.sgNudge": "Choose a group with as many lights as a station.",
  "adaptive.lights": "Group of {n} lights",
  "adaptive.route": "Connect 📡",

  'doc.title': 'Math Rescue Adventure',
  'screen.home': 'Home', 'screen.map': 'Map', 'screen.mission': 'Mission', 'screen.album': 'Rescue Book', 'screen.profile': 'Your hero',

  'home.title1': 'Math Rescue', 'home.title2': 'Adventure',
  'home.sub': 'Save the world with times tables!',
  'home.hello': 'Hi, {nick}!',
  'home.start': 'Start adventure ▶', 'home.continue': '▶ Continue',
  'home.stars': '⭐ {n} stars', 'home.next': ' · Next: {m}', 'home.hero': ' · 🏆 Times Table Hero',

  'ui.sound': 'Sound', 'ui.music': 'Music', 'ui.settings': 'Settings', 'ui.back': 'Back', 'ui.home': 'Home',
  'ui.album': 'Rescue Book', 'ui.totalStars': 'Total stars', 'ui.done': 'Done',

  'set.title': 'Settings', 'set.sound': 'Sound', 'set.music': 'Music', 'set.lang': 'Language',
  'set.reset': 'Reset progress', 'set.resetAsk': 'Delete all stars, stickers and progress?',
  'set.resetNo': 'No', 'set.resetYes': 'Delete all',

  'nick.default': 'Buddy',
  'pf.pick': 'Pick your hero', 'pf.ask': 'What should we call you?',
  'pf.placeholder': 'e.g. Sam, Mia, Leo', 'pf.skip': 'Skip', 'pf.done': 'Done ✓',
  'av.bip': 'Robot Bip', 'av.cap': 'Red Cap', 'av.buns': 'Star Buns', 'av.fox': 'Pilot Fox', 'av.panda': 'Panda',
  'av.dino': 'Dino', 'av.squirrel': 'Squirrel', 'av.turtle': 'Turtle', 'av.rabbit': 'Bunny',

  'map.locked': '🔒 Locked', 'map.lockedAria': ' (locked)', 'map.fog': 'Finish {m}',
  'map.fogToast': '🔒 Not open yet. Finish the land before this one!',
  'map.newZone': '🗺️ New land: <b>{z}</b>!',
  'map.intro': 'Hi, {nick}! Tap Yellow Duck to start your first rescue!',
  'map.allDone': '🏆 You rescued every friend! <b>Times Table Hero!</b>',

  'ms.exit': 'Back to map', 'ms.progress': 'Progress', 'ms.hint': 'Hint', 'ms.closeHint': 'Close hint',
  'ms.exitAsk': 'Go back to the map?', 'ms.stay': 'Keep playing', 'ms.leave': 'Map',
  'ms.needsYou': '{nick}, {npc} needs you!', 'ms.go': "Let's go! ▶",
  'ms.del': 'Delete', 'ms.ok': 'Done',
  'ms.again': '🔁 This one is back!', 'ms.echo': '🔁 Remember this one from {place}?', 'ms.recovered': '✓ You remembered! Great!', 'ms.combo': '🔥 {n} in a row! Awesome!',
  'ms.typeIt': 'Type that number!', 'ms.tapIt': 'Tap that number!',

  'rw.finale': 'Rescue complete!', 'rw.t1': 'Done!', 'rw.t2': 'Great job!', 'rw.t3': 'Amazing!',
  'rw.why': '{a} of {b} correct on the first try — {s} ⭐', 'rw.tryFor3': 'Play again to try for 3 ⭐',
  'rw.best': 'Your best is still {n} ⭐', 'rw.hintFree': '💡 Hints never cost stars!',
  'rw.thanks': 'Thank you, {nick}!', 'rw.sticker': 'New sticker:', 'rw.zone': '🗺️ New land:',
  'rw.replay': '↺ Play again', 'rw.continue': 'Continue ▶',

  'bk.title': 'Rescue Book', 'bk.captain': 'Captain', 'bk.change': '✏️ Change', 'bk.badges': 'Badges',
  'bk.friends': 'Friends rescued', 'bk.power': 'Times table power', 'bk.legend': 'Crystals glow brighter:',
  'bk.table': 'Table {t}: {s}', 'bk.notMet': 'not started',
  'stage.new': 'New', 'stage.grow': 'Learning', 'stage.ok': 'Almost there', 'stage.strong': 'Mastered',
  'stageShort.new': 'New', 'stageShort.grow': 'Learning', 'stageShort.ok': 'Almost', 'stageShort.strong': 'Mastered',

  'mech.repair': 'How many planks for this part?', 'mech.repairOk': 'Stronger bridge!|Spot on!|Enough planks!',
  'mech.repairCap': '{b} bundles of {a} planks', 'mech.repairCap1': '1 bundle of {a} planks',
  'mech.light': 'How many bulbs does the lamp need?', 'mech.lightKey': 'How many bulbs? Type it!',
  'mech.lightOk': 'Lights on!|So bright!|Enough bulbs!', 'mech.lightCap': '{b} groups of {a} bulbs',
  'mech.lightCap1': '1 group of {a} bulbs',
  'mech.path': 'Pick the sign with the right number!', 'mech.pathOk': 'Right way!|Keep going!|Spot on!',
  'mech.balloon': 'Tap the balloon with the right number!', 'mech.lantern': 'Tap the lantern with the right number!', 'mech.bubble': 'Tap the bubble with the right number!',
  'mech.rescueOk': 'Up we go!|Higher!|Nearly there!',
  'mech.unlock': 'Type the number to unlock!', 'mech.unlockOk': 'Unlocked!|Click! Open!|Great!',

  'mech.ffAct': 'Wake up every firefly nest!', 'mech.ffHow': 'Tap or swipe across the nests',
  'mech.ffNudge': 'Find a dark nest and tap it!', 'mech.ffCap': '{a} fireflies in each nest',
  'mech.ff': 'How many fireflies in all?', 'mech.ffOk': 'The path is glowing!|Fly, fireflies!|So bright!',
  'mech.sgAct': 'Connect the signal tree to every station!', 'mech.sgHow': 'Tap each station, or drag from the tree',
  'mech.sgNudge': 'Find a dark station and tap it!', 'mech.sgCap': '{a} signal lights at each station',
  'mech.sg': 'How many signal lights are on? Type it!', 'mech.sgOk': 'Strong signal!|The mist is clearing!|Connected!',
  'mech.rlAct': 'Power up every buoy!', 'mech.rlHow': 'Tap a buoy and the boat brings the energy',
  'mech.rlNudge': 'Find a dark buoy and tap it!', 'mech.rlCap': '{a} energy packs for each buoy',
  'mech.rl': 'How many energy packs in all?', 'mech.rlOk': 'The buoys are glowing!|Full speed ahead!|Relay done!',
  'mech.bcAct': 'Turn the crank to charge the light!', 'mech.bcHow': 'Tap the crank: each turn makes sparks',
  'mech.bcNudge': 'Tap the orange crank!', 'mech.bcCap': '{a} sparks every turn',
  'mech.bc': 'How many sparks for this floor? Type it!', 'mech.bcOk': 'The floor lights up!|The lighthouse is waking!|So bright!',
  'mech.nrFind': 'Owl is in the tree with the right number. Tap it!', 'mech.nrCap': '{b} flashes of {a} lights', 'mech.nrCap1': '1 flash of {a} lights',
  'mech.nrMushAct': 'Light up every mushroom!', 'mech.nrMushHow': 'Tap or swipe across the mushrooms',
  'mech.nrMushNudge': 'Find a dark mushroom and tap it!', 'mech.nrMushCap': '{a} glowing spots on each mushroom',
  'mech.nrMush': 'How many glowing spots in all?',
  'mech.nrLiftAct': 'Light every lantern to lift the basket!', 'mech.nrLiftHow': 'Tap or swipe across the lanterns',
  'mech.nrLiftNudge': 'Find a dark lantern and tap it!', 'mech.nrLiftCap': '{a} fireflies in each lantern',
  'mech.nrLift': 'How many fireflies lift the basket? Type it!', 'mech.nrOk': 'Wonderful!|Almost there!|Hold on, Owl!',
  'nr.find': 'The forest signal is searching for Owl…', 'nr.findSig': 'The signal network you fixed is searching for Owl!',
  'nr.found': "There's Owl! Now light the way!", 'nr.cross2': 'Just one more stream to cross!',
  'nr.helpers': 'The fireflies you woke came to help!', 'nr.helpersNew': "Let's call the fireflies to help!",
  'wr.v1': '🌉 The bridge is fixed! Yellow Duck made it across.', 'wr.f2': '✨ The fireflies are awake! The woods are brighter.',
  'wr.f4': '📡 The forest signal is on! Listen, the woods are singing.', 'wr.f5': '🦉 Baby Owl is home. Whisper Woods is alive again!',
  'wr.c2': '⛵ The rescue buoys light the way out to sea!', 'wr.c4': '🌟 The lighthouse is awake, and it stays on!',

  'hint.encourage': 'So close!|Try it this way!|No worries, try again!|Keep going, nearly there!',
  'hint.help': "Let's look together!|Here's a clue!|Take a closer look!",
  'hint.meaning': '{a} × {b} means {b} groups of {a}', 'hint.meaning1': '{a} × 1 means 1 group of {a}',
  'hint.count': 'Count up group by group!', 'hint.trick': 'Try this trick!', 'hint.look': 'Look!',
  'hint.times1': 'Any number × 1 stays the same', 'hint.times10': '× 10: put a 0 after {a}',
  'hint.plusOne': 'add one more {a}: {x} + {y}', 'hint.plusMany': 'add {k} more {a}s: {x} + {y}',

  // World content (Vietnamese source text stays in catalog.js)
  'zone.village': 'Sunny Village', 'zone.forest': 'Whisper Woods', 'zone.cove': 'Crystal Cove',
  'badge.village': 'Sun Badge', 'badge.forest': 'Forest Badge', 'badge.cove': 'Crystal Badge',
  'm.v1.title': 'Fix the Bridge', 'm.v1.short': 'Bridge', 'm.v1.npc': 'Yellow Duck',
  'm.v1.intro': 'The wooden bridge is broken! Fix 4 parts so Yellow Duck can cross.',
  'm.v2.title': 'Open the Gate', 'm.v2.short': 'Farm Gate', 'm.v2.npc': 'Fluffy Sheep',
  'm.v2.intro': 'Fluffy Sheep is locked in! Open the 3 locks on the gate.',
  'm.v3.title': 'Windmill Path', 'm.v3.short': 'Find Path', 'm.v3.npc': 'Pink Piggy',
  'm.v3.intro': 'Pink Piggy is lost near the windmill. Pick the right path!',
  'm.v4.title': 'Village Lights', 'm.v4.short': 'Lamps', 'm.v4.npc': 'Little Hen',
  'm.v4.intro': "It's getting dark! Turn on 4 lamps so Little Hen can get home.",
  'm.v5.title': 'Save the Kitten', 'm.v5.short': 'Save Kitten', 'm.v5.npc': 'Kitten',
  'm.v5.intro': 'Kitten fell into a well! Tie on balloons to lift Kitten up.',
  'm.f1.title': 'Mystery Trail', 'm.f1.short': 'Trail', 'm.f1.npc': 'Hedgehog',
  'm.f1.intro': "So many turns in the woods! Find the way to Hedgehog's house.",
  'm.f2.title': 'Wake the Fireflies', 'm.f2.short': 'Fireflies', 'm.f2.npc': 'Little Squirrel',
  'm.f2.intro': "The woods are so dark! Wake the fireflies to light Little Squirrel's way home.",
  'm.f3.title': 'Vine Bridge', 'm.f3.short': 'Vine Bridge', 'm.f3.npc': 'Orange Fox',
  'm.f3.intro': 'The vine bridge snapped! Join 5 parts again for Orange Fox.',
  'm.f4.title': 'Forest Signal', 'm.f4.short': 'Signal', 'm.f4.npc': 'Green Frog',
  'm.f4.intro': 'Green Frog is lost in the mist! Connect the signal stations to find Frog.',
  'm.f5.title': 'Night Rescue', 'm.f5.short': 'Save Owl', 'm.f5.npc': 'Baby Owl',
  'm.f5.intro': 'Baby Owl is lost in the night! Find Owl, light the way and bring Owl home.',
  'm.c1.title': 'Fix the Pier', 'm.c1.short': 'Pier', 'm.c1.npc': 'Penguin',
  'm.c1.intro': 'Waves broke the pier! Rebuild 5 parts for Penguin.',
  'm.c2.title': 'Ocean Relay', 'm.c2.short': 'Relay', 'm.c2.npc': 'Sea Turtle',
  'm.c2.intro': 'Sea Turtle is waiting on a far island! Power up the rescue buoys so the boat can sail.',
  'm.c3.title': 'Treasure Chest', 'm.c3.short': 'Treasure', 'm.c3.npc': 'Red Crab',
  'm.c3.intro': 'Red Crab found a treasure chest! Open the 4 crystal locks.',
  'm.c4.title': 'Wake the Lighthouse', 'm.c4.short': 'Lighthouse', 'm.c4.npc': 'Dolphin',
  'm.c4.intro': 'The lighthouse fell asleep! Turn the crank to wake each floor and guide Dolphin home.',
  'm.c5.title': 'Save the Otter', 'm.c5.short': 'Save Otter', 'm.c5.npc': 'Otter',
  'm.c5.intro': 'Otter is stuck on the sea floor! Blow bubbles to lift Otter up.',
};

const DICT = { vi, en };

export const getLang = () => lang;
export function setLang(l) {
  lang = LANGS.includes(l) ? l : 'vi';
  document.documentElement.lang = lang;
  document.title = t('doc.title');
}

const fill = (s, p) => (p ? s.replace(/\{(\w+)\}/g, (m, k) => (p[k] !== undefined ? p[k] : m)) : s);

/** Translate a UI key. Falls back to Vietnamese, then to the key itself. */
export function t(key, params) {
  const s = DICT[lang][key] !== undefined ? DICT[lang][key] : vi[key] !== undefined ? vi[key] : key;
  return fill(s, params);
}
/** Count-aware key: '<key>1' when n === 1 (English singular), else '<key>'. */
export const tn = (key, n, params) => t(n === 1 ? key + '1' : key, params);
/** A "|"-separated list (random praise lines etc.). */
export const tList = (key) => t(key).split('|');
/** Content with its Vietnamese source elsewhere (catalog): English key when present, else the source text. */
const tc = (key, source) => (lang !== 'vi' && DICT[lang][key] !== undefined ? DICT[lang][key] : source);

export const zoneName = (z) => tc(`zone.${z.id}`, z.name);
export const badgeName = (z) => tc(`badge.${z.id}`, z.badge.name);
export const missionText = (m, field) => tc(`m.${m.id}.${field}`, m[field]);
export const npcName = (m) => tc(`m.${m.id}.npc`, m.npc.name);
