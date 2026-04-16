// ============================================================
//  state.js — localStorage 讀寫封裝
//
//  state 結構：
//  {
//    done:        { 'item-0': true, ... },
//    amounts:     { 'item-0': { raw: 22896, cur: 'TWD', who: 'both' }, ... },
//    customItems: [ { id, day, cat, section, name, sub, notes, amount, cur, who, custom: true }, ... ],
//    notes:       '備忘記事文字',
//  }
// ============================================================

const STORAGE_KEY = 'japan2026';

const State = (() => {
  let _data = { done: {}, amounts: {}, customItems: [], notes: '' };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        _data = {
          done:        parsed.done        || {},
          amounts:     parsed.amounts     || {},
          customItems: parsed.customItems || [],
          notes:       parsed.notes       || '',
        };
      }
    } catch (e) {
      console.warn('state load failed', e);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    } catch (e) {
      console.warn('state save failed', e);
    }
  }

  // ── Done 狀態 ──────────────────────────────────────────────
  function isDone(id) {
    return !!_data.done[id];
  }

  function toggleDone(id) {
    _data.done[id] = !_data.done[id];
    save();
  }

  // ── 金額 + 誰付 ────────────────────────────────────────────
  // 回傳 { raw, cur, who } 或 null（代表使用 data.js 預設值）
  function getAmount(id) {
    return _data.amounts[id] || null;
  }

  // who: 'both' | 'wewei' | 'lingling'
  function setAmount(id, raw, cur, who) {
    _data.amounts[id] = { raw: Number(raw), cur, who: who || 'both' };
    save();
  }

  // ── 自訂項目 ───────────────────────────────────────────────
  function getCustomItems() {
    return _data.customItems || [];
  }

  function addCustomItem(item) {
    const newItem = {
      ...item,
      id: 'custom-' + Date.now(),
      custom: true,
    };
    _data.customItems = [...(_data.customItems || []), newItem];
    save();
    return newItem;
  }

  function updateCustomItem(id, changes) {
    _data.customItems = _data.customItems.map(i =>
      i.id === id ? { ...i, ...changes } : i
    );
    save();
  }

  function deleteCustomItem(id) {
    _data.customItems = _data.customItems.filter(i => i.id !== id);
    delete _data.done[id];
    delete _data.amounts[id];
    save();
  }

  // ── 備忘記事 ───────────────────────────────────────────────
  function getNotes() {
    return _data.notes || '';
  }

  function setNotes(text) {
    _data.notes = text;
    save();
  }

  return {
    load,
    isDone, toggleDone,
    getAmount, setAmount,
    getCustomItems, addCustomItem, updateCustomItem, deleteCustomItem,
    getNotes, setNotes,
  };
})();
