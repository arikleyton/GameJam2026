// ------------------------------------------------------------------
// Navbar temporária de DEV — só pra pular direto pra qualquer boss durante o desenvolvimento.
// Remover este arquivo, a tag <script> dele e o <div id="devnav"> do index.html antes de publicar.
// ------------------------------------------------------------------
(function () {
  function goto(mode, bossIndex) {
    const g = window.game;
    if (!g) return;
    // fecha qualquer cena ativa antes de trocar, senão elas ficam sobrepostas
    ['Menu', 'Game', 'End'].forEach((key) => { if (g.scene.isActive(key)) g.scene.stop(key); });
    if (mode === 'Menu') g.scene.start('Menu');
    else g.scene.start('Game', { mode, bossIndex: bossIndex || 0 });
  }

  function wire() {
    if (!window.game) { setTimeout(wire, 100); return; }
    document.querySelectorAll('#devnav button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        const bossIndex = btn.dataset.boss ? Number(btn.dataset.boss) : 0;
        goto(mode, bossIndex);
      });
    });
  }
  wire();
})();
