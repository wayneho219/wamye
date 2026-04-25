// ============================================================
//  state.js — localStorage 讀寫封裝
//
//  state 結構：
//  {
//    done:        { 'item-0': true },
//    amounts:     { 'item-0': { raw, cur, who } },
//    edits:       { 'item-0': { notes, photos, skipped, catOverride } },
//    customItems: [ { id, day, cat, name, sub, notes, amount, cur, who, custom } ],
//    notes:       '備忘記事',
//  }
// ============================================================

const STORAGE_KEY = 'japan2026';

const State = (() => {
  let _data = { done: {}, amounts: {}, edits: {}, customItems: [], notes: '', order: {} };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        _data = {
          done:        parsed.done        || {},
          amounts:     parsed.amounts     || {},
          edits:       parsed.edits       || {},
          customItems: parsed.customItems || [],
          notes:       parsed.notes       || '',
          order:       parsed.order       || {},
        };
      }
    } catch (e) { console.warn('state load failed', e); }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    } catch (e) {
      // localStorage 可能已滿（照片太多）
      console.warn('state save failed – storage may be full', e);
      alert('儲存失敗：裝置空間可能不足，請嘗試刪除部分照片。');
    }
  }

  // ── Done 狀態 ──────────────────────────────────────────────
  function isDone(id)      { return !!_data.done[id]; }
  function toggleDone(id)  { _data.done[id] = !_data.done[id]; save(); }

  // ── 金額 + 誰付 ────────────────────────────────────────────
  function getAmount(id)           { return _data.amounts[id] || null; }
  function setAmount(id, raw, cur, who) {
    const existing = _data.amounts[id];
    _data.amounts[id] = { raw: Number(raw), cur, who: who || 'both',
      ...(existing?.paidBy ? { paidBy: existing.paidBy } : {}) };
    save();
  }

  function getPaidBy(id) {
    return _data.amounts[id]?.paidBy || null;
  }

  function setPaidBy(id, paidBy) {
    _data.amounts[id] = { ...(_data.amounts[id] || { raw: 0, cur: 'TWD', who: 'both' }), paidBy };
    save();
  }

  // ── 編輯資料（心得 / 照片 / 不去了 / 類別覆寫）────────────
  // 回傳 { notes:'', photos:[], skipped:false, catOverride:null }
  function getEdit(id) {
    return _data.edits[id] || { notes: '', photos: [], skipped: false, catOverride: null };
  }

  function setEdit(id, changes) {
    _data.edits[id] = { ...getEdit(id), ...changes };
    save();
  }

  function isSkipped(id) { return !!(_data.edits[id]?.skipped); }

  // ── 自訂項目 ───────────────────────────────────────────────
  function getCustomItems()    { return _data.customItems || []; }

  function addCustomItem(item) {
    const newItem = { ...item, id: 'custom-' + Date.now(), custom: true };
    _data.customItems = [...(_data.customItems || []), newItem];
    save();
    return newItem;
  }

  function updateCustomItem(id, changes) {
    _data.customItems = _data.customItems.map(i => i.id === id ? { ...i, ...changes } : i);
    save();
  }

  function deleteCustomItem(id) {
    _data.customItems = _data.customItems.filter(i => i.id !== id);
    delete _data.done[id];
    delete _data.amounts[id];
    delete _data.edits[id];
    save();
  }

  // ── 備忘記事 ───────────────────────────────────────────────
  function getNotes()       { return _data.notes || ''; }
  function setNotes(text)   { _data.notes = text; save(); }

  // ── 排列順序 ───────────────────────────────────────────────
  function getOrder(dayId)      { return _data.order[dayId] || []; }
  function setOrder(dayId, ids) { _data.order[dayId] = ids; save(); }

  return {
    load,
    isDone, toggleDone,
    getAmount, setAmount, getPaidBy, setPaidBy,
    getEdit, setEdit, isSkipped,
    getCustomItems, addCustomItem, updateCustomItem, deleteCustomItem,
    getNotes, setNotes,
    getOrder, setOrder,
  };
})();
