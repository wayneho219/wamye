// ============================================================
//  render.js — DOM 渲染、分頁切換、金額/誰付編輯、新增項目
// ============================================================

const CAT_COLORS = {
  '交通': 'tag-transport',
  '住宿': 'tag-hotel',
  '景點': 'tag-sight',
  '餐飲': 'tag-food',
  '購物': 'tag-shop',
  '伴手禮': 'tag-souvenir',
};

// ── 分頁切換 ──────────────────────────────────────────────────
let _currentTab = 'overview';

function showTab(tabId) {
  _currentTab = tabId;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('visible'));
  document.getElementById('view-' + tabId).classList.add('visible');
  window.scrollTo(0, 0);

  const tabs = document.querySelectorAll('.tab-btn');
  const tabIds = ['overview', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'];
  tabs.forEach((t, i) => t.classList.toggle('active', tabIds[i] === tabId));

  renderStats();
}

// ── 金額讀取（state 優先，fallback 到 data.js 預設值）────────
function resolvedAmount(item) {
  const override = State.getAmount(item.id);
  if (override) return override;
  return { raw: item.amount, cur: item.cur, who: item.who || 'both' };
}

function twdValue(item) {
  const { raw, cur } = resolvedAmount(item);
  return toTWD(raw, cur);
}

// ── 格式化顯示金額 ────────────────────────────────────────────
function formatTWD(n) {
  if (!n) return null;
  return 'NT$' + n.toLocaleString();
}

// ── Who badge ─────────────────────────────────────────────────
function whoHTML(who) {
  if (!who || who === 'both') return '';
  const color = WHO_COLORS[who];
  const label = WHO_LABELS[who];
  return `<span class="who-badge" style="background:${color}">${label}</span>`;
}

// ── 渲染單一 item card ────────────────────────────────────────
function renderItemCard(item) {
  const { raw, cur, who } = resolvedAmount(item);
  const twd = toTWD(raw, cur);
  const isDone = State.isDone(item.id);

  const amountHTML = raw
    ? `<button class="amount-btn${cur === 'JPY' ? ' is-jpy' : ''}" data-id="${item.id}" aria-label="編輯金額">
        <span class="amt-twd">${formatTWD(twd)}</span>
        ${cur === 'JPY' ? `<span class="amt-hint">¥${raw.toLocaleString()}</span>` : ''}
       </button>`
    : `<button class="amount-btn empty" data-id="${item.id}" aria-label="新增金額">＋ 金額</button>`;

  const timeHTML  = item.time ? `<span class="time-badge">${item.time}</span>` : '';
  const linksHTML = item.links?.length
    ? item.links.map(l =>
        `<a href="${l.url}" target="_blank" rel="noopener">${l.label === 'Google Maps' ? '📍' : '🔗'} ${l.label}</a>`
      ).join('')
    : '';
  const notesHTML  = item.notes ? `<p>${item.notes.replace(/\n/g, '<br>')}</p>` : '';
  const backupBadge = item.backup ? `<span class="backup-label">備案</span>` : '';
  const deleteBtn   = item.custom
    ? `<button class="delete-btn" data-delete="${item.id}" aria-label="刪除">✕</button>`
    : '';

  return `
<div class="item-card${isDone ? ' done' : ''}${item.backup ? ' backup' : ''}${item.custom ? ' custom' : ''}" id="card-${item.id}">
  <div class="item-main" data-id="${item.id}">
    <button class="item-check" data-check="${item.id}" aria-label="標記完成">
      ${isDone ? checkIcon() : ''}
    </button>
    <div class="item-body">
      <div class="item-name">${backupBadge}${item.name}${whoHTML(who)}</div>
      <div class="item-sub">${item.sub || ''}</div>
    </div>
    <div class="item-right">
      ${amountHTML}
      <span class="tag ${CAT_COLORS[item.cat] || ''}">${item.cat}</span>
      ${timeHTML}
    </div>
    ${deleteBtn}
  </div>
  ${notesHTML || linksHTML ? `
  <div class="item-detail" id="detail-${item.id}">
    ${notesHTML}
    ${linksHTML ? `<div class="detail-links">${linksHTML}</div>` : ''}
  </div>` : ''}
</div>`;
}

function checkIcon() {
  return `<svg width="12" height="10" viewBox="0 0 12 10" fill="none">
    <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

// ── 渲染整個行程頁（含自訂項目）─────────────────────────────
function renderDayView(dayId) {
  const container = document.getElementById('view-' + dayId);
  if (!container) return;

  const staticItems = ITEMS.filter(i => i.day === dayId);
  const customItems = State.getCustomItems().filter(i => i.day === dayId);
  const allItems    = [...staticItems, ...customItems];

  // 依 section 分組
  const sectionMap = new Map();
  const sectionOrder = [];
  allItems.forEach(item => {
    const sec = item.section || item.cat;
    if (!sectionMap.has(sec)) { sectionMap.set(sec, []); sectionOrder.push(sec); }
    sectionMap.get(sec).push(item);
  });

  const html = sectionOrder.map(sec => `
    <div class="section-label">${sec}</div>
    ${sectionMap.get(sec).map(renderItemCard).join('')}
  `).join('');

  container.innerHTML = html + `
    <button class="add-item-btn" data-day="${dayId}">＋ 新增項目</button>
  `;
}

function renderAllDays() {
  DAYS.forEach(d => renderDayView(d.id));
}

// ── 重新渲染單一 card ─────────────────────────────────────────
function rerenderCard(itemId) {
  const staticItem = ITEMS.find(i => i.id === itemId);
  const customItem = State.getCustomItems().find(i => i.id === itemId);
  const item = staticItem || customItem;
  if (!item) return;

  const el = document.getElementById('card-' + itemId);
  if (!el) return;

  const tmp = document.createElement('div');
  tmp.innerHTML = renderItemCard(item);
  el.replaceWith(tmp.firstElementChild);
}

// ── 事件綁定（委派）──────────────────────────────────────────
function bindDayViewEvents(container) {
  container.addEventListener('click', e => {
    // 完成勾選
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
        State.deleteCustomItem(deleteBtn.dataset.delete);
        renderDayView(deleteBtn.closest('.day-view')?.id.replace('view-', ''));
        renderStats();
        renderDaySummaryAmounts();
      }
      return;
    }

    // 金額編輯
    const amtBtn = e.target.closest('.amount-btn');
    if (amtBtn) {
      e.stopPropagation();
      openAmountModal(amtBtn.dataset.id);
      return;
    }

    // 新增項目
    const addBtn = e.target.closest('.add-item-btn');
    if (addBtn) {
      e.stopPropagation();
      openAddItemModal(addBtn.dataset.day);
      return;
    }

    // 展開詳情
    const mainRow = e.target.closest('.item-main[data-id]');
    if (mainRow) {
      document.getElementById('detail-' + mainRow.dataset.id)?.classList.toggle('open');
    }
  });
}

// ── 統計數字 ─────────────────────────────────────────────────
function renderStats() {
  const staticItems = ITEMS;
  const customItems = State.getCustomItems();
  const allItems    = [...staticItems, ...customItems];
  const countable   = allItems.filter(i => !i.backup);

  const total = allItems.length;
  const done  = allItems.filter(i => State.isDone(i.id)).length;
  const pct   = total ? Math.round(done / total * 100) : 0;

  document.getElementById('globalProgress').style.width = pct + '%';

  // 分類合計
  const cats = CATEGORIES;
  const byCategory = Object.fromEntries(cats.map(c => [c, 0]));
  let grand = 0, weiwei = 0, lingling = 0, both = 0;

  countable.forEach(i => {
    const twd = twdValue(i);
    if (!twd) return;
    const { who } = resolvedAmount(i);
    byCategory[i.cat] = (byCategory[i.cat] || 0) + twd;
    grand += twd;
    if (who === 'wewei')    weiwei   += twd;
    else if (who === 'lingling') lingling += twd;
    else                    both     += twd;
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

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderDaySummaryAmounts() {
  const customItems = State.getCustomItems();
  DAYS.forEach(d => {
    const el = document.getElementById('day-amt-' + d.id);
    if (!el) return;
    const allDay = [
      ...ITEMS.filter(i => i.day === d.id && !i.backup),
      ...customItems.filter(i => i.day === d.id),
    ];
    const total = allDay.reduce((s, i) => s + twdValue(i), 0);
    el.textContent = total ? formatTWD(total) : '';
  });
}

// ── 備忘記事 ─────────────────────────────────────────────────
function renderNotes() {
  const el = document.getElementById('globalNotes');
  if (el) el.value = State.getNotes();
}

// ── 金額 + 誰付 Modal ────────────────────────────────────────
let _editingId = null;

function openAmountModal(itemId) {
  _editingId = itemId;
  const staticItem = ITEMS.find(i => i.id === itemId);
  const customItem = State.getCustomItems().find(i => i.id === itemId);
  const item = staticItem || customItem;
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

function closeAmountModal() {
  document.getElementById('amountModal').classList.remove('open');
  _editingId = null;
}

function setModalCurrency(cur) {
  document.getElementById('btn-twd').classList.toggle('active', cur === 'TWD');
  document.getElementById('btn-jpy').classList.toggle('active', cur === 'JPY');
  document.getElementById('modal-input').dataset.cur = cur;
  const prefix = document.getElementById('modal-cur-prefix');
  if (prefix) prefix.textContent = cur === 'JPY' ? '¥' : 'NT$';
  updateConversionHint();
}

function getModalCurrency() {
  return document.getElementById('modal-input').dataset.cur || 'TWD';
}

function setModalWho(who) {
  ['both', 'wewei', 'lingling'].forEach(w => {
    document.getElementById('who-' + w)?.classList.toggle('active', w === who);
  });
}

function getModalWho() {
  return document.querySelector('.who-btn.active')?.dataset.who || 'both';
}

function updateConversionHint() {
  const hint = document.getElementById('modal-hint');
  if (!hint) return;
  const cur = getModalCurrency();
  const raw = parseFloat(document.getElementById('modal-input').value) || 0;
  if (cur === 'JPY' && raw > 0) {
    const twd = Math.round(raw * JPY_TO_TWD);
    hint.textContent = `¥${raw.toLocaleString()} → NT$${twd.toLocaleString()}（匯率 5:1）`;
    hint.style.display = 'block';
  } else {
    hint.style.display = 'none';
  }
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

// ── 新增項目 Modal ────────────────────────────────────────────
let _addingDay = null;

function openAddItemModal(dayId) {
  _addingDay = dayId;
  const day = DAYS.find(d => d.id === dayId);

  document.getElementById('add-modal-day-label').textContent =
    day ? `${day.label}（${day.date} ${day.title}）` : '';

  // 重置表單
  document.getElementById('add-name').value = '';
  document.getElementById('add-sub').value  = '';
  document.getElementById('add-notes').value = '';
  document.getElementById('add-amount').value = '';
  setAddCurrency('TWD');
  setAddWho('both');
  document.getElementById('add-cat').value = '餐飲';
  document.getElementById('add-hint').style.display = 'none';

  document.getElementById('addItemModal').classList.add('open');
  document.getElementById('add-name').focus();
}

function closeAddItemModal() {
  document.getElementById('addItemModal').classList.remove('open');
  _addingDay = null;
}

function setAddCurrency(cur) {
  document.getElementById('add-btn-twd').classList.toggle('active', cur === 'TWD');
  document.getElementById('add-btn-jpy').classList.toggle('active', cur === 'JPY');
  document.getElementById('add-amount').dataset.cur = cur;
  document.getElementById('add-cur-prefix').textContent = cur === 'JPY' ? '¥' : 'NT$';
  updateAddHint();
}

function getAddCurrency() {
  return document.getElementById('add-amount').dataset.cur || 'TWD';
}

function setAddWho(who) {
  ['both', 'wewei', 'lingling'].forEach(w => {
    document.getElementById('add-who-' + w)?.classList.toggle('active', w === who);
  });
}

function getAddWho() {
  return document.querySelector('.add-who-btn.active')?.dataset.who || 'both';
}

function updateAddHint() {
  const hint = document.getElementById('add-hint');
  if (!hint) return;
  const cur = getAddCurrency();
  const raw = parseFloat(document.getElementById('add-amount').value) || 0;
  if (cur === 'JPY' && raw > 0) {
    hint.textContent = `¥${raw.toLocaleString()} → NT$${Math.round(raw * JPY_TO_TWD).toLocaleString()}（匯率 5:1）`;
    hint.style.display = 'block';
  } else {
    hint.style.display = 'none';
  }
}

function saveAddItem() {
  const name = document.getElementById('add-name').value.trim();
  if (!name) {
    document.getElementById('add-name').focus();
    return;
  }
  const raw    = parseFloat(document.getElementById('add-amount').value) || 0;
  const cur    = getAddCurrency();
  const who    = getAddWho();
  const cat    = document.getElementById('add-cat').value;
  const sub    = document.getElementById('add-sub').value.trim();
  const notes  = document.getElementById('add-notes').value.trim();

  State.addCustomItem({
    day: _addingDay,
    cat,
    section: cat,
    name,
    sub,
    notes,
    amount: raw,
    cur,
    who,
    links: [],
  });

  renderDayView(_addingDay);
  renderStats();
  closeAddItemModal();
}
