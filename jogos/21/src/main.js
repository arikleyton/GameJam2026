// espera a fonte pixelada carregar antes de criar o jogo, pra não medir texto com a fonte errada
document.fonts.load('16px "Press Start 2P"').catch(() => {}).then(() => {
  window.game = new Phaser.Game({
    type: Phaser.AUTO,
    width: W,
    height: H,
    parent: 'game',
    backgroundColor: '#14121c',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, MenuScene, GameScene, EndScene],
  });
});
