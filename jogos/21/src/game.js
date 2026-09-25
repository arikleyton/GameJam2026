// ------------------------------------------------------------------ Jogo
// Progressão: Menu -> 'tutorial' (sala de treino) -> porta -> 'boss' 1 -> porta -> 'corridor' -> 'boss' 2 -> ...
// A mesma cena roda os três modos; o que muda é a sala, a porta e o "boss" (boneco de treino no tutorial).

const DOOR_W = 84, DOOR_H = 62;
const ROOMS = {
  tutorial: { arena: ARENA, worldH: H, doorX: W / 2, doorOpen: true, start: { x: 130, y: 490 } },
  boss: { arena: ARENA, worldH: H, doorX: W / 2, doorOpen: false, start: { x: W / 2, y: 482 } },
  corridor: { arena: { l: 340, r: 620, t: 150, b: 1520 }, worldH: 1620, doorX: W / 2, doorOpen: true, start: { x: W / 2, y: 1470 } },
};
const DUMMY = { name: 'BONECO DE TREINO', tex: 'dummy', hp: 1, r: 26, cd: [1, 1], attacks: [], move() {} };

const TUT_ITEMS = [
  ['move', 'Mover'], ['throw', 'Arremessar a lança'], ['pick', 'Recolher a lança'],
  ['guard', 'Defender'], ['parry', 'Aparar um projétil'], ['dash', 'Esquivar'],
];
const TUT_ZONES = [
  { x: 0, name: '1 · MOVER', text: '1 · MOVER\nUse WASD ou as SETAS para andar.\nA lança é a sua única arma — e também o seu escudo.' },
  { x: 300, name: '2 · ATACAR', text: '2 · ARREMESSAR E RECOLHER\nBotão ESQUERDO: clique para um arremesso rápido.\nSegure e solte para um golpe CARREGADO: mais forte e ricocheteia mais longe (você fica parado).\nDepois, passe sobre a lança para pegá-la — até em pleno voo!' },
  { x: 520, name: '3 · DEFENDER', text: '3 · DEFENDER E APARAR\nBotão DIREITO (segure): defende golpes e projéteis. Cada bloqueio gasta 1 armadura.\nDefenda no instante em que o projétil chegar para APARAR: ele volta e fere o alvo!\nSem a lança na mão você não consegue defender.' },
  { x: 760, name: '4 · ESQUIVAR', text: '4 · ESQUIVAR\nESPAÇO: rolamento rápido, invencível durante o giro (recarga de 1s).\nUm golpe direto sem defesa é morte instantânea — no treino, você só é avisado.\nQuando estiver pronto, atravesse a porta ao norte.' },
];

class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }
  init(d) { this.mode = d.mode || 'boss'; this.bossIndex = d.bossIndex || 0; }

  create() {
    const room = ROOMS[this.mode];
    this.arena = room.arena; this.worldH = room.worldH;
    this.input.mouse.disableContextMenu();
    this.keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      up2: 'UP', down2: 'DOWN', left2: 'LEFT', right2: 'RIGHT',
      dash: 'SPACE', dash2: 'SHIFT',
    });
    this.now = 0; this.hitstop = 0; this.leaving = false; this.bossDefeated = false;
    this.introT = this.mode === 'boss' ? 2.0 : 0;        // tempo do fade-in + banner antes da luta
    this.projs = []; this.flashes = [];
    this.tut = {}; this.moveT = 0; this.zone = -1; this.dummyT = 1.5;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, W, this.worldH);
    this.drawRoom();
    this.doorG = this.add.graphics().setDepth(0.5);
    this.door = { x: room.doorX, open: room.doorOpen, t: room.doorOpen ? 1 : 0 };
    // sprite da porta: encaixado no nicho em arco desenhado no fundo (arena.t = onde a parede encontra o piso)
    this.doorSpr = this.add.image(room.doorX, this.arena.t, 'porta').setOrigin(0.5, 1).setDisplaySize(224, 184).setDepth(0.6);
    this.tele = this.add.graphics().setDepth(9000);
    this.fx = this.add.graphics().setDepth(9100);
    this.ui = this.add.graphics().setDepth(10000).setScrollFactor(0);

    // jogador
    this.p = {
      x: room.start.x, y: room.start.y, r: CFG.playerR, face: -Math.PI / 2,
      charge: 0, charging: false, guard: false, guardT: 0,
      dashT: 0, dashCd: 0, dashDX: 0, dashDY: 0, invuln: 0,
      armor: CFG.armorMax, lastAction: -99, regenT: 0, lmbPrev: false, dead: false,
      mx: 0, my: 0, side: 1, rolling: false, gState: 'none',   // side: 1 direita / -1 esquerda; gState: none | on (segurando) | out (soltando)
      spr: this.add.sprite(0, 0, 'run', 0)
        .setScale(PLAYER_SPR.scale).setOrigin(RUN_SPR.cx / RUN_SPR.frameW, 1).setTint(KNIGHT_TINT),
      sh: this.add.image(0, 0, 'shadow').setDepth(1),
    };

    // lança
    this.spear = {
      state: 'held', x: 0, y: 0, angle: 0, speed: 0, dmg: 0, age: 0, ignoreBoss: 0,
      spr: this.add.image(0, 0, 'spear').setScale(SPEAR_SCALE), sh: this.add.image(0, 0, 'shadow').setDepth(1).setScale(0.6, 0.4),
    };

    // "boss": o boss real na arena, o boneco de treino no tutorial, inerte no corredor
    const def = this.mode === 'boss' ? BOSSES[this.bossIndex] : DUMMY;
    const a = this.arena;
    const bx = this.mode === 'tutorial' ? 600 : W / 2, by = this.mode === 'tutorial' ? 330 : a.t + 100;
    this.boss = {
      def, x: this.mode === 'corridor' ? -999 : bx, y: this.mode === 'corridor' ? -999 : by,
      r: def.r, hp: def.hp, maxHp: def.hp, ghost: def.hp,
      alive: this.mode !== 'corridor', state: 'idle', t: 0, cd: 1.2, atk: null, lastAtk: null, rep: 0, aim: 0,
      tx: 0, ty: 0, locked: false, flash: 0, z: 0, phase2: false, phase3: false, hitOnce: false,
      spr: this.add.sprite(0, 0, def.tex, 0), sh: this.add.image(0, 0, 'shadow').setDepth(1),
    };
    if (def.sprScale) this.boss.spr.setScale(def.sprScale);
    if (def.initSprite) def.initSprite(this.boss);   // estado inicial do sprite (anim/origem) antes do 1º move()
    this.boss.sh.setScale(def.r * 2.8 / 64, def.r * 1.1 / 24);
    if (this.mode === 'corridor') { this.boss.spr.setVisible(false); this.boss.sh.setVisible(false); }

    // textos (fixos na tela)
    const txt = (x, y, s, size, col) => this.add.text(x, y, s, {
      fontFamily: FONT, fontSize: size + 'px', color: col,
    }).setDepth(10001).setScrollFactor(0);
    this.status = this.add.text(0, 0, '', { fontFamily: FONT, fontSize: '14px', color: '#ffd166' })
      .setOrigin(0.5, 1).setDepth(10001);
    const box = 'rgba(8,6,14,0.78)';
    if (this.mode === 'boss') {
      this.bossName = txt(W / 2, 20, def.name, 16, '#e8e4f0').setOrigin(0.5, 0);
      this.hint = txt(W - 12, H - 8, 'LMB carregar/arremessar · RMB defender · ESPAÇO esquiva', 12, '#6d6788').setOrigin(1, 1);
      this.banner = this.add.text(W / 2, 300, `BOSS ${this.bossIndex + 1}/${BOSSES.length}\n${def.name}`, {
        fontFamily: FONT, fontSize: '40px', color: '#ffd166', align: 'center',
      }).setOrigin(0.5).setDepth(10002).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: this.banner, alpha: 1, delay: 500, duration: 300, yoyo: true, hold: 900 });
    }
    if (this.mode === 'tutorial') {
      this.tutPanel = this.add.text(W / 2, 12, '', {
        fontFamily: FONT, fontSize: '10px', color: '#e8e4f0', backgroundColor: box, align: 'left',
        padding: { x: 12, y: 8 }, lineSpacing: 8, wordWrap: { width: 620 },
      }).setOrigin(0.5, 0).setDepth(10001).setScrollFactor(0);
      this.tutList = this.add.text(12, 12, '', {
        fontFamily: FONT, fontSize: '10px', color: '#c9c3dc', backgroundColor: box,
        padding: { x: 8, y: 8 }, lineSpacing: 6, wordWrap: { width: 130 },
      }).setDepth(10001).setScrollFactor(0);
      this.tutRefresh();
    }
    // rótulo sobre a porta
    const label = this.mode === 'tutorial' ? 'BOSS 1' : this.mode === 'corridor' ? `BOSS ${this.bossIndex + 1}` : '';
    this.doorLabel = this.add.text(this.door.x, a.t - 76, label, {
      fontFamily: FONT, fontSize: '16px', color: '#ffd166',
    }).setOrigin(0.5).setDepth(0.9);
    this.tweens.add({ targets: this.doorLabel, y: a.t - 82, yoyo: true, repeat: -1, duration: 700 });

    // câmera: fixa nas salas, segue o jogador no corredor
    if (this.mode === 'corridor') {
      cam.setScroll(0, this.worldH - H);
      cam.startFollow(this.p, true, 0.12, 0.12);
    }
    cam.fadeIn(700, 0, 0, 0);
  }

  // ---- cenário em 3/4: parede frontal + piso em xadrez
  drawRoom() {
    const a = this.arena, wd = a.r - a.l, g = this.add.graphics().setDepth(0);
    const corridor = this.mode === 'corridor';
    // bosses, treino e corredor têm arte de fundo dedicada agora
    const roomBg = this.mode === 'boss' ? { 0: 'backboss1', 1: 'backboss3' }[this.bossIndex]
      : this.mode === 'tutorial' ? 'backtreino' : corridor ? 'backcorredor' : null;
    if (roomBg && corridor) {
      // corredor é vertical e alto (mundo de 1620px); a imagem (1024x1536) repete na vertical pra cobrir tudo
      const scale = W / 1024;
      this.add.tileSprite(0, 0, W, this.worldH, roomBg).setOrigin(0).setDepth(0).setTileScale(scale, scale);
    } else if (roomBg) {
      this.add.image(0, 0, roomBg).setOrigin(0).setDisplaySize(W, H).setDepth(0);
    } else {
      g.fillStyle(0x14121c, 1); g.fillRect(0, 0, W, this.worldH);
      g.fillStyle(0x2b2438, 1); g.fillRect(a.l - 24, a.t - 62, wd + 48, 62);
      g.fillStyle(0x3a3050, 1); g.fillRect(a.l - 24, a.t - 62, wd + 48, 12);
      g.lineStyle(2, 0x201a2c, 1);
      for (let x = a.l; x < a.r; x += 70) g.lineBetween(x, a.t - 50, x, a.t);
      const c1 = corridor ? 0x3c3650 : 0x4a4360, c2 = corridor ? 0x38324b : 0x453e5a;
      for (let y = a.t; y < a.b; y += 42) {
        for (let x = a.l; x < a.r; x += 42) {
          const odd = ((x - a.l) / 42 + (y - a.t) / 42) % 2 === 0;
          g.fillStyle(odd ? c1 : c2, 1);
          g.fillRect(x, y, Math.min(42, a.r - x), Math.min(42, a.b - y));
        }
      }
      g.fillStyle(0x0d0b14, 0.5); g.fillRect(a.l, a.t, wd, 10);
      g.fillStyle(0x2b2438, 1); g.fillRect(a.l - 24, a.b, wd + 48, 14);
      g.fillRect(a.l - 24, a.t - 62, 24, a.b - a.t + 76); g.fillRect(a.r, a.t - 62, 24, a.b - a.t + 76);
    }

    if (corridor && !roomBg) {
      // tochas alternadas nas paredes laterais (só quando não há imagem de fundo, que já vem com as suas)
      let side = 0;
      for (let y = a.t + 140; y < a.b - 60; y += 250, side++) {
        const x = side % 2 ? a.r + 12 : a.l - 12, dir = side % 2 ? -1 : 1;
        g.fillStyle(0xffaa44, 0.07); g.fillCircle(x + dir * 40, y + 30, 110);
        g.fillStyle(0x4a3a2a, 1); g.fillRect(x - 3, y, 6, 16);
        const f = this.add.image(x, y - 4, 'orb').setTint(0xffaa44).setScale(1.1).setDepth(2);
        this.tweens.add({ targets: f, alpha: 0.55, scale: 0.9, yoyo: true, repeat: -1, duration: rnd(260, 420) });
      }
    }
    if (this.mode === 'tutorial') {
      // divisórias e títulos das estações de treino
      for (let i = 1; i < TUT_ZONES.length; i++) {
        g.lineStyle(2, 0xffffff, 0.12);
        for (let y = a.t + 8; y < a.b - 8; y += 18) g.lineBetween(TUT_ZONES[i].x, y, TUT_ZONES[i].x, y + 8);
      }
      TUT_ZONES.forEach((z, i) => {
        const x1 = i + 1 < TUT_ZONES.length ? TUT_ZONES[i + 1].x : a.r;
        this.add.text((Math.max(z.x, a.l) + x1) / 2, a.t + 22, z.name, {
          fontFamily: FONT, fontSize: '14px', color: '#ffffff',
        }).setOrigin(0.5).setAlpha(0.28).setDepth(0.8);
      });
    }
  }

  drawDoor() {
    const g = this.doorG, d = this.door, a = this.arena, x0 = d.x - DOOR_W / 2, y0 = a.t - DOOR_H;
    g.clear();
    // a arte da porta é uma peça só (fechada); ao abrir, ela desaparece e um brilho quente marca a passagem
    this.doorSpr.setPosition(d.x, a.t).setAlpha(1 - d.t);
    if (d.t > 0) { g.fillStyle(0xffd166, 0.12 * d.t); g.fillRect(x0, y0, DOOR_W, DOOR_H); }
  }

  shake(ms, i) { this.cameras.main.shake(ms, i); }

  burst(x, y, color, n = 10, sp = 140, life = 400) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = sp * (0.4 + Math.random() * 0.6);
      const d = this.add.image(x, y, 'dot').setTint(color).setDepth(9500);
      this.tweens.add({
        targets: d, x: x + Math.cos(a) * v * life / 1000, y: y + Math.sin(a) * v * life / 1000,
        alpha: 0, scale: 0.2, duration: life, onComplete: () => d.destroy(),
      });
    }
  }
  floatText(x, y, s, col = '#ffffff') {
    const t = this.add.text(x, y, s, { fontFamily: FONT, fontSize: '20px', fontStyle: 'bold', color: col })
      .setOrigin(0.5).setDepth(9600);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  // ---- tutorial: checklist e texto da estação atual
  tutRefresh() {
    this.tutList.setText('TREINO\n' + TUT_ITEMS.map(([k, n]) => `${this.tut[k] ? '[x]' : '[ ]'} ${n}`).join('\n'));
  }
  tutMark(k) {
    if (this.mode !== 'tutorial' || this.tut[k]) return;
    this.tut[k] = true; this.tutRefresh(); Sfx.pick();
    if (TUT_ITEMS.every(([key]) => this.tut[key])) {
      this.floatText(W / 2, 200, 'Treino completo! Siga pela porta.', '#ffd166');
    }
  }
  updateTutorial() {
    const p = this.p;
    let z = 0;
    for (let i = 0; i < TUT_ZONES.length; i++) if (p.x >= TUT_ZONES[i].x) z = i;
    if (z !== this.zone) { this.zone = z; this.tutPanel.setText(TUT_ZONES[z].text); }
  }

  // ================================================================= loop
  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    if (this.hitstop > 0) { this.hitstop -= dt; return; }
    this.now += dt;
    if (this.introT > 0) this.introT -= dt;
    this.door.t = clamp(this.door.t + (this.door.open ? 1 : -1) * dt * 1.2, 0, 1);

    this.tele.clear(); this.fx.clear();
    if (!this.p.dead) this.updatePlayer(dt);
    this.checkDoor();
    this.updateSpear(dt);
    this.updateBoss(dt);
    this.updateProjs(dt);
    if (this.mode === 'tutorial') this.updateTutorial();
    this.render(dt);
  }

  // ----------------------------------------------------------- porta
  checkDoor() {
    const p = this.p, d = this.door;
    if (this.leaving || p.dead || !d.open || d.t < 0.9) return;
    if (p.y <= this.arena.t - 8 && Math.abs(p.x - d.x) < DOOR_W / 2) this.goThrough();
  }

  goThrough() {
    this.leaving = true; Sfx.dash();
    const next = this.mode === 'tutorial' ? ['Game', { mode: 'boss', bossIndex: 0 }]
      : this.mode === 'corridor' ? ['Game', { mode: 'boss', bossIndex: this.bossIndex }]
      : this.bossIndex + 1 < BOSSES.length ? ['Game', { mode: 'corridor', bossIndex: this.bossIndex + 1 }]
      : ['End', { win: true }];
    const cam = this.cameras.main;
    cam.fadeOut(700, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => this.scene.start(next[0], next[1]));
  }

  // ----------------------------------------------------------- jogador
  updatePlayer(dt) {
    const p = this.p, k = this.keys, ptr = this.input.activePointer, s = this.spear, cam = this.cameras.main;

    if (this.leaving) {        // atravessando a porta: anda sozinho para dentro dela
      p.guard = false; p.charging = false; p.charge = 0; p.dashT = 0; p.invuln = 0;
      p.mx = 0; p.my = -1; p.y -= 130 * dt; p.face = -Math.PI / 2;
      return;
    }

    p.face = Math.atan2(ptr.y + cam.scrollY - p.y, ptr.x + cam.scrollX - p.x);
    const lmb = ptr.leftButtonDown(), rmb = ptr.rightButtonDown();
    let ix = (k.right.isDown || k.right2.isDown ? 1 : 0) - (k.left.isDown || k.left2.isDown ? 1 : 0);
    let iy = (k.down.isDown || k.down2.isDown ? 1 : 0) - (k.up.isDown || k.up2.isDown ? 1 : 0);
    const il = Math.hypot(ix, iy);
    if (il > 0) { ix /= il; iy /= il; }

    p.dashCd = Math.max(0, p.dashCd - dt);
    p.invuln = Math.max(0, p.invuln - dt);

    const J = Phaser.Input.Keyboard.JustDown;
    if ((J(k.dash) || J(k.dash2)) && p.dashCd <= 0 && p.dashT <= 0) {
      p.dashT = CFG.dashTime; p.dashCd = CFG.dashCd;
      p.invuln = Math.max(p.invuln, CFG.dashInvuln);
      // sem direção: recua (oposto à mira)
      p.dashDX = il > 0 ? ix : -Math.cos(p.face);
      p.dashDY = il > 0 ? iy : -Math.sin(p.face);
      p.charging = false; p.charge = 0; p.guard = false;
      Sfx.dash(); this.burst(p.x, p.y, 0x8fd0ff, 6, 60, 250); this.tutMark('dash');
    }

    if (p.dashT > 0) {
      p.dashT -= dt;
      p.x += p.dashDX * CFG.dashSpeed * dt; p.y += p.dashDY * CFG.dashSpeed * dt;
    } else {
      const held = s.state === 'held';
      if (rmb && held) {
        if (!p.guard) { p.guard = true; p.guardT = 0; this.tutMark('guard'); }
        p.guardT += dt; p.charging = false; p.charge = 0;
      } else p.guard = false;

      if (!held) { p.charging = false; p.charge = 0; }
      else if (!p.guard) {
        if (lmb && !p.lmbPrev) { p.charging = true; p.charge = 0; }
        if (p.charging) {
          if (lmb) p.charge = Math.min(1, p.charge + dt / CFG.chargeTime);
          else this.throwSpear();
        }
      }
      const sp = p.charging ? 0 : CFG.playerSpeed * (p.guard ? CFG.guardSpeedMul : 1);
      p.x += ix * sp * dt; p.y += iy * sp * dt;
      p.mx = p.charging ? 0 : ix; p.my = p.charging ? 0 : iy;
      if (this.mode === 'tutorial' && sp > 0 && il > 0 && (this.moveT += dt) > 0.6) this.tutMark('move');
    }
    p.lmbPrev = lmb;

    // limites da sala; com a porta aberta, dá para entrar no vão dela
    const a = this.arena, d = this.door;
    p.x = clamp(p.x, a.l + p.r, a.r - p.r);
    const inDoor = d.open && d.t > 0.5 && Math.abs(p.x - d.x) < DOOR_W / 2 - 6;
    p.y = clamp(p.y, inDoor ? a.t - 40 : a.t + 12, a.b - p.r);
    if (p.y < a.t + 12) p.x = clamp(p.x, d.x - DOOR_W / 2 + p.r, d.x + DOOR_W / 2 - p.r);

    // empurra para fora do corpo do boss
    const b = this.boss;
    if (b.alive) {
      const dd = dist(p, b), min = b.r + p.r;
      if (dd < min && dd > 0) { p.x = b.x + (p.x - b.x) / dd * min; p.y = b.y + (p.y - b.y) / dd * min; }
    }

    // regeneração de armadura: só depois de ficar sem atacar/perder armadura
    if (p.armor < CFG.armorMax && this.now - p.lastAction > CFG.armorRegenDelay) {
      p.regenT += dt;
      if (p.regenT >= CFG.armorRegenTick) { p.armor++; p.regenT = 0; this.floatText(p.x, p.y - 30, '+🛡', '#8fd0ff'); }
    } else p.regenT = 0;
  }

  throwSpear() {
    const p = this.p, s = this.spear, c = p.charge;
    s.state = 'flying'; s.angle = p.face; s.age = 0; s.ignoreBoss = 0;
    s.charge = c; s.bounced = false; s.decel = CFG.spearDecel;
    s.speed = CFG.throwMinSpeed + c * (CFG.throwMaxSpeed - CFG.throwMinSpeed);
    s.dmg = Math.round(CFG.spearMinDmg + c * (CFG.spearMaxDmg - CFG.spearMinDmg));
    s.x = p.x + Math.cos(p.face) * 22; s.y = p.y + Math.sin(p.face) * 22;
    p.charging = false; p.charge = 0; p.lastAction = this.now; p.regenT = 0;
    Sfx.throw(c); this.tutMark('throw');
  }

  // -------------------------------------------------------------- lança
  updateSpear(dt) {
    const s = this.spear, p = this.p, b = this.boss, a = this.arena;
    s.age += dt; s.ignoreBoss -= dt;
    if (s.state === 'held') {
      const back = p.charging ? p.charge * 9 : 0;
      s.x = p.x + Math.cos(p.face) * (18 - back); s.y = p.y + Math.sin(p.face) * (18 - back);
      s.angle = p.face;
      return;
    }
    if (s.state === 'flying') {
      s.speed -= s.decel * dt;
      if (s.speed <= 0) { s.speed = 0; s.state = 'ground'; }
      s.x += Math.cos(s.angle) * s.speed * dt; s.y += Math.sin(s.angle) * s.speed * dt;
      // paredes: ricocheteia mantendo boa parte da velocidade
      let wall = false;
      if (s.x < a.l || s.x > a.r) {
        s.x = clamp(s.x, a.l, a.r); s.angle = Math.PI - s.angle; wall = true;
      }
      if (s.y < a.t || s.y > a.b) {
        s.y = clamp(s.y, a.t, a.b); s.angle = -s.angle; wall = true;
      }
      if (wall) {
        s.speed *= CFG.wallBounce; s.ignoreBoss = Math.max(s.ignoreBoss, 0.05);
        if (s.speed > 150) { this.burst(s.x, s.y, 0xffffff, 5, 90, 200); Sfx.block(); }
      }
      if (b.alive && s.ignoreBoss <= 0 && s.speed > 90 && dist(s, b) < b.r + 8) this.spearHitBoss();
    }
    // recolher: pode ser pega a qualquer momento (voando ou no chão), exceto logo após o arremesso
    if (!p.dead && s.age > 0.15 && dist(s, p) < 30) {
      const caught = s.state === 'flying';
      s.state = 'held'; s.speed = 0; p.lastAction = Math.max(p.lastAction, this.now - 1); Sfx.pick();
      if (caught) this.burst(p.x, p.y, 0xffd166, 8, 120, 250);
      if (this.tut.throw) this.tutMark('pick');
    }
  }

  spearHitBoss() {
    const s = this.spear, b = this.boss;
    const dx = Math.cos(s.angle), dy = Math.sin(s.angle);
    const side = (dx * (s.y - b.y) - dy * (s.x - b.x)) >= 0 ? 1 : -1;
    const c = s.charge, full = c >= 0.95;
    // um segundo acerto (depois de ricochetear) causa dano reduzido
    const dmg = s.bounced ? Math.max(1, Math.round(s.dmg * CFG.ricochetRehitMul)) : s.dmg;
    this.damageBoss(dmg, s.x, s.y);
    this.hitstop = 0.04 + (dmg / CFG.spearMaxDmg) * 0.06;
    this.shake(120, 0.004 + dmg * 0.0012);
    if (full) this.burst(s.x, s.y, 0xffd166, 14, 220, 450);
    // ricochete: desvia 75° da direção de chegada; quanto mais carga, mais longe vai
    s.angle += side * Phaser.Math.DegToRad(CFG.ricochetDeg);
    s.speed = Phaser.Math.Linear(CFG.ricochetSpeedMin, CFG.ricochetSpeedMax, c) * (full ? CFG.ricochetFullBonus : 1);
    s.decel = CFG.ricochetDecel; s.bounced = true;
    s.ignoreBoss = 0.25;
    const away = angleTo(b, s);
    s.x = b.x + Math.cos(away) * (b.r + 10); s.y = b.y + Math.sin(away) * (b.r + 10);
  }

  // ---------------------------------------------------------------- boss
  damageBoss(n, x, y) {
    const b = this.boss;
    if (!b.alive) return;
    // alguns bosses só são atingíveis em uma janela específica (ex.: atordoado); fora dela, o golpe é aparado
    if (this.mode !== 'tutorial' && b.def.vulnerable && !b.def.vulnerable(b)) {
      b.flash = 0.12; b.spr.setTintFill(0x5ec8ff);
      this.floatText(x, y - 10, 'PROTEGIDO', '#5ec8ff');
      this.burst(x, y, 0x5ec8ff, 5, 90, 250); Sfx.block();
      return;
    }
    b.flash = 0.07; b.spr.setTintFill(0xffffff);
    this.floatText(x, y - 10, '-' + n, n >= 6 ? '#ffd166' : '#ffffff');
    this.burst(x, y, 0xffffff, 6, 120, 300); Sfx.hit();
    if (this.mode === 'tutorial') return;         // o boneco de treino não perde vida
    b.hp = Math.max(0, b.hp - n);
    if (b.hp <= 0) this.killBoss();
  }

  killBoss() {
    const b = this.boss;
    b.alive = false; b.state = 'dead'; this.bossDefeated = true;
    for (const pr of this.projs) { pr.spr.destroy(); pr.sh.destroy(); }
    this.projs = [];
    this.shake(500, 0.02); Sfx.boom();
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * 180, () => this.burst(b.x + rnd(-30, 30), b.y + rnd(-30, 30), 0xffaa44, 14, 240, 600));
    this.tweens.add({ targets: [b.spr, b.sh], alpha: 0, duration: 900 });
    const t = this.add.text(W / 2, 300, 'DERROTADO', { fontFamily: FONT, fontSize: '48px', color: '#ffd166' })
      .setOrigin(0.5).setDepth(10002).setScrollFactor(0);
    this.tweens.add({ targets: t, alpha: 0, delay: 1300, duration: 600, onComplete: () => t.destroy() });
    // a porta ao norte se abre
    this.time.delayedCall(1800, () => {
      this.door.open = true; Sfx.door(); this.shake(250, 0.01);
      this.doorLabel.setText(this.bossIndex + 1 < BOSSES.length ? 'SEGUIR' : 'SAÍDA');
    });
  }

  updateDummy(dt) {
    const b = this.boss, p = this.p;
    // o boneco dispara devagar contra o jogador na estação de defesa, para treinar bloqueio e aparo
    const inZone = !p.dead && p.x >= TUT_ZONES[2].x && dist(b, p) < 420;
    this.dummyT -= dt;
    if (!inZone) this.dummyT = Math.max(this.dummyT, 0.9);
    else if (this.dummyT < 0.8) Tele.line(this.tele, b.x, b.y, angleTo(b, p), 320, 5, 1 - this.dummyT / 0.8);
    if (this.dummyT <= 0) {
      this.spawnProj(b.x, b.y, angleTo(b, p), 230, { tint: 0xff9a2e, r: 9 });
      this.dummyT = 3.6;
    }
  }

  updateBoss(dt) {
    const b = this.boss, p = this.p;
    if (!b.alive) return;
    if (b.flash > 0) { b.flash -= dt; if (b.flash <= 0) b.spr.clearTint(); }
    if (this.mode === 'tutorial') { this.updateDummy(dt); return; }
    if (!b.phase2 && b.hp <= b.maxHp * 0.5) {
      b.phase2 = true; this.shake(300, 0.015); Sfx.boom();
      this.floatText(b.x, b.y - b.r - 20, 'FÚRIA!', '#ff5577');
    }
    if (!b.phase3 && b.hp <= b.maxHp * 0.25) {
      b.phase3 = true; this.shake(350, 0.018); Sfx.boom();
      this.floatText(b.x, b.y - b.r - 20, 'FÚRIA MÁXIMA!', '#ff2244');
    }
    if (this.introT > 0 || p.dead) return;

    if (b.state === 'idle') {
      b.def.move(b, this, dt);
      b.cd -= dt;
      if (b.cd <= 0) this.startAttack(b);
      return;
    }
    const a = b.atk;
    b.t += dt;

    if (b.state === 'windup') {
      const wind = (b.rep > 0 && a.repWind) ? a.repWind : a.wind;
      if (!b.locked) {
        b.aim = angleTo(b, p); b.tx = p.x; b.ty = p.y;
        if (b.t >= wind * (a.lock ?? 0.6)) b.locked = true;
      }
      a.tele && a.tele(b, this, this.tele, Math.min(1, b.t / wind));
      if (b.t >= wind) {
        a.fire && a.fire(b, this);
        b.state = 'active'; b.t = 0; b.hitOnce = false;
      }
    } else if (b.state === 'active') {
      a.active && a.active(b, this, dt, Math.min(1, b.t / a.dur));
      if (a.contact && !b.hitOnce && dist(b, p) < b.r + p.r + 4) {
        b.hitOnce = true; this.damagePlayer({ x: b.x, y: b.y }, false);
      }
      if (b.t >= a.dur) {
        a.end && a.end(b, this);
        // a.repeat2: número de repetições na fase 2, se precisar de algo além do "+1" padrão
        const reps = a.repeat ? (b.phase2 && a.repeat2 != null ? a.repeat2 : a.repeat + (b.phase2 ? 1 : 0)) : 1;
        if (b.rep + 1 < reps) { b.rep++; b.state = 'windup'; b.t = 0; b.locked = false; }
        else { b.state = 'recover'; b.t = 0; }
      }
    } else if (b.state === 'recover') {
      if (b.t >= a.rec) {
        b.state = 'idle'; b.cd = rnd(b.def.cd[0], b.def.cd[1]) * (b.phase2 ? 0.75 : 1);
      }
    }
  }

  startAttack(b) {
    let opts = b.def.attacks.filter(a => !a.when || a.when(b, this));
    const alt = opts.filter(a => a !== b.lastAtk);
    if (alt.length) opts = alt;
    b.atk = Phaser.Utils.Array.GetRandom(opts); b.lastAtk = b.atk;
    b.state = 'windup'; b.t = 0; b.rep = 0; b.locked = false;
    b.atk.start && b.atk.start(b, this);
  }

  // ------------------------------------------------- dano / defesa / aparo
  damagePlayer(src, parriable) {
    const p = this.p;
    if (p.dead || p.invuln > 0) return 'miss';
    if (p.guard && this.spear.state === 'held' &&
        angleDiff(p.face, Math.atan2(src.y - p.y, src.x - p.x)) <= GUARD_HALF) {
      if (parriable && p.guardT <= CFG.parryWindow) {
        Sfx.parry(); this.hitstop = 0.08; this.shake(120, 0.006);
        this.floatText(p.x, p.y - 34, 'APARADO!', '#ffffff');
        this.burst(p.x + Math.cos(p.face) * 24, p.y + Math.sin(p.face) * 24, 0xffffff, 12, 200, 350);
        this.tutMark('parry');
        return 'parry';
      }
      if (p.armor > 0) {
        p.armor--; p.lastAction = this.now; p.regenT = 0; p.invuln = 0.15;
        Sfx.block(); this.shake(100, 0.005);
        this.burst(p.x + Math.cos(p.face) * 24, p.y + Math.sin(p.face) * 24, 0x8fd0ff, 8, 160, 300);
        if (p.armor === 0) this.floatText(p.x, p.y - 34, 'SEM ARMADURA!', '#ff5577');
        return 'block';
      }
    }
    this.killPlayer();
    return 'dead';
  }

  killPlayer() {
    const p = this.p;
    if (p.dead) return;
    if (this.mode === 'tutorial') {     // no treino ninguém morre: só um aviso
      p.invuln = 1.0; Sfx.die(); this.shake(150, 0.008);
      this.floatText(p.x, p.y - 60, 'Isso teria sido fatal!', '#ff5577');
      return;
    }
    p.dead = true; p.spr.setTint(0xff3355); Sfx.die();
    this.shake(300, 0.02); this.burst(p.x, p.y, 0xff3355, 24, 260, 700);
    this.time.delayedCall(1100, () => this.scene.start('End', { win: false, bossIndex: this.bossIndex }));
  }

  meleeHit(sh) {
    this.flashes.push({ ...sh, t: 0, dur: 0.2 });
    const p = this.p;
    if (dist(p, sh) > sh.r + p.r) return;
    if (sh.type === 'cone' && angleDiff(Math.atan2(p.y - sh.y, p.x - sh.x), sh.dir) > sh.half) return;
    this.damagePlayer({ x: sh.x, y: sh.y }, false);
  }

  // ---------------------------------------------------------- projéteis
  spawnProj(x, y, ang, speed, o = {}) {
    const tint = o.tint || 0xff4d7d;
    // o.anim: projétil com sprite próprio animado (ex.: bala do Cavaleiro); sem isso, usa o 'orb' genérico tingido
    const spr = o.anim ? this.add.sprite(x, y, o.tex || 'orb') : this.add.image(x, y, o.tex || 'orb');
    if (o.anim) spr.anims.play(o.anim); else spr.setTint(tint);
    this.projs.push({
      x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, r: o.r || 8, owner: 'boss', tint,
      age: 0, returnAfter: o.returnAfter || 0, reversed: false,
      spr, sh: this.add.image(x, y, 'shadow').setDepth(1).setScale(0.3, 0.25),
    });
  }

  updateProjs(dt) {
    const p = this.p, b = this.boss;
    for (const pr of this.projs) {
      pr.age += dt;
      // "vai e volta": passado o tempo, inverte a velocidade e refaz o caminho (só enquanto ainda é do boss)
      if (pr.returnAfter && !pr.reversed && pr.owner === 'boss' && pr.age >= pr.returnAfter) {
        pr.vx = -pr.vx; pr.vy = -pr.vy; pr.reversed = true;
      }
      pr.x += pr.vx * dt; pr.y += pr.vy * dt;
      if (pr.x < -40 || pr.x > W + 40 || pr.y < 60 || pr.y > this.worldH + 40) { pr.dead = true; continue; }
      if (pr.owner === 'boss') {
        if (dist(pr, p) < pr.r + p.r) {
          const res = this.damagePlayer({ x: pr.x, y: pr.y }, true);
          if (res === 'parry') {
            pr.owner = 'player'; pr.spr.setTint(0x5ee0ff);
            const a = angleTo(pr, b), sp = Math.hypot(pr.vx, pr.vy) * 1.5 + 100;
            pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp; pr.r = 10;
          } else if (res !== 'miss') pr.dead = true;
        }
      } else if (b.alive && dist(pr, b) < pr.r + b.r) {
        this.damageBoss(CFG.parryDmg, pr.x, pr.y);
        this.hitstop = 0.07; this.shake(150, 0.008);
        this.burst(pr.x, pr.y, 0x5ee0ff, 14, 220, 400);
        pr.dead = true;
      }
    }
    this.projs = this.projs.filter(pr => {
      if (pr.dead) { pr.spr.destroy(); pr.sh.destroy(); return false; }
      return true;
    });
  }

  // ---------------------------------------------------------- desenho
  render(dt) {
    const p = this.p, b = this.boss, s = this.spear, fx = this.fx;

    // jogador
    // lado do sprite: pelo movimento horizontal (só vertical mantém o lado); parado, olha para a mira
    const dashing = p.dashT > 0;
    const vx = dashing ? p.dashDX : p.mx, vy = dashing ? p.dashDY : p.my;
    const moving = !p.dead && Math.hypot(vx, vy) > 0.1;
    if (Math.abs(vx) > 0.1) p.side = vx > 0 ? 1 : -1;
    else if (!moving) p.side = Math.cos(p.face) >= 0 ? 1 : -1;
    // defesa: entrada -> loop enquanto segura -> saída ao soltar
    const held = s.state === 'held';
    if (p.guard && !p.dead) {
      if (p.gState !== 'on') {
        p.gState = 'on';
        p.spr.anims.play('guard_in'); p.spr.anims.chain('guard_loop');
      }
    } else if (p.gState === 'on') {
      if (p.dead || dashing || !held) p.gState = 'none';
      else { p.gState = 'out'; p.spr.anims.play('guard_out'); }
    } else if (p.gState === 'out' && (dashing || !p.spr.anims.isPlaying)) p.gState = 'none';

    if (p.gState !== 'none') {
      const cx = GUARD_SPR.cx[Number(p.spr.frame.name)] ?? 57;
      p.spr.setOrigin(cx / GUARD_SPR.frameW, 1).setFlipX(Math.cos(p.face) < 0);
    } else if (dashing) {
      // esquiva: 'roll' começa no primeiro quadro do dash e acompanha o deslocamento
      if (!p.rolling) { p.rolling = true; p.spr.anims.play('roll'); }
      const cx = ROLL_SPR.cx[Number(p.spr.frame.name)] ?? ROLL_SPR.cx[0];
      p.spr.setOrigin(cx / ROLL_SPR.frameW, 1).setFlipX(p.side < 0);
    } else {
      p.rolling = false;
      const cx = moving ? RUN_SPR.cx : IDLE_SPR.cx;
      p.spr.setOrigin(cx / RUN_SPR.frameW, 1).setFlipX(p.side < 0);
      p.spr.anims.play(moving ? 'run' : 'idle', true);   // parado: respira em loop, virado para a mira
    }
    // o sprite de defesa já desenha a lança; durante o rolamento ela fica recolhida
    s.spr.setVisible(!(held && (p.gState !== 'none' || dashing)));
    p.spr.setPosition(p.x, p.y + FEET).setDepth(p.y);
    // pisca na invencibilidade; some aos poucos ao entrar na porta
    let alpha = p.invuln > 0 ? 0.5 : 1;
    if (this.leaving) alpha = clamp((p.y - (this.arena.t - 70)) / 70, 0, 1);
    p.spr.setAlpha(alpha); p.sh.setAlpha(alpha);
    p.sh.setPosition(p.x, p.y + FEET - 2);

    // lança
    const flying = s.state === 'flying';
    s.spr.setPosition(s.x, s.y - (flying ? 14 : s.state === 'held' ? 4 : -2)).setRotation(s.angle).setDepth(s.y + 2);
    s.sh.setVisible(s.state !== 'held').setPosition(s.x, s.y + (flying ? 8 : 2));
    if (s.state !== 'held') {
      const pulse = 14 + Math.sin(this.now * 8) * 3;
      fx.lineStyle(2, 0xffd166, 0.5); fx.strokeCircle(s.x, s.y, pulse);
    }

    // guarda / carga
    if (p.guard) {
      const parry = p.guardT <= CFG.parryWindow;
      fx.lineStyle(parry ? 6 : 4, parry ? 0xffffff : 0x8fd0ff, parry ? 1 : 0.8);
      fx.beginPath(); fx.arc(p.x, p.y, 28, p.face - GUARD_HALF, p.face + GUARD_HALF); fx.strokePath();
    }
    if (p.charging) {
      fx.lineStyle(4, 0xffd166, 0.9);
      fx.beginPath(); fx.arc(p.x, p.y, 22, -Math.PI / 2, -Math.PI / 2 + p.charge * Math.PI * 2); fx.strokePath();
      fx.lineStyle(1, 0xffd166, 0.35);
      fx.lineBetween(p.x, p.y, p.x + Math.cos(p.face) * 300, p.y + Math.sin(p.face) * 300);
    }

    // boss / boneco
    const bob = b.alive && this.mode === 'boss' && !b.def.noBob ? Math.sin(this.now * 3) * 2 : 0;
    b.spr.setPosition(b.x, b.y - b.z + bob).setDepth(b.y + 1);
    if (b.def.tickSprite) b.def.tickSprite(b);   // ajustes por quadro (ex.: origem do Cavaleiro Sombrio)
    // deslocamento da sombra: padrão é (0, r*0.9), mas o boss pode sobrescrever (ex.: sprite já alinha os pés em b.y)
    b.sh.setPosition(
      b.x + (b.def.shadowX ? b.def.shadowX(b) : 0),
      b.y + (b.def.shadowY ? b.def.shadowY(b) : b.r * 0.9),
    );

    // projéteis
    for (const pr of this.projs) {
      pr.spr.setPosition(pr.x, pr.y).setDepth(pr.y + 2);
      pr.sh.setPosition(pr.x, pr.y + 12);
    }

    // clarões de golpes corpo a corpo
    this.flashes = this.flashes.filter(f => (f.t += dt) < f.dur);
    for (const f of this.flashes) {
      const a = 1 - f.t / f.dur;
      fx.fillStyle(0xffe08a, a * 0.55);
      if (f.type === 'circle') fx.fillCircle(f.x, f.y, f.r);
      else { fx.slice(f.x, f.y, f.r, f.dir - f.half, f.dir + f.half, false); fx.fillPath(); }
    }

    // porta: rótulo só aparece quando aberta
    this.drawDoor();
    this.doorLabel.setVisible(this.door.t > 0.6 && this.doorLabel.text !== '');
    this.drawUI(dt);
  }

  drawUI(dt) {
    const g = this.ui, b = this.boss, p = this.p, s = this.spear;
    g.clear();
    if (this.mode === 'boss') {   // barra de vida do boss
      const bx = 180, bw = 600, by = 42;
      b.ghost = Math.max(b.hp, b.ghost - b.maxHp * 0.25 * dt);
      g.fillStyle(0x000000, 0.7); g.fillRect(bx - 4, by - 4, bw + 8, 22);
      g.fillStyle(0x7a1f2b, 1); g.fillRect(bx, by, bw * b.ghost / b.maxHp, 14);
      g.fillStyle(b.phase2 ? 0xff7a3a : 0xe03a4e, 1); g.fillRect(bx, by, bw * b.hp / b.maxHp, 14);
      g.fillStyle(0xffffff, 0.35); g.fillRect(bx + bw / 2 - 1, by - 4, 2, 22);
    }

    // armadura
    for (let i = 0; i < CFG.armorMax; i++) {
      const x = 24 + i * 30, y = 552;
      if (i < p.armor) { g.fillStyle(0x4aa3df, 1); g.fillRoundedRect(x, y, 22, 24, 5); g.fillStyle(0xbfe6ff, 1); g.fillRoundedRect(x + 4, y + 4, 8, 8, 2); }
      else { g.lineStyle(2, 0x4aa3df, 0.4); g.strokeRoundedRect(x, y, 22, 24, 5); }
    }
    if (p.armor < CFG.armorMax && this.now - p.lastAction > CFG.armorRegenDelay) {
      g.fillStyle(0x4aa3df, 0.9); g.fillRect(24 + p.armor * 30, 580, 22 * (p.regenT / CFG.armorRegenTick), 3);
    }
    // esquiva
    g.fillStyle(0x000000, 0.6); g.fillRect(24, 532, 90, 8);
    g.fillStyle(p.dashCd > 0 ? 0x6d6788 : 0x8fd0ff, 1); g.fillRect(24, 532, 90 * (1 - p.dashCd / CFG.dashCd), 8);

    // barra de invencibilidade durante o rolamento (no mundo, sobre o jogador)
    if (p.invuln > 0 && !this.leaving) { this.fx.fillStyle(0x8fd0ff, 1); this.fx.fillRect(p.x - 14, p.y - 56, 28 * (p.invuln / CFG.dashInvuln), 3); }
    // aviso sem lança
    if (s.state !== 'held' && !p.dead) this.status.setText('SEM LANÇA — recolha!').setPosition(p.x, p.y - 60).setVisible(true);
    else this.status.setVisible(false);
  }
}
