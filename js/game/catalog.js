// World content: zones + missions. Pure data — add missions here, no engine changes needed.

export const ZONES = [
  {
    id: 'village', name: 'Làng Nắng', tables: [2, 3, 4],
    color: '#ffb020', badge: { name: 'Huy hiệu Mặt Trời', icon: '🌻' },
  },
  {
    id: 'forest', name: 'Rừng Thì Thầm', tables: [4, 5, 6],
    color: '#2fb07a', badge: { name: 'Huy hiệu Rừng Xanh', icon: '🍄' },
  },
  {
    id: 'cove', name: 'Vịnh Pha Lê', tables: [6, 7, 8, 9],
    color: '#2aa9e0', badge: { name: 'Huy hiệu Pha Lê', icon: '💎' },
  },
];

// type: repair | unlock | path | rescue | light (V1.0)
//       firefly | signal | nightRescue | relay | beacon (V1.1 "Living Rescue World": build the groups in the world)
// answer (optional) overrides the mechanic's default answer mode.
export const MISSIONS = [
  // ── Làng Nắng ──
  { id: 'v1', zone: 'village', type: 'repair', steps: 4, title: 'Sửa cầu gỗ', short: 'Sửa cầu',
    intro: 'Cầu gỗ bị gãy! Sửa 4 đoạn cầu để Vịt Vàng qua sông.', npc: { e: '🦆', name: 'Vịt Vàng' } },
  { id: 'v2', zone: 'village', type: 'unlock', steps: 3, title: 'Mở cổng trang trại', short: 'Mở cổng',
    intro: 'Cừu Bông bị nhốt! Mở 3 ổ khóa trên cổng nhé.', npc: { e: '🐑', name: 'Cừu Bông' } },
  { id: 'v3', zone: 'village', type: 'path', steps: 3, title: 'Đường tới cối xay', short: 'Tìm đường',
    intro: 'Heo Hồng bị lạc ở cối xay gió. Chọn đúng lối đi!', npc: { e: '🐷', name: 'Heo Hồng' } },
  { id: 'v4', zone: 'village', type: 'light', steps: 4, title: 'Thắp đèn làng', short: 'Thắp đèn',
    intro: 'Trời tối rồi! Bật sáng 4 cây đèn cho Gà Mơ về nhà.', npc: { e: '🐔', name: 'Gà Mơ' } },
  { id: 'v5', zone: 'village', type: 'rescue', steps: 5, finale: true, title: 'Cứu Mèo Con', short: 'Cứu Mèo Con',
    intro: 'Mèo Con rơi xuống giếng! Thả bóng bay kéo bạn ấy lên.', npc: { e: '🐱', name: 'Mèo Con' } },

  // ── Rừng Thì Thầm ──
  { id: 'f1', zone: 'forest', type: 'path', steps: 4, title: 'Lối mòn bí ẩn', short: 'Lối mòn',
    intro: 'Rừng nhiều ngã rẽ quá! Tìm đường tới nhà Nhím Nâu.', npc: { e: '🦔', name: 'Nhím Nâu' } },
  { id: 'f2', zone: 'forest', type: 'firefly', steps: 5, title: 'Đánh thức đom đóm', short: 'Đom đóm',
    intro: 'Rừng tối om! Đánh thức đom đóm để soi đường cho Sóc Nhỏ về tổ.', npc: { e: '🐿️', name: 'Sóc Nhỏ' } },
  { id: 'f3', zone: 'forest', type: 'repair', steps: 5, title: 'Cầu dây leo', short: 'Cầu dây leo',
    intro: 'Cầu dây leo bị đứt! Nối 5 đoạn cầu giúp Cáo Cam.', npc: { e: '🦊', name: 'Cáo Cam' } },
  { id: 'f4', zone: 'forest', type: 'signal', steps: 4, title: 'Tín hiệu rừng xanh', short: 'Tín hiệu',
    intro: 'Ếch Xanh lạc trong sương mù! Nối các trạm tín hiệu để tìm bạn ấy.', npc: { e: '🐸', name: 'Ếch Xanh' } },
  { id: 'f5', zone: 'forest', type: 'nightRescue', steps: 4, finale: true, title: 'Cứu hộ trong đêm', short: 'Cứu Cú Con',
    intro: 'Cú Con bị lạc trong đêm! Tìm bạn ấy, thắp sáng lối đi rồi đưa bạn ấy về nhà.', npc: { e: '🦉', name: 'Cú Con' } },

  // ── Vịnh Pha Lê ──
  { id: 'c1', zone: 'cove', type: 'repair', steps: 5, title: 'Cầu cảng', short: 'Cầu cảng',
    intro: 'Sóng làm hỏng cầu cảng! Lát lại 5 đoạn cho Cánh Cụt.', npc: { e: '🐧', name: 'Cánh Cụt' } },
  { id: 'c2', zone: 'cove', type: 'relay', steps: 4, title: 'Tiếp sức ngoài khơi', short: 'Tiếp sức',
    intro: 'Rùa Biển chờ ở đảo xa! Nạp năng lượng cho phao cứu hộ để thuyền ra khơi.', npc: { e: '🐢', name: 'Rùa Biển' } },
  { id: 'c3', zone: 'cove', type: 'unlock', steps: 4, title: 'Rương kho báu', short: 'Kho báu',
    intro: 'Cua Đỏ tìm thấy rương báu! Mở 4 khóa pha lê nhé.', npc: { e: '🦀', name: 'Cua Đỏ' } },
  { id: 'c4', zone: 'cove', type: 'beacon', steps: 5, title: 'Đánh thức hải đăng', short: 'Hải đăng',
    intro: 'Hải đăng ngủ quên rồi! Quay máy phát để đánh thức từng tầng đèn, dẫn Cá Heo về.', npc: { e: '🐬', name: 'Cá Heo' } },
  { id: 'c5', zone: 'cove', type: 'rescue', steps: 6, finale: true, title: 'Cứu Rái Cá', short: 'Cứu Rái Cá',
    intro: 'Rái Cá kẹt dưới đáy biển! Thổi bong bóng đưa bạn lên.', npc: { e: '🦦', name: 'Rái Cá' } },
];

export const zoneById = (id) => ZONES.find((z) => z.id === id);
export const missionById = (id) => MISSIONS.find((m) => m.id === id);
export const zoneMissions = (zoneId) => MISSIONS.filter((m) => m.zone === zoneId);
export const zoneIndex = (zoneId) => ZONES.findIndex((z) => z.id === zoneId);
