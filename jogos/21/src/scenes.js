// ------------------------------------------------------------------ Boot
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.spritesheet('guard', 'assets/player/guard.png',
      { frameWidth: GUARD_SPR.frameW, frameHeight: GUARD_SPR.frameH });
    this.load.spritesheet('run', 'assets/player/run.png', { frameWidth: RUN_SPR.frameW, frameHeight: RUN_SPR.frameH });
    this.load.spritesheet('idle', 'assets/player/idle.png', { frameWidth: IDLE_SPR.frameW, frameHeight: IDLE_SPR.frameH });
    this.load.spritesheet('roll', 'assets/player/roll.png', { frameWidth: ROLL_SPR.frameW, frameHeight: ROLL_SPR.frameH });
    this.load.spritesheet('fatboss', 'assets/boss.png', { frameWidth: FB_SPR.frameW, frameHeight: FB_SPR.frameH });
    this.load.image('title', 'assets/title.png');
    this.load.image('spear', 'assets/lanca.png');
    this.load.image('backtitle', 'assets/backtitle.png');
    this.load.image('backboss1', 'assets/backboss1.png');
    this.load.image('backboss2', 'assets/backboss2.png');
    this.load.image('backboss3', 'assets/backboss3.png');
    this.load.image('backtreino', 'assets/backtreino.png');
    this.load.image('backcorredor', 'assets/backcorredor.png');
    this.load.image('porta', 'assets/porta.png');
    this.load.spritesheet('knight_idle', 'assets/Spritesheets/hooded knight idle.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('knight_attack', 'assets/Spritesheets/hooded knight attack.png', { frameWidth: 180, frameHeight: 100 });
    this.load.spritesheet('knight_power', 'assets/Spritesheets/hooded knight powerup.png', { frameWidth: 100, frameHeight: 180 });
    for (let i = 0; i < 10; i++) {
      this.load.image(`kr_${i + 1}`, `assets/Spritesheets/hooded knight run/rei correndo ${String(i).padStart(2, '0')}.png`);
    }
    for (let i = 0; i < 3; i++) this.load.image(`knight_bullet_${i}`, `assets/knight_bullet/bullet_${i}.png`);
    for (let i = 1; i <= 5; i++) this.load.image(`lightning_${i}`, `assets/lightning/lightning_skill4_frame${i}.png`);
    for (let g = 1; g <= 3; g++) for (let i = 1; i <= 8; i++) this.load.image(`fire${g}_${i}`, `assets/fire/g${g}_${i}.png`);
    for (let i = 0; i < 4; i++) this.load.image(`gordo_bullet_${i}`, `assets/gordo_bullet/bullet_${i}.png`);
  }
  create() {
    this.textures.get('guard').setFilter(Phaser.Textures.FilterMode.NEAREST);
    const gf = (a, b) => this.anims.generateFrameNumbers('guard', { start: a, end: b });
    this.anims.create({ key: 'guard_in', frames: gf(0, 1), frameRate: GUARD_SPR.fpsIn, repeat: 0 });
    this.anims.create({ key: 'guard_loop', frames: gf(2, 5), frameRate: GUARD_SPR.fpsLoop, repeat: -1 });
    this.anims.create({ key: 'guard_out', frames: gf(6, 7), frameRate: GUARD_SPR.fpsOut, repeat: 0 });
    for (const k of ['run', 'roll', 'idle', 'fatboss', 'spear', 'knight_idle', 'knight_attack', 'knight_power']) {
      this.textures.get(k).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    for (let i = 1; i <= 10; i++) this.textures.get(`kr_${i}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
    for (let i = 0; i < 3; i++) this.textures.get(`knight_bullet_${i}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.anims.create({
      key: 'knight_bullet', frameRate: 12, repeat: -1,
      frames: [0, 1, 2].map(i => ({ key: `knight_bullet_${i}` })),
    });
    for (let i = 1; i <= 5; i++) this.textures.get(`lightning_${i}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
    // raio do "céu limpo" (Cavaleiro Sombrio, fase 2): forma -> impacto (flash) -> desfaz
    this.anims.create({
      key: 'lightning_strike', frameRate: 18, repeat: 0,
      frames: [1, 2, 3, 4, 5].map(i => ({ key: `lightning_${i}` })),
    });
    // rastro de fogo do dash (Cavaleiro Sombrio): 3 variações, sorteadas em bosses.js
    for (let g = 1; g <= 3; g++) {
      for (let i = 1; i <= 8; i++) this.textures.get(`fire${g}_${i}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.anims.create({
        key: `fire${g}`, frameRate: 14, repeat: -1,
        frames: Array.from({ length: 8 }, (_, i) => ({ key: `fire${g}_${i + 1}` })),
      });
    }
    for (let i = 0; i < 4; i++) this.textures.get(`gordo_bullet_${i}`).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.anims.create({
      key: 'gordo_bullet', frameRate: 10, repeat: -1,
      frames: [0, 1, 2, 3].map(i => ({ key: `gordo_bullet_${i}` })),
    });
    this.anims.create({
      key: 'idle', frameRate: IDLE_SPR.fps, repeat: -1,
      frames: this.anims.generateFrameNumbers('idle', { start: 0, end: IDLE_SPR.frames - 1 }),
    });
    this.anims.create({
      key: 'run', frameRate: RUN_SPR.fps, repeat: -1,
      frames: this.anims.generateFrameNumbers('run', { start: 0, end: RUN_SPR.frames - 1 }),
    });
    // o rolamento inteiro cabe exatamente na duração da esquiva
    this.anims.create({
      key: 'roll', frameRate: ROLL_SPR.frames / CFG.dashTime, repeat: 0,
      frames: this.anims.generateFrameNumbers('roll', { start: 0, end: ROLL_SPR.frames - 1 }),
    });
    // Cavaleiro Sombrio (assets/Spritesheets)
    this.anims.create({
      key: 'knight_idle', frameRate: 8, repeat: -1,
      frames: this.anims.generateFrameNumbers('knight_idle', { start: 0, end: 7 }),
    });
    this.anims.create({
      key: 'knight_attack', frameRate: 22, repeat: 0,
      frames: this.anims.generateFrameNumbers('knight_attack', { start: 0, end: 16 }),
    });
    // corrida (assets/Spritesheets/hooded knight run) — PNGs soltos, não um spritesheet
    this.anims.create({
      key: 'knight_run', frameRate: 14, repeat: -1,
      frames: Array.from({ length: 10 }, (_, i) => ({ key: `kr_${i + 1}` })),
    });
    // levanta a espada e segura brilhando — usada no "céu limpo" da fase 2
    this.anims.create({
      key: 'knight_power', frameRate: 18, repeat: 0,
      frames: this.anims.generateFrameNumbers('knight_power', { start: 0, end: 18 }),
    });
    // depois de erguida, fica com um leve flutuar nos últimos quadros enquanto os raios continuam caindo
    this.anims.create({
      key: 'knight_power_hold', frameRate: 5, yoyo: true, repeat: -1,
      frames: this.anims.generateFrameNumbers('knight_power', { start: 15, end: 18 }),
    });
    const mk = (key, w, h, fn) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      fn(g); g.generateTexture(key, w, h); g.destroy();
    };
    mk('shadow', 64, 24, g => { g.fillStyle(0x000000, 0.4); g.fillEllipse(32, 12, 60, 20); });
    mk('dot', 6, 6, g => { g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 6, 6); });
    mk('orb', 24, 24, g => {
      g.fillStyle(0xffffff, 0.3); g.fillCircle(12, 12, 12);
      g.fillStyle(0xffffff, 1); g.fillCircle(12, 12, 7);
    });
    mk('dummy', 64, 96, g => {   // boneco de treino: poste com alvo
      g.fillStyle(0x6a4a2c, 1); g.fillRect(28, 30, 8, 64);
      g.fillStyle(0x8a6a44, 1); g.fillRoundedRect(12, 26, 40, 22, 6); g.fillRoundedRect(8, 44, 48, 36, 8);
      g.fillStyle(0xe8e4f0, 1); g.fillCircle(32, 62, 15);
      g.fillStyle(0xd0304a, 1); g.fillCircle(32, 62, 11);
      g.fillStyle(0xe8e4f0, 1); g.fillCircle(32, 62, 7);
      g.fillStyle(0xd0304a, 1); g.fillCircle(32, 62, 3);
      g.fillStyle(0x3a2818, 1); g.fillCircle(32, 14, 12);
      g.fillStyle(0xc9a77a, 1); g.fillCircle(32, 14, 10);
    });
    mk('golem', 100, 120, g => {
      g.fillStyle(0x6d645a, 1); g.fillRoundedRect(4, 30, 92, 90, 14);
      g.fillStyle(0x8a7f72, 1); g.fillRoundedRect(10, 30, 80, 80, 12);
      g.fillStyle(0x9b9082, 1); g.fillRoundedRect(28, 0, 44, 40, 8);
      g.fillStyle(0xff9a2e, 1); g.fillRect(36, 16, 9, 6); g.fillRect(55, 16, 9, 6);
      g.lineStyle(3, 0x4d463f, 1); g.lineBetween(30, 60, 50, 80); g.lineBetween(50, 80, 44, 105); g.lineBetween(70, 55, 62, 75);
    });
    this.scene.start('Menu');
  }
}

// ------------------------------------------------------------------ Menu
class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    const cam = this.cameras.main;
    cam.setBackgroundColor('#14121c'); cam.fadeIn(500, 0, 0, 0);
    this.add.image(0, 0, 'backtitle').setOrigin(0).setDisplaySize(W, H).setDepth(-1);
    // brasas subindo ao fundo
    for (let i = 0; i < 36; i++) {
      const d = this.add.image(rnd(0, W), rnd(0, H), 'dot').setTint(0xffaa44).setAlpha(rnd(0.15, 0.5)).setScale(rnd(0.4, 1));
      this.tweens.add({
        targets: d, y: d.y - rnd(120, 300), alpha: 0, duration: rnd(3000, 6000), repeat: -1,
        onRepeat: () => { d.x = rnd(0, W); d.y = rnd(H * 0.5, H + 40); d.alpha = rnd(0.15, 0.5); },
      });
    }
    this.add.image(W / 2, 210, 'title').setOrigin(0.5).setScale(560 / 1774);

    const btn = this.add.text(W / 2, 400, 'JOGAR', {
      fontFamily: FONT, fontSize: '34px', color: '#14121c', backgroundColor: '#ffd166', padding: { x: 64, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => { btn.setStyle({ backgroundColor: '#ffe29a' }); btn.setScale(1.06); });
    btn.on('pointerout', () => { btn.setStyle({ backgroundColor: '#ffd166' }); btn.setScale(1); });

    let starting = false;
    const play = () => {
      if (starting) return;
      starting = true; Sfx.pick();
      cam.fadeOut(600, 0, 0, 0);
      cam.once('camerafadeoutcomplete', () => this.scene.start('Game', { mode: 'tutorial' }));
    };
    btn.on('pointerdown', play);
    this.input.keyboard.once('keydown-ENTER', play);
  }
}

// ------------------------------------------------------------------ Fim
class EndScene extends Phaser.Scene {
  constructor() { super('End'); }
  init(d) { this.win = d.win; this.bossIndex = d.bossIndex; }
  create() {
    this.cameras.main.setBackgroundColor('#14121c'); this.cameras.main.fadeIn(500, 0, 0, 0);
    const t = (y, s, size, col) => this.add.text(W / 2, y, s, {
      fontFamily: FONT, fontSize: size + 'px', color: col, align: 'center',
    }).setOrigin(0.5);
    if (this.win) {
      t(230, 'VITÓRIA', 72, '#ffd166');
      t(300, 'Todos os bosses caíram.', 22, '#e8e4f0');
      t(400, '[ clique para voltar ao menu ]', 22, '#8f88a8');
      this.input.once('pointerdown', () => this.scene.start('Menu'));
      this.input.keyboard.once('keydown-R', () => this.scene.start('Menu'));
    } else {
      t(230, 'VOCÊ MORREU', 64, '#e03a4e');
      t(300, BOSSES[this.bossIndex].name, 24, '#e8e4f0');
      t(400, '[ clique ou R para tentar de novo ]', 22, '#8f88a8');
      const again = () => this.scene.start('Game', { mode: 'boss', bossIndex: this.bossIndex });
      this.input.once('pointerdown', again);
      this.input.keyboard.once('keydown-R', again);
    }
  }
}

