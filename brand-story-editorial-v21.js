/* Mirror the approved remote safety link in this isolated local review only.
   Shared template files are deliberately preserved; deployed templates already link it. */
(() => {
  document.querySelectorAll('.mega-label').forEach(label => {
    if (label.textContent.trim() !== '안전마취시스템') return;
    const link = document.createElement('a');
    link.href = 'safety-system.html';
    link.textContent = label.textContent;
    label.replaceWith(link);
  });
})();
