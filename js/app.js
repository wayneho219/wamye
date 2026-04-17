// ============================================================
//  app.js — 初始化與全域事件綁定
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  State.load();

  // 渲染所有行程日（含 + 新增按鈕）
  renderAllDays();

  // 為每個 day-view 綁定事件委派
  document.querySelectorAll('.day-view').forEach(bindDayViewEvents);

  // 備忘記事
  renderNotes();
  document.getElementById('globalNotes')?.addEventListener('input', e => {
    State.setNotes(e.target.value);
  });

  // 統計
  renderStats();

  // 分頁按鈕
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  // 總覽頁每日列表點擊跳轉
  document.querySelectorAll('.day-row[data-tab]').forEach(row => {
    row.addEventListener('click', () => showTab(row.dataset.tab));
  });

  // ── 金額 Modal ─────────────────────────────────────────────
  document.getElementById('btn-twd')?.addEventListener('click', () => setModalCurrency('TWD'));
  document.getElementById('btn-jpy')?.addEventListener('click', () => setModalCurrency('JPY'));
  document.getElementById('modal-input')?.addEventListener('input', updateConversionHint);
  document.getElementById('modal-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveAmountModal();
    if (e.key === 'Escape') closeAmountModal();
  });
  document.getElementById('modal-save')?.addEventListener('click', saveAmountModal);
  document.getElementById('modal-cancel')?.addEventListener('click', closeAmountModal);
  document.getElementById('amountModal')?.addEventListener('click', e => {
    if (e.target.id === 'amountModal') closeAmountModal();
  });

  // 誰付（金額 modal）
  document.querySelectorAll('.who-btn').forEach(btn => {
    btn.addEventListener('click', () => setModalWho(btn.dataset.who));
  });

  // ── 新增項目 Modal ─────────────────────────────────────────
  document.getElementById('add-btn-twd')?.addEventListener('click', () => setAddCurrency('TWD'));
  document.getElementById('add-btn-jpy')?.addEventListener('click', () => setAddCurrency('JPY'));
  document.getElementById('add-amount')?.addEventListener('input', updateAddHint);
  document.getElementById('add-save')?.addEventListener('click', saveAddItem);
  document.getElementById('add-cancel')?.addEventListener('click', closeAddItemModal);
  document.getElementById('addItemModal')?.addEventListener('click', e => {
    if (e.target.id === 'addItemModal') closeAddItemModal();
  });

  // 誰付（新增 modal）
  document.querySelectorAll('.add-who-btn').forEach(btn => {
    btn.addEventListener('click', () => setAddWho(btn.dataset.who));
  });

  // Enter 在名稱欄位 → 跳下一欄
  document.getElementById('add-name')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('add-amount')?.focus();
    if (e.key === 'Escape') closeAddItemModal();
  });
  document.getElementById('add-amount')?.addEventListener('keydown', e => {
    if (e.key === 'Enter')  saveAddItem();
    if (e.key === 'Escape') closeAddItemModal();
  });

  // ── 編輯項目 Modal ─────────────────────────────────────────
  document.getElementById('edit-cancel')?.addEventListener('click', closeEditModal);
  document.getElementById('edit-save')?.addEventListener('click', saveEditModal);
  document.getElementById('editModal')?.addEventListener('click', e => {
    if (e.target.id === 'editModal') closeEditModal();
  });
  document.getElementById('edit-skip-btn')?.addEventListener('click', toggleSkipBtn);

  // 照片新增
  document.getElementById('edit-photo-add-btn')?.addEventListener('click', () => {
    document.getElementById('edit-photo-input')?.click();
  });
  document.getElementById('edit-photo-input')?.addEventListener('change', e => {
    handlePhotoInput(e.target);
  });

  // 左右滑動切換行程日
  initSwipe();

  // 預設顯示總覽
  showTab('overview');
});
