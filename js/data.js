// ============================================================
//  data.js — 所有行程項目的靜態定義
//  amount: 預設金額（以 defaultCur 為單位）
//  cur:    'TWD' | 'JPY'（顯示時統一換算成台幣，匯率 1:5）
//  who:    'both' | 'wewei' | 'lingling'
// ============================================================

const JPY_TO_TWD = 0.2; // 1 JPY = 0.2 TWD（即 5 JPY = 1 TWD）

const WHO_LABELS = {
  both:     '兩人',
  wewei:    '為為',
  lingling: '翎翎',
};

const WHO_COLORS = {
  both:     null,           // 不顯示 badge（兩人為預設）
  wewei:    '#e67e22',
  lingling: '#8e44ad',
};

const CATEGORIES = ['交通', '住宿', '景點', '餐飲', '購物', '伴手禮'];

const DAYS = [
  { id: 'day1', label: 'Day 1', date: '4/29', title: '有馬溫泉', sub: '台灣出發 → 關西機場 → 有馬溫泉' },
  { id: 'day2', label: 'Day 2', date: '4/30', title: '姬路',     sub: '有馬溫泉 → 姬路城 → 姬路住宿' },
  { id: 'day3', label: 'Day 3', date: '5/1',  title: '大阪',     sub: '姬路 → 大阪 難波・心齋橋' },
  { id: 'day4', label: 'Day 4', date: '5/2',  title: '奈良',     sub: '東大寺・若草山・宇治' },
  { id: 'day5', label: 'Day 5', date: '5/3',  title: '京都',     sub: '京とれいん → 下鴨神社・鴨川' },
  { id: 'day6', label: 'Day 6', date: '5/4',  title: '大阪',     sub: '勝尾寺・梅田' },
  { id: 'day7', label: 'Day 7', date: '5/5',  title: '返台',     sub: '難波 → 關西機場 → 台灣' },
];

const ITEMS = [
  // ── Day 1: 4/29 有馬溫泉 ───────────────────────────────────
  {
    id: 'item-0', day: 'day1', cat: '交通', section: '交通',
    name: '台灣飛大阪',
    sub: '桃園第一航廈 08:30 → 關西機場 12:15',
    time: '08:30',
    amount: 22896, cur: 'TWD', who: 'both',
    notes: '桃園機場第一航廈 08:30 → 關西機場第一航廈 12:15',
    links: [],
  },
  {
    id: 'item-1', day: 'day1', cat: '交通', section: '交通',
    name: '關西機場 → 有馬溫泉',
    sub: '搭兩段巴士',
    time: '13:00',
    amount: 600, cur: 'TWD', who: 'both',
    notes: '搭兩段巴士前往有馬溫泉',
    links: [],
  },
  {
    id: 'item-2', day: 'day1', cat: '住宿', section: '住宿',
    name: 'ARIMA ROYAL HOTEL',
    sub: '神戶牛 & 淡路牛懷石料理方案',
    time: '16:00 入住',
    amount: 9816, cur: 'TWD', who: 'both',
    notes: '【神戶牛 & 淡路牛邊吃邊比較☆ 創意懷石料理方案】',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/KS26EwdgErqLGTqM6' }],
  },

  // ── Day 2: 4/30 姬路 ──────────────────────────────────────
  {
    id: 'item-3', day: 'day2', cat: '交通', section: '交通 / 準備',
    name: '水道卡',
    sub: '神戶市交通 IC 卡',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [
      { label: '官方連結', url: 'https://www.gk-p.jp/mhcard/?pref=28#mhcard_result' },
      { label: 'Google Maps', url: 'https://maps.app.goo.gl/x3npKNUuWw1dnVxd8' },
    ],
  },
  {
    id: 'item-4', day: 'day2', cat: '交通', section: '交通 / 準備',
    name: '有馬溫泉 → 姬路',
    sub: '前往姬路',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '從有馬溫泉前往姬路',
    links: [],
  },
  {
    id: 'item-5', day: 'day2', cat: '景點', section: '景點',
    name: '姬路城 & 好古園',
    sub: '世界遺產白鷺城',
    amount: 523, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/rEajh8JjPmAM6f7H8' }],
  },
  {
    id: 'item-6', day: 'day2', cat: '餐飲', section: '餐飲',
    name: '姫路フェスタ',
    sub: '姬路餐廳',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/i26TofJFcw16eJQA6' }],
  },
  {
    id: 'item-7', day: 'day2', cat: '住宿', section: '住宿',
    name: '東橫 inn 姬路站新幹線北口',
    sub: '姬路住宿',
    amount: 2064, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/1DShaDNGwkYGxVpN6' }],
  },

  // ── Day 3: 5/1 大阪 ───────────────────────────────────────
  {
    id: 'item-8', day: 'day3', cat: '餐飲', section: '餐飲',
    name: 'だるまや 一成',
    sub: '姬路→大阪途中餐廳',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/DGqeDjnuwxwds9u1A' }],
  },
  {
    id: 'item-9', day: 'day3', cat: '住宿', section: '住宿 Check-in',
    name: '東橫 INN 淀屋橋站南',
    sub: '大阪住宿 5/1–5/5（4晚）',
    amount: 9631, cur: 'TWD', who: 'both',
    notes: '5/1 → 5/5，共4晚',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/Lt23QBXrah4gjUPCA' }],
  },
  {
    id: 'item-10', day: 'day3', cat: '購物', section: '購物',
    name: '難波',
    sub: '難波購物逛街',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '難波購物',
    links: [],
  },
  {
    id: 'item-11', day: 'day3', cat: '購物', section: '購物',
    name: '心齋橋',
    sub: '大阪主要購物商圈',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/UyRAY4RmDWM6EyeG8' }],
  },
  {
    id: 'item-12', day: 'day3', cat: '餐飲', section: '餐飲',
    name: '吉次牛舌',
    sub: '牛舌專門店',
    amount: 800, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/ksumxKCnSAmLGrCi9' }],
  },

  // ── Day 4: 5/2 奈良 ───────────────────────────────────────
  {
    id: 'item-13', day: 'day4', cat: '交通', section: '交通',
    name: '淀屋橋 → 奈良',
    sub: '前往奈良',
    amount: 175, cur: 'TWD', who: 'both',
    notes: '淀屋橋出發前往奈良',
    links: [],
  },
  {
    id: 'item-14', day: 'day4', cat: '餐飲', section: '餐飲',
    name: '出雲そば だんだん',
    sub: '出雲蕎麥麵',
    amount: 400, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/4ffaSDUhHN6v79te7' }],
  },
  {
    id: 'item-15', day: 'day4', cat: '景點', section: '景點',
    name: '東大寺',
    sub: '世界最大木造建築',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/66pfapiGhyYCALrXA' }],
  },
  {
    id: 'item-16', day: 'day4', cat: '景點', section: '景點',
    name: '若草山',
    sub: '鹿群丘陵',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/DfnsQwLRFfchS7VC9' }],
  },
  {
    id: 'item-17', day: 'day4', cat: '景點', section: '景點',
    name: '宇治',
    sub: '抹茶聖地',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '宇治 — 抹茶名產地',
    links: [],
  },
  {
    id: 'item-18', day: 'day4', cat: '餐飲', section: '晚餐',
    name: 'しゃぶ笑 黒門日本橋店',
    sub: '涮涮鍋',
    time: '19:30',
    amount: 900, cur: 'TWD', who: 'both',
    notes: '訂位時間：19:30',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/zDUviGeExYGYFm86A' }],
  },

  // ── Day 5: 5/3 京都 ───────────────────────────────────────
  {
    id: 'item-19', day: 'day5', cat: '交通', section: '交通',
    name: '大阪梅田 → 京都河原町',
    sub: '京とれいん雅洛（阪急觀光列車）',
    time: '09:32',
    amount: 80, cur: 'TWD', who: 'both',
    notes: '阪急電鐵觀光列車「京とれいん 雅洛」09:32 出發',
    links: [],
  },
  {
    id: 'item-20', day: 'day5', cat: '交通', section: '交通',
    name: '淀屋橋 → 下鴨神社',
    sub: '備用路線',
    backup: true,
    amount: 111, cur: 'TWD', who: 'both',
    notes: '備用路線：淀屋橋直接前往下鴨神社',
    links: [],
  },
  {
    id: 'item-21', day: 'day5', cat: '景點', section: '景點',
    name: '下鴨神社',
    sub: '京都世界遺產神社',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/yybaS1xtdD4Amn2P6' }],
  },
  {
    id: 'item-22', day: 'day5', cat: '景點', section: '景點',
    name: '鴨川',
    sub: '京都代表河川',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/8Uiky7ayD8PRE45P6' }],
  },
  {
    id: 'item-23', day: 'day5', cat: '餐飲', section: '餐飲',
    name: '宮川豚衛門',
    sub: '京都豬肉料理',
    amount: 800, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/CpX4nH6qdgVM6SaE7' }],
  },

  // ── Day 6: 5/4 大阪 ───────────────────────────────────────
  {
    id: 'item-24', day: 'day6', cat: '交通', section: '交通',
    name: '淀屋橋 → 勝尾寺',
    sub: '前往勝尾寺',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '淀屋橋出發前往勝尾寺',
    links: [],
  },
  {
    id: 'item-25', day: 'day6', cat: '景點', section: '景點',
    name: '勝尾寺',
    sub: '勝運祈願・達摩不倒翁',
    amount: 100, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/nuWgzeJpHEiWR5sU9' }],
  },
  {
    id: 'item-26', day: 'day6', cat: '購物', section: '購物 / 觀光',
    name: '梅田',
    sub: '大阪最大鬧區',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '梅田逛街購物',
    links: [],
  },
  {
    id: 'item-27', day: 'day6', cat: '餐飲', section: '晚餐',
    name: '燒肉力丸',
    sub: '大阪燒肉',
    amount: 1000, cur: 'TWD', who: 'both',
    notes: '',
    links: [{ label: 'Google Maps', url: 'https://maps.app.goo.gl/22kU8oacAjQF4hs56' }],
  },

  // ── Day 7: 5/5 返台 ───────────────────────────────────────
  {
    id: 'item-28', day: 'day7', cat: '交通', section: '交通',
    name: '難波 → 關西機場',
    sub: '前往機場',
    amount: 312, cur: 'TWD', who: 'both',
    notes: '難波前往關西機場，建議提早出發',
    links: [],
  },
  {
    id: 'item-29', day: 'day7', cat: '交通', section: '交通',
    name: '大阪飛台灣',
    sub: '關西機場 15:10 → 桃園 17:05',
    time: '15:10',
    amount: 0, cur: 'TWD', who: 'both',
    notes: '關西機場 15:10 → 台灣桃園 17:05\n緊急聯絡：09059420051',
    links: [],
  },
];

// 幣別換算：統一輸出台幣
function toTWD(amount, cur) {
  if (!amount) return 0;
  return cur === 'JPY' ? Math.round(amount * JPY_TO_TWD) : amount;
}
