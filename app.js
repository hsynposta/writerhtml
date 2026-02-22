/* WriterHTML — application logic */
(function () {
  'use strict';

  const editor    = document.getElementById('editor');
  const docTitle  = document.getElementById('doc-title');
  const status    = document.getElementById('status');
  const overlay   = document.getElementById('modal-overlay');
  const htmlOut   = document.getElementById('html-output');

  // ── Formatting helpers ──────────────────────────────────────────────────

  function exec(cmd, value) {
    document.execCommand(cmd, false, value || null);
    editor.focus();
    updateStatus();
  }

  function insertBlock(tag) {
    editor.focus();
    document.execCommand('formatBlock', false, tag);
    editor.focus();
    updateStatus();
  }

  function insertHR() {
    editor.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const hr = document.createElement('hr');
    const p  = document.createElement('p');
    p.innerHTML = '<br>';
    range.collapse(false);
    range.insertNode(p);
    range.insertNode(hr);
    // move cursor after the HR
    const newRange = document.createRange();
    newRange.setStartAfter(p);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    updateStatus();
  }

  // ── Word / char count ───────────────────────────────────────────────────

  function countWords(text) {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }

  function updateStatus() {
    const text = editor.innerText || '';
    const words = countWords(text);
    const chars = text.replace(/\s/g, '').length;
    status.textContent = `${words} word${words !== 1 ? 's' : ''} · ${chars} char${chars !== 1 ? 's' : ''}`;
  }

  // ── Export ──────────────────────────────────────────────────────────────

  function buildHtmlDocument() {
    const title = docTitle.value.trim() || 'Untitled';
    const body  = editor.innerHTML;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { max-width: 740px; margin: 40px auto; padding: 0 20px;
           font-family: Georgia, "Times New Roman", serif;
           font-size: 1.05rem; line-height: 1.8; color: #111; }
    h1 { font-size: 1.9rem; } h2 { font-size: 1.5rem; } h3 { font-size: 1.2rem; }
    blockquote { border-left: 4px solid #2563eb; padding: .6em 1.2em;
                 color: #6b7280; font-style: italic; background: #f0f4ff; }
    hr { border: none; border-top: 2px solid #d1d5db; margin: 2em 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openExportModal() {
    htmlOut.value = buildHtmlDocument();
    overlay.classList.add('open');
  }

  function closeExportModal() {
    overlay.classList.remove('open');
  }

  function copyHtml() {
    const text = htmlOut.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        const btn = document.getElementById('btn-copy-html');
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy HTML'; }, 1800);
      });
    } else {
      htmlOut.select();
      document.execCommand('copy');
      const btn = document.getElementById('btn-copy-html');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy HTML'; }, 1800);
    }
  }

  function downloadHtml() {
    const title    = docTitle.value.trim() || 'document';
    const filename = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.html';
    const blob     = new Blob([buildHtmlDocument()], { type: 'text/html' });
    const a        = document.createElement('a');
    a.href         = URL.createObjectURL(blob);
    a.download     = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── Auto-save to localStorage ───────────────────────────────────────────

  const STORAGE_KEY = 'writerhtml_draft';

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        title:   docTitle.value,
        content: editor.innerHTML,
        saved:   new Date().toISOString()
      }));
    } catch (_) { /* storage unavailable */ }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.title)   docTitle.value   = draft.title;
      if (draft.content) editor.innerHTML = draft.content;
      updateStatus();
    } catch (_) { /* ignore */ }
  }

  // ── New document ────────────────────────────────────────────────────────

  function newDocument() {
    if (editor.innerText.trim() && !confirm('Start a new document? Unsaved changes will be lost.')) return;
    docTitle.value  = '';
    editor.innerHTML = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    updateStatus();
    docTitle.focus();
  }

  // ── Event wiring ────────────────────────────────────────────────────────

  // Toolbar buttons
  document.getElementById('btn-bold')       .addEventListener('click', () => exec('bold'));
  document.getElementById('btn-italic')     .addEventListener('click', () => exec('italic'));
  document.getElementById('btn-underline')  .addEventListener('click', () => exec('underline'));
  document.getElementById('btn-strike')     .addEventListener('click', () => exec('strikeThrough'));
  document.getElementById('btn-ul')         .addEventListener('click', () => exec('insertUnorderedList'));
  document.getElementById('btn-ol')         .addEventListener('click', () => exec('insertOrderedList'));
  document.getElementById('btn-quote')      .addEventListener('click', () => insertBlock('blockquote'));
  document.getElementById('btn-hr')         .addEventListener('click', insertHR);
  document.getElementById('btn-export')     .addEventListener('click', openExportModal);
  document.getElementById('btn-new')        .addEventListener('click', newDocument);

  document.getElementById('btn-copy-html')    .addEventListener('click', copyHtml);
  document.getElementById('btn-download-html').addEventListener('click', downloadHtml);
  document.getElementById('btn-close-modal')  .addEventListener('click', closeExportModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeExportModal();
  });

  // Heading select
  document.getElementById('sel-heading').addEventListener('change', function () {
    const tag = this.value;
    if (tag) insertBlock(tag);
    this.value = '';
  });

  // Live word count + auto-save
  let saveTimer;
  editor.addEventListener('input', function () {
    updateStatus();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 800);
  });

  docTitle.addEventListener('input', function () {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 800);
  });

  // Keyboard shortcuts
  editor.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); exec('bold');          break;
        case 'i': e.preventDefault(); exec('italic');        break;
        case 'u': e.preventDefault(); exec('underline');     break;
        case 's': e.preventDefault(); saveDraft();           break;
      }
    }
  });

  // Escape closes modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeExportModal();
  });

  // ── Init ────────────────────────────────────────────────────────────────
  loadDraft();
  updateStatus();
  editor.focus();
})();
