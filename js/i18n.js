// Tiny i18n: one interface language at a time (vi default, en). Semantic keys, {param} placeholders.
// World content (zones / missions / friends) keeps its Vietnamese text in catalog.js; English lives here
// under zone.* / badge.* / m.<id>.* and falls back to the catalog text when a key is missing.

export const LANGS = ['vi', 'en'];
let lang = 'vi';

const vi = {
  'doc.title': 'Đội Cứu Hộ Cửu Chương · Math Rescue Adventure',
  'screen.home': 'Trang chủ', 'screen.map': 'Bản đồ', 'screen.mission': 'Nhiệm vụ', 'screen.album': 'Sổ cứu hộ', 'screen.profile': 'Nhân vật của bạn',

  'home.title1': 'Đội Cứu Hộ', 'home.title2': 'Cửu Chương',
  'home.sub': 'Giải cứu thế giới bằng phép nhân!',
  'home.hello': 'Chào {nick}!',
  'home.start': 'Bắt đầu phiêu lưu ▶', 'home.continue': '▶ Chơi tiếp',
  'home.stars': '⭐ {n} sao', 'home.next': ' · Tiếp theo: {m}', 'home.hero': ' · 🏆 Anh hùng Cửu Chương',

  'ui.sound': 'Âm thanh', 'ui.settings': 'Cài đặt', 'ui.back': 'Quay lại', 'ui.home': 'Trang chủ',
  'ui.album': 'Sổ cứu hộ', 'ui.totalStars': 'Tổng số sao', 'ui.done': 'Xong',

  'set.title': 'Cài đặt', 'set.sound': 'Âm thanh', 'set.lang': 'Ngôn ngữ',
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
  'ms.again': '🔁 Phép này quay lại nè!', 'ms.recovered': '✓ Nhớ rồi! Giỏi quá!', 'ms.combo': '🔥 {n} lần liền! Siêu quá!',
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

  'hint.encourage': 'Gần đúng rồi!|Thử cách này nhé!|Không sao, mình thử lại!|Cố lên, sắp được rồi!',
  'hint.meaning': '{a} × {b} là {a} được lấy {b} lần', 'hint.meaning1': '{a} × {b} là {a} được lấy {b} lần',
  'hint.count': 'Đếm thêm từng nhóm nhé!', 'hint.trick': 'Mẹo nè!', 'hint.look': 'Xem nè!',
  'hint.times1': 'Số nào nhân 1 cũng bằng chính nó', 'hint.times10': 'Nhân 10: viết thêm số 0 vào sau {a}',
  'hint.plusOne': 'thêm 1 lần {a} nữa: {x} + {y}', 'hint.plusMany': 'thêm {k} lần {a} nữa: {x} + {y}',
};

const en = {
  'doc.title': 'Math Rescue Adventure',
  'screen.home': 'Home', 'screen.map': 'Map', 'screen.mission': 'Mission', 'screen.album': 'Rescue Book', 'screen.profile': 'Your hero',

  'home.title1': 'Math Rescue', 'home.title2': 'Adventure',
  'home.sub': 'Save the world with times tables!',
  'home.hello': 'Hi, {nick}!',
  'home.start': 'Start adventure ▶', 'home.continue': '▶ Continue',
  'home.stars': '⭐ {n} stars', 'home.next': ' · Next: {m}', 'home.hero': ' · 🏆 Times Table Hero',

  'ui.sound': 'Sound', 'ui.settings': 'Settings', 'ui.back': 'Back', 'ui.home': 'Home',
  'ui.album': 'Rescue Book', 'ui.totalStars': 'Total stars', 'ui.done': 'Done',

  'set.title': 'Settings', 'set.sound': 'Sound', 'set.lang': 'Language',
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
  'ms.again': '🔁 This one is back!', 'ms.recovered': '✓ You remembered! Great!', 'ms.combo': '🔥 {n} in a row! Awesome!',
  'ms.typeIt': 'Type that number!', 'ms.tapIt': 'Tap that number!',

  'rw.finale': 'Rescue complete!', 'rw.t1': 'Done!', 'rw.t2': 'Great job!', 'rw.t3': 'Amazing!',
  'rw.why': '{a}/{b} right first time — {s} ⭐', 'rw.tryFor3': 'Play again to try for 3 ⭐',
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

  'hint.encourage': 'So close!|Try it this way!|No worries, try again!|Keep going, nearly there!',
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
  'm.f2.title': 'Firefly Lanterns', 'm.f2.short': 'Lanterns', 'm.f2.npc': 'Little Squirrel',
  'm.f2.intro': 'The woods are so dark! Light 5 lanterns so Little Squirrel can get home.',
  'm.f3.title': 'Vine Bridge', 'm.f3.short': 'Vine Bridge', 'm.f3.npc': 'Orange Fox',
  'm.f3.intro': 'The vine bridge snapped! Join 5 parts again for Orange Fox.',
  'm.f4.title': 'Old Stone Door', 'm.f4.short': 'Stone Door', 'm.f4.npc': 'Green Frog',
  'm.f4.intro': 'Green Frog is stuck behind a stone door. Open the 4 magic signs!',
  'm.f5.title': 'Save Baby Owl', 'm.f5.short': 'Save Owl', 'm.f5.npc': 'Baby Owl',
  'm.f5.intro': 'Baby Owl fell into a deep cave! Send up sky lanterns to lift Baby Owl out.',
  'm.c1.title': 'Fix the Pier', 'm.c1.short': 'Pier', 'm.c1.npc': 'Penguin',
  'm.c1.intro': 'Waves broke the pier! Rebuild 5 parts for Penguin.',
  'm.c2.title': 'Reef Route', 'm.c2.short': 'Sea Route', 'm.c2.npc': 'Sea Turtle',
  'm.c2.intro': 'Watch out for rocks! Steer the boat to Turtle Island.',
  'm.c3.title': 'Treasure Chest', 'm.c3.short': 'Treasure', 'm.c3.npc': 'Red Crab',
  'm.c3.intro': 'Red Crab found a treasure chest! Open the 4 crystal locks.',
  'm.c4.title': 'Lighthouse', 'm.c4.short': 'Lighthouse', 'm.c4.npc': 'Dolphin',
  'm.c4.intro': 'The lighthouse is dark! Charge 5 power levels to guide Dolphin home.',
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
