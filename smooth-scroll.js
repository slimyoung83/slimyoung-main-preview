(() => {
  if (!window.Lenis) return;

  const desktopMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let lenis;

  function syncScrollMode() {
    if (desktopMotion.matches && !lenis) {
      lenis = new window.Lenis({
        autoRaf: true,
        smoothWheel: true,
        lerp: 0.1,
        syncTouch: false,
        anchors: false,
        prevent: (node) => node.matches?.('dialog, .mega-panel'),
      });
    } else if (!desktopMotion.matches && lenis) {
      lenis.destroy();
      lenis = undefined;
    }
  }

  desktopMotion.addEventListener('change', syncScrollMode);
  syncScrollMode();
})();
