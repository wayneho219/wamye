// ============================================================
//  render.js — DOM 渲染、分頁、金額/誰付、新增、編輯 Modal
// ============================================================

const CAT_COLORS = {
  '交通': 'tag-transport',
  '住宿': 'tag-hotel',
  '景點': 'tag-sight',
  '餐飲': 'tag-food',
  '購物': 'tag-shop',
  '伴手禮': 'tag-souvenir',
};

// ── 拖拉排序狀態 ──────────────────────────────────────────────
let _dragSrcId       = null;
let _dragOverId      = null;
let _dragBefore      = true;
let _isTouchDragging = false;

// ── 分頁切換 ──────────────────────────────────────────────────
let _currentTab = 'overview';

function showTab(tabId) {
  _currentTab = tabId;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('visible'));
  document.getElementById('view-' + tabId).classList.add('visible');
  window.scrollTo(0, 0);

  const tabs   = document.querySelectorAll('.tab-btn');
  const tabIds = ['overview','day1','day2','day3','day4','day5','day6','day7'];
  tabs.forEach((t, i) => t.classList.toggle('active', tabIds[i] === tabId));
  renderStats();
}

// ── 金額讀取 ─────────────────────────────────────────────────
function resolvedAmount(item) {
  const override = State.getAmount(item.id);
  if (override) return override;
  return { raw: item.amount, cur: item.cur, who: item.who || 'both' };
}

function twdValue(item) {
  const { raw, cur } = resolvedAmount(item);
  return toTWD(raw, cur);
}

function resolvedCat(item) {
  const edit = State.getEdit(item.id);
  return edit.catOverride || item.cat;
}

function formatTWD(n) {
  if (!n) return null;
  return 'NT$' + n.toLocaleString();
}

// ── Who badge ─────────────────────────────────────────────────
function whoHTML(who) {
  if (!who || who === 'both') return '';
  return `<span class="who-badge" style="background:${WHO_COLORS[who]}">${WHO_LABELS[who]}</span>`;
}

function payLabelHTML(id) {
  const paidBy = State.getPaidBy(id);
  if (!paidBy) return '';
  const parts = [];
  if (paidBy.wewei?.raw)    parts.push(`為為 ${formatTWD(toTWD(paidBy.wewei.raw,    paidBy.wewei.cur))}`);
  if (paidBy.lingling?.raw) parts.push(`翎翎 ${formatTWD(toTWD(paidBy.lingling.raw, paidBy.lingling.cur))}`);
  if (!parts.length) return '';
  return `<div class="pay-label">💳 ${parts.join(' ／ ')}</div>`;
}

// ── 渲染單一卡片 ───────────────────────────────────────────────
function renderItemCard(item) {
  const { raw, cur, who } = resolvedAmount(item);
  const twd      = toTWD(raw, cur);
  const isDone   = State.isDone(item.id);
  const skipped  = State.isSkipped(item.id);
  const edit     = State.getEdit(item.id);
  const cat      = resolvedCat(item);

  // 金額按鈕
  const amountHTML = raw
    ? `<button class="amount-btn${cur==='JPY'?' is-jpy':''}" data-id="${item.id}">
        <span class="amt-twd">${formatTWD(twd)}</span>
        ${cur==='JPY'?`<span class="amt-hint">¥${raw.toLocaleString()}</span>`:''}
       </button>`
    : `<button class="amount-btn empty" data-id="${item.id}">＋ 金額</button>`;

  const timeHTML    = item.time ? `<span class="time-badge">${item.time}</span>` : '';
  const backupBadge = item.backup ? `<span class="backup-label">備案</span>` : '';
  const skipBadge   = skipped ? `<span class="skip-badge">不去了</span>` : '';
  const deleteBtn   = item.custom
    ? `<button class="delete-btn" data-delete="${item.id}" aria-label="刪除">✕</button>`
    : '';
  const payBtn = `<button class="pay-btn" data-pay="${item.id}" aria-label="記錄付款">💳</button>`;
  const pLabel  = payLabelHTML(item.id);

  // 展開詳情區：原始連結 + 心得 + 照片
  const origNotes = item.notes ? `<p class="orig-notes">${item.notes.replace(/\n/g,'<br>')}</p>` : '';
  const linksHTML = item.links?.length
    ? `<div class="detail-links">${item.links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener">${l.label==='Google Maps'?'📍':'🔗'} ${l.label}</a>`
      ).join('')}</div>`
    : '';

  // 使用者心得
  const userNotes = edit.notes
    ? `<div class="user-notes"><span class="user-notes-label">心得</span>${edit.notes.replace(/\n/g,'<br>')}</div>`
    : '';

  // 照片縮圖
  const photosHTML = edit.photos?.length
    ? `<div class="photo-grid detail-photos">${edit.photos.map((src, i) =>
        `<button class="photo-thumb" data-viewer="${item.id}" data-idx="${i}"
                 style="background-image:url('${src}')"></button>`
      ).join('')}</div>`
    : '';

  return `
<div class="item-card${isDone?' done':''}${skipped?' skipped':''}${item.backup?' backup':''}${item.custom?' custom':''}"
     id="card-${item.id}" draggable="true" data-drag-id="${item.id}">
  <div class="item-main" data-id="${item.id}">
    <button class="item-check" data-check="${item.id}" aria-label="標記完成">
      ${isDone ? checkIcon() : ''}
    </button>
    <div class="item-body">
      <div class="item-name">${backupBadge}${skipBadge}${item.name}${whoHTML(who)}</div>
      ${item.sub ? `<div class="item-sub">${item.sub}</div>` : ''}
      <div class="item-meta">
        <span class="tag ${CAT_COLORS[cat]||''}">${cat}</span>
        ${timeHTML}
      </div>
    </div>
    <div class="item-right">
      ${amountHTML}
      ${payBtn}
    </div>
    ${deleteBtn}
  </div>
  <div class="item-detail" id="detail-${item.id}">
    ${origNotes}${linksHTML}${userNotes}${photosHTML}${pLabel}
    <button class="edit-item-btn" data-edit="${item.id}">✏ 編輯此項目</button>
  </div>
</div>`;
}

function checkIcon() {
  return `<svg width="12" height="10" viewBox="0 0 12 10" fill="none">
    <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// ── 取得某天所有項目 ──────────────────────────────────────────
function getAllDayItems(dayId) {
  return [
    ...ITEMS.filter(i => i.day === dayId),
    ...State.getCustomItems().filter(i => i.day === dayId),
  ];
}

// ── 渲染行程日 ────────────────────────────────────────────────
function renderDayView(dayId) {
  const container = document.getElementById('view-' + dayId);
  if (!container) return;

  let items      = getAllDayItems(dayId);
  const order    = State.getOrder(dayId);

  if (order.length) {
    // 依儲存順序排列，未知 id 排到最後
    items = [...items].sort((a, b) => {
      const ai = order.indexOf(a.id), bi = order.indexOf(b.id);
      return (ai < 0 ? 9999 : ai) - (bi < 0 ? 9999 : bi);
    });
  } else {
    // 預設：依 section 分組
    const secOrder = [], secMap = new Map();
    items.forEach(i => {
      const s = i.section || i.cat;
      if (!secMap.has(s)) { secMap.set(s, []); secOrder.push(s); }
      secMap.get(s).push(i);
    });
    items = secOrder.flatMap(s => secMap.get(s));
  }

  let lastSec = null;
  container.innerHTML = items.map(item => {
    const sec = item.section || item.cat;
    const lbl = sec !== lastSec ? `<div class="section-label">${sec}</div>` : '';
    lastSec   = sec;
    return lbl + renderItemCard(item);
  }).join('') + `<button class="add-item-btn" data-day="${dayId}">＋ 新增項目</button>`;
}

function renderAllDays() { DAYS.forEach(d => renderDayView(d.id)); }

// ── 重新渲染單一卡片 ──────────────────────────────────────────
function rerenderCard(itemId) {
  const item = ITEMS.find(i => i.id === itemId)
            || State.getCustomItems().find(i => i.id === itemId);
  if (!item) return;
  const el = document.getElementById('card-' + itemId);
  if (!el) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = renderItemCard(item);
  el.replaceWith(tmp.firstElementChild);
}

// ── 事件委派 ─────────────────────────────────────────────────
function bindDayViewEvents(container) {
  initDragSort(container);
  container.addEventListener('click', e => {
    // 勾選完成
    const checkBtn = e.target.closest('[data-check]');
    if (checkBtn) {
      e.stopPropagation();
      State.toggleDone(checkBtn.dataset.check);
      rerenderCard(checkBtn.dataset.check);
      renderStats();
      return;
    }
    // 刪除自訂項目
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
      e.stopPropagation();
      if (confirm('確定刪除這個項目？')) {
        const dayId = deleteBtn.closest('.day-view')?.id.replace('view-','');
        State.deleteCustomItem(deleteBtn.dataset.delete);
        renderDayView(dayId);
        renderStats();
      }
      return;
    }
    // 金額編輯
    const amtBtn = e.target.closest('.amount-btn');
    if (amtBtn) { e.stopPropagation(); openAmountModal(amtBtn.dataset.id); return; }
    // 付款記錄
    const payBtn = e.target.closest('[data-pay]');
    if (payBtn) { e.stopPropagation(); openPayModal(payBtn.dataset.pay); return; }
    // 新增項目
    const addBtn = e.target.closest('.add-item-btn');
    if (addBtn) { e.stopPropagation(); openAddItemModal(addBtn.dataset.day); return; }
    // 編輯此項目
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) { e.stopPropagation(); openEditModal(editBtn.dataset.edit); return; }
    // 照片預覽
    const thumb = e.target.closest('[data-viewer]');
    if (thumb) {
      e.stopPropagation();
      const edit = State.getEdit(thumb.dataset.viewer);
      openPhotoViewer(edit.photos, parseInt(thumb.dataset.idx));
      return;
    }
    // 展開詳情
    const mainRow = e.target.closest('.item-main[data-id]');
    if (mainRow) {
      document.getElementById('detail-' + mainRow.dataset.id)?.classList.toggle('open');
    }
  });
}

// ── 統計 ─────────────────────────────────────────────────────
function renderStats() {
  const allItems  = [...ITEMS, ...State.getCustomItems()];
  // 不計入：備案 & 標記不去了
  const countable = allItems.filter(i => !i.backup && !State.isSkipped(i.id));

  const total = allItems.length;
  const done  = allItems.filter(i => State.isDone(i.id)).length;
  const pct   = total ? Math.round(done / total * 100) : 0;

  document.getElementById('globalProgress').style.width = pct + '%';

  const cats = CATEGORIES;
  const byCategory = Object.fromEntries(cats.map(c => [c, 0]));
  let grand = 0, weiwei = 0, lingling = 0, both = 0;

  countable.forEach(i => {
    const twd = twdValue(i);
    if (!twd) return;
    const cat = resolvedCat(i);
    const { who } = resolvedAmount(i);
    byCategory[cat] = (byCategory[cat] || 0) + twd;
    grand += twd;
    if (who === 'wewei') weiwei += twd;
    else if (who === 'lingling') lingling += twd;
    else both += twd;
  });

  cats.forEach(c => {
    const el = document.getElementById('b-' + c);
    if (el) el.textContent = byCategory[c] ? formatTWD(byCategory[c]) : '—';
  });
  setText('b-total',    grand    ? formatTWD(grand)    : '—');
  setText('b-both',     both     ? formatTWD(both)     : '—');
  setText('b-wewei',    weiwei   ? formatTWD(weiwei)   : '—');
  setText('b-lingling', lingling ? formatTWD(lingling) : '—');
  setText('stat-total', grand ? formatTWD(grand) : '—');
  setText('stat-done',  pct + '%');
  setText('stat-items', total);

  const fp = document.getElementById('floatProgress');
  if (fp) {
    fp.textContent = `${done} / ${total} 完成`;
    fp.classList.toggle('visible', _currentTab !== 'overview');
  }
  renderDaySummaryAmounts();
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function renderDaySummaryAmounts() {
  const customItems = State.getCustomItems();
  DAYS.forEach(d => {
    const el = document.getElementById('day-amt-' + d.id);
    if (!el) return;
    const total = [...ITEMS.filter(i => i.day === d.id && !i.backup && !State.isSkipped(i.id)),
                   ...customItems.filter(i => i.day === d.id && !State.isSkipped(i.id))]
      .reduce((s, i) => s + twdValue(i), 0);
    el.textContent = total ? formatTWD(total) : '';
  });
}

function renderNotes() {
  const el = document.getElementById('globalNotes');
  if (el) el.value = State.getNotes();
}

// ════════════════════════════════════════════════════════════
//  金額 + 誰付 Modal
// ════════════════════════════════════════════════════════════
let _editingId = null;

function openAmountModal(itemId) {
  _editingId = itemId;
  const item = ITEMS.find(i => i.id === itemId) || State.getCustomItems().find(i => i.id === itemId);
  if (!item) return;
  const { raw, cur, who } = resolvedAmount(item);
  document.getElementById('modal-item-name').textContent = item.name;
  document.getElementById('modal-input').value = raw || '';
  setModalCurrency(cur || 'TWD');
  setModalWho(who || 'both');
  updateConversionHint();
  document.getElementById('amountModal').classList.add('open');
  document.getElementById('modal-input').focus();
}

function closeAmountModal() { document.getElementById('amountModal').classList.remove('open'); _editingId = null; }

function setModalCurrency(cur) {
  document.getElementById('btn-twd').classList.toggle('active', cur === 'TWD');
  document.getElementById('btn-jpy').classList.toggle('active', cur === 'JPY');
  document.getElementById('modal-input').dataset.cur = cur;
  document.getElementById('modal-cur-prefix').textContent = cur === 'JPY' ? '¥' : 'NT$';
  updateConversionHint();
}

function getModalCurrency() { return document.getElementById('modal-input').dataset.cur || 'TWD'; }

function setModalWho(who) {
  ['both','wewei','lingling'].forEach(w =>
    document.getElementById('who-' + w)?.classList.toggle('active', w === who));
}

function getModalWho() { return document.querySelector('.who-btn.active')?.dataset.who || 'both'; }

function updateConversionHint() {
  const hint = document.getElementById('modal-hint');
  if (!hint) return;
  const cur = getModalCurrency();
  const raw = parseFloat(document.getElementById('modal-input').value) || 0;
  if (cur === 'JPY' && raw > 0) {
    hint.textContent = `¥${raw.toLocaleString()} → NT$${Math.round(raw * JPY_TO_TWD).toLocaleString()}（匯率 5:1）`;
    hint.style.display = 'block';
  } else { hint.style.display = 'none'; }
}

function saveAmountModal() {
  const raw = parseFloat(document.getElementById('modal-input').value);
  const cur = getModalCurrency();
  const who = getModalWho();
  if (!isNaN(raw) && raw >= 0) {
    State.setAmount(_editingId, raw, cur, who);
    rerenderCard(_editingId);
    renderStats();
  }
  closeAmountModal();
}

// ════════════════════════════════════════════════════════════
//  新增項目 Modal
// ════════════════════════════════════════════════════════════
let _addingDay = null;

function openAddItemModal(dayId) {
  _addingDay = dayId;
  const day = DAYS.find(d => d.id === dayId);
  document.getElementById('add-modal-day-label').textContent =
    day ? `${day.label}（${day.date} ${day.title}）` : '';
  document.getElementById('add-name').value   = '';
  document.getElementById('add-sub').value    = '';
  document.getElementById('add-notes').value  = '';
  document.getElementById('add-amount').value = '';
  setAddCurrency('TWD');
  setAddWho('both');
  document.getElementById('add-cat').value = '餐飲';
  document.getElementById('add-hint').style.display = 'none';
  document.getElementById('addItemModal').classList.add('open');
  document.getElementById('add-name').focus();
}

function closeAddItemModal() { document.getElementById('addItemModal').classList.remove('open'); _addingDay = null; }

function setAddCurrency(cur) {
  document.getElementById('add-btn-twd').classList.toggle('active', cur === 'TWD');
  document.getElementById('add-btn-jpy').classList.toggle('active', cur === 'JPY');
  document.getElementById('add-amount').dataset.cur = cur;
  document.getElementById('add-cur-prefix').textContent = cur === 'JPY' ? '¥' : 'NT$';
  updateAddHint();
}

function getAddCurrency() { return document.getElementById('add-amount').dataset.cur || 'TWD'; }

function setAddWho(who) {
  ['both','wewei','lingling'].forEach(w =>
    document.getElementById('add-who-' + w)?.classList.toggle('active', w === who));
}

function getAddWho() { return document.querySelector('.add-who-btn.active')?.dataset.who || 'both'; }

function updateAddHint() {
  const hint = document.getElementById('add-hint');
  if (!hint) return;
  const cur = getAddCurrency();
  const raw = parseFloat(document.getElementById('add-amount').value) || 0;
  if (cur === 'JPY' && raw > 0) {
    hint.textContent = `¥${raw.toLocaleString()} → NT$${Math.round(raw * JPY_TO_TWD).toLocaleString()}（匯率 5:1）`;
    hint.style.display = 'block';
  } else { hint.style.display = 'none'; }
}

function saveAddItem() {
  const name = document.getElementById('add-name').value.trim();
  if (!name) { document.getElementById('add-name').focus(); return; }
  State.addCustomItem({
    day: _addingDay, cat: document.getElementById('add-cat').value,
    section: document.getElementById('add-cat').value,
    name, sub: document.getElementById('add-sub').value.trim(),
    notes: document.getElementById('add-notes').value.trim(),
    amount: parseFloat(document.getElementById('add-amount').value) || 0,
    cur: getAddCurrency(), who: getAddWho(), links: [],
  });
  renderDayView(_addingDay);
  renderStats();
  closeAddItemModal();
}

// ════════════════════════════════════════════════════════════
//  編輯項目 Modal
// ════════════════════════════════════════════════════════════
let _editModalId  = null;
let _editPhotos   = [];   // 正在編輯中的照片陣列（base64）

function openEditModal(itemId) {
  _editModalId = itemId;
  const staticItem = ITEMS.find(i => i.id === itemId);
  const customItem = State.getCustomItems().find(i => i.id === itemId);
  const item = staticItem || customItem;
  if (!item) return;

  const edit = State.getEdit(itemId);
  _editPhotos = [...(edit.photos || [])];

  // 標題
  document.getElementById('edit-modal-title').textContent = item.name;

  // 自訂項目才顯示名稱/說明欄位
  const isCustom = !!item.custom;
  document.getElementById('edit-name-wrap').style.display = isCustom ? 'block' : 'none';
  document.getElementById('edit-sub-wrap').style.display  = isCustom ? 'block' : 'none';
  if (isCustom) {
    document.getElementById('edit-name').value = item.name || '';
    document.getElementById('edit-sub').value  = item.sub  || '';
  }

  // 類別選擇器
  const currentCat = edit.catOverride || item.cat;
  renderEditCatToggle(currentCat);

  // 心得
  document.getElementById('edit-notes').value = edit.notes || '';

  // 照片
  renderEditPhotoGrid();

  // 不去了
  renderSkipBtn(edit.skipped);

  document.getElementById('editModal').classList.add('open');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
  _editModalId = null;
  _editPhotos  = [];
}

function renderEditCatToggle(activeCat) {
  const wrap = document.getElementById('edit-cat-toggle');
  wrap.innerHTML = CATEGORIES.map(c => `
    <button class="cat-btn${c === activeCat ? ' active' : ''}" data-cat="${c}">${c}</button>
  `).join('');
  wrap.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function getEditCat() {
  return document.querySelector('#edit-cat-toggle .cat-btn.active')?.dataset.cat || null;
}

function renderSkipBtn(skipped) {
  const btn = document.getElementById('edit-skip-btn');
  if (!btn) return;
  if (skipped) {
    btn.textContent  = '✓ 已標記為「不去了」（點擊取消）';
    btn.classList.add('skip-active');
  } else {
    btn.textContent  = '標記為「不去了」';
    btn.classList.remove('skip-active');
  }
}

function toggleSkipBtn() {
  const btn  = document.getElementById('edit-skip-btn');
  const next = !btn.classList.contains('skip-active');
  renderSkipBtn(next);
}

// ── 照片處理 ─────────────────────────────────────────────────
function renderEditPhotoGrid() {
  const grid = document.getElementById('edit-photo-grid');
  if (!grid) return;
  grid.innerHTML = _editPhotos.map((src, i) => `
    <div class="photo-thumb-wrap">
      <button class="photo-thumb" style="background-image:url('${src}')"
              onclick="openPhotoViewer(_editPhotos, ${i})"></button>
      <button class="photo-remove" onclick="removeEditPhoto(${i})">✕</button>
    </div>
  `).join('');
}

function removeEditPhoto(idx) {
  _editPhotos.splice(idx, 1);
  renderEditPhotoGrid();
}

function handlePhotoInput(input) {
  const files = Array.from(input.files);
  const remaining = 5 - _editPhotos.length;
  files.slice(0, remaining).forEach(file => {
    resizeImage(file, 900, 0.72, base64 => {
      _editPhotos.push(base64);
      renderEditPhotoGrid();
    });
  });
  input.value = '';
}

function resizeImage(file, maxDim, quality, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveEditModal() {
  if (!_editModalId) return;
  const staticItem = ITEMS.find(i => i.id === _editModalId);
  const customItem = State.getCustomItems().find(i => i.id === _editModalId);
  const item = staticItem || customItem;

  const cat     = getEditCat();
  const notes   = document.getElementById('edit-notes').value.trim();
  const skipped = document.getElementById('edit-skip-btn').classList.contains('skip-active');

  // 儲存通用編輯（心得、照片、不去了、類別覆寫）
  State.setEdit(_editModalId, {
    notes,
    photos:      _editPhotos,
    skipped,
    catOverride: cat !== item.cat ? cat : null,
  });

  // 自訂項目額外更新名稱/說明/類別
  if (item.custom) {
    const name = document.getElementById('edit-name').value.trim();
    const sub  = document.getElementById('edit-sub').value.trim();
    State.updateCustomItem(_editModalId, {
      name: name || item.name,
      sub:  sub  || item.sub,
      cat,
      section: cat,
    });
  }

  rerenderCard(_editModalId);
  renderStats();
  closeEditModal();
}

// ── 照片全螢幕 ────────────────────────────────────────────────
let _viewerPhotos = [];
let _viewerIdx    = 0;

function openPhotoViewer(photos, idx) {
  _viewerPhotos = photos;
  _viewerIdx    = idx;
  const overlay = document.getElementById('photoViewer');
  overlay.style.display = 'flex';
  document.getElementById('photoViewerImg').src = photos[idx];
  document.getElementById('viewer-counter').textContent =
    photos.length > 1 ? `${idx + 1} / ${photos.length}` : '';
}

function closePhotoViewer() {
  document.getElementById('photoViewer').style.display = 'none';
}

function viewerPrev() {
  if (_viewerIdx > 0) openPhotoViewer(_viewerPhotos, _viewerIdx - 1);
}

function viewerNext() {
  if (_viewerIdx < _viewerPhotos.length - 1) openPhotoViewer(_viewerPhotos, _viewerIdx + 1);
}

// ════════════════════════════════════════════════════════════
//  拖拉排序
// ════════════════════════════════════════════════════════════
function _applyDragOrder(dayId) {
  if (!_dragSrcId || !_dragOverId || _dragSrcId === _dragOverId) return;
  const items   = getAllDayItems(dayId);
  const ids     = items.map(i => i.id);
  const fromIdx = ids.indexOf(_dragSrcId);
  if (fromIdx < 0) return;
  ids.splice(fromIdx, 1);
  const newToIdx = ids.indexOf(_dragOverId);
  if (newToIdx < 0) return;
  const insertAt = _dragBefore ? newToIdx : newToIdx + 1;
  ids.splice(insertAt, 0, _dragSrcId);
  State.setOrder(dayId, ids);
  renderDayView(dayId);
}

function _showDragPlaceholder(clientY, container) {
  container.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
  const cards = [...container.querySelectorAll('.item-card[data-drag-id]:not(.dragging)')];
  if (!cards.length) return;
  let target = cards[cards.length - 1];
  let before = false;
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    if (clientY < r.top + r.height / 2) { target = c; before = true; break; }
  }
  _dragOverId = target.dataset.dragId;
  _dragBefore = before;
  const ph = document.createElement('div');
  ph.className = 'drag-placeholder';
  before ? target.before(ph) : target.after(ph);
}

// ── Desktop HTML5 drag ────────────────────────────────────────
function _initDragDesktop(container) {
  container.addEventListener('dragstart', e => {
    const card = e.target.closest('.item-card[data-drag-id]');
    if (!card) return;
    _dragSrcId = card.dataset.dragId;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', _dragSrcId);
  });

  container.addEventListener('dragend', () => {
    container.querySelectorAll('.dragging').forEach(c => c.classList.remove('dragging'));
    container.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    const card = e.target.closest('.item-card[data-drag-id]');
    if (!card || card.dataset.dragId === _dragSrcId) return;
    _showDragPlaceholder(e.clientY, container);
  });

  container.addEventListener('drop', e => {
    e.preventDefault();
    container.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
    _applyDragOrder(container.id.replace('view-', ''));
    _dragSrcId = null; _dragOverId = null;
  });
}

// ── Touch (long press) drag ───────────────────────────────────
function _initDragTouch(container) {
  let timer  = null;
  let isDrag = false;
  let startX = 0, startY = 0;

  container.addEventListener('touchstart', e => {
    const card = e.target.closest('.item-card[data-drag-id]');
    if (!card) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    timer = setTimeout(() => {
      isDrag = true;
      _isTouchDragging = true;
      _dragSrcId = card.dataset.dragId;
      card.classList.add('dragging');
      navigator.vibrate?.(25);
    }, 400);
  }, { passive: true });

  container.addEventListener('touchmove', e => {
    if (!isDrag) {
      // 手指移動太多就取消長按計時器（認定是滑動）
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (Math.hypot(dx, dy) > 10) { clearTimeout(timer); timer = null; }
      return;
    }
    e.preventDefault();
    _showDragPlaceholder(e.touches[0].clientY, container);
  }, { passive: false });

  const endTouch = () => {
    clearTimeout(timer); timer = null;
    container.querySelectorAll('.drag-placeholder').forEach(p => p.remove());
    if (isDrag) {
      _applyDragOrder(container.id.replace('view-', ''));
      container.querySelectorAll('.dragging').forEach(c => c.classList.remove('dragging'));
    }
    isDrag = false;
    // 稍後才清除，讓 swipe 偵測可以排除拖拉尾端的 touchend
    setTimeout(() => { _isTouchDragging = false; }, 100);
    _dragSrcId = null; _dragOverId = null;
  };

  container.addEventListener('touchend',    endTouch, { passive: true });
  container.addEventListener('touchcancel', endTouch, { passive: true });
}

function initDragSort(container) {
  _initDragDesktop(container);
  _initDragTouch(container);
}

// ════════════════════════════════════════════════════════════
//  左右滑動切換行程日
// ════════════════════════════════════════════════════════════
function initSwipe() {
  const DAY_TABS = ['day1','day2','day3','day4','day5','day6','day7'];
  let startX = 0, startY = 0, startT = 0;

  document.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startT = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (_isTouchDragging) return;
    if (document.querySelector('.modal-overlay.open')) return;
    if (document.getElementById('photoViewer')?.style.display !== 'none') return;
    if (_currentTab === 'overview') return;

    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    const dt = Date.now() - startT;

    if (Math.abs(dx) < 50) return;
    if (Math.abs(dy) > Math.abs(dx) * 0.7) return;
    if (dt > 400) return;

    const idx = DAY_TABS.indexOf(_currentTab);
    if (dx < 0 && idx < DAY_TABS.length - 1) showTab(DAY_TABS[idx + 1]);
    if (dx > 0 && idx > 0)                   showTab(DAY_TABS[idx - 1]);
  }, { passive: true });
}
