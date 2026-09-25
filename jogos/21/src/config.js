// Constantes de balanceamento e utilidades. Tudo ajustável aqui.
const W = 960, H = 600;
const FONT = '"Press Start 2P", monospace';
const ARENA = { l: 50, r: 910, t: 150, b: 552 };

const CFG = {
  playerSpeed: 215, guardSpeedMul: 0.5, playerR: 12,
  dashTime: 0.32, dashSpeed: 560, dashCd: 1.0, dashInvuln: 0.36,   // i-frames cobrem todo o rolamento (a animação 'roll' se ajusta ao dashTime)
  chargeTime: 1.0,
  throwMinSpeed: 650, throwMaxSpeed: 1100, spearDecel: 700,
  spearMinDmg: 4, spearMaxDmg: 10,                                  // clique simples já é forte; carga é o golpe máximo
  ricochetDeg: 75,
  ricochetSpeedMin: 750, ricochetSpeedMax: 1150,                    // velocidade pós-ricochete (por carga)
  ricochetFullBonus: 1.15,                                          // bônus extra com carga total
  ricochetDecel: 450,                                               // desacelera menos => vai mais longe
  ricochetRehitMul: 0.5,                                            // dano de um segundo acerto após ricochetear
  wallBounce: 0.8,                                                  // velocidade mantida ao quicar na parede
  armorMax: 3, armorRegenDelay: 3.0, armorRegenTick: 1.0,
  guardHalfDeg: 70, parryWindow: 0.2, parryDmg: 6,
};
// Sprites do jogador (todos 120x80, virados para a direita; espelhados para a esquerda).
// Os pés ficam na base do quadro; cx = centro horizontal do corpo (por quadro no roll, que se desloca).
const PLAYER_SPR = { scale: 2 };
const RUN_SPR = { frameW: 120, frameH: 80, frames: 10, cx: 56, fps: 18 };
const IDLE_SPR = { frameW: 120, frameH: 80, frames: 10, cx: 54, fps: 12.5 };
const ROLL_SPR = { frameW: 120, frameH: 80, frames: 12, cx: [61, 62, 64, 64, 64, 63, 62, 65, 67, 61, 59, 58] };
// Defesa/aparo: 120x80, um só lado (direita; espelhado para a esquerda). Quadros (0-based):
// 0-1 entrada · 2-5 loop enquanto segura · 6-7 saída ao soltar. cx = centro do corpo em cada quadro
// (ajuste fino por quadro, para os pés ficarem fixos sobre a sombra).
const GUARD_SPR = { frameW: 120, frameH: 80, cx: [56, 55, 57, 57, 57, 57, 56, 56], fpsIn: 16, fpsLoop: 10, fpsOut: 12 };
// boss "O Gordo do Impacto": 6 poses fixas (sem animação contínua), assets/boss.png
const FB_SPR = { frameW: 385, frameH: 393 };
// lança (assets/lanca.png, 2172x724 nativo) reduzida pro tamanho de jogo (~80px de comprimento)
const SPEAR_SCALE = 80 / 2172;
// teste: tint lilás/roxo monocromático no cavaleiro
const KNIGHT_TINT = 0xb49ce8;
const FEET = 24;   // distância dos pés do sprite ao centro lógico do jogador (p.y)
const GUARD_HALF = Phaser.Math.DegToRad(CFG.guardHalfDeg);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angleTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const angleDiff = (a, b) => Math.abs(Phaser.Math.Angle.Wrap(a - b));

// SFX sintetizado (sem assets)
const Sfx = {
  ctx: null,
  play(freq, dur, type = 'square', vol = 0.05, slide = 0) {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), c.currentTime + dur);
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.connect(g).connect(c.destination);
      o.start(); o.stop(c.currentTime + dur);
    } catch (e) { /* áudio indisponível */ }
  },
  throw(ch) { this.play(300 + ch * 200, 0.18, 'sawtooth', 0.05, -180); },
  hit() { this.play(160, 0.15, 'square', 0.08, -100); },
  block() { this.play(500, 0.08, 'triangle', 0.08, -200); },
  parry() { this.play(900, 0.2, 'sine', 0.09, 500); },
  dash() { this.play(220, 0.12, 'sawtooth', 0.04, 260); },
  pick() { this.play(600, 0.08, 'triangle', 0.05, 200); },
  door() { this.play(110, 0.6, 'sawtooth', 0.06, 70); },
  boom() { this.play(90, 0.35, 'sawtooth', 0.09, -60); },
  die() { this.play(200, 0.7, 'sawtooth', 0.08, -170); },
};
