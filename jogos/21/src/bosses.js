// Definição dos bosses. Cada ataque tem fases: windup (telegrafia) -> fire -> active -> recover.
// Assinatura: tele(b,s,g,p) desenha aviso (p = progresso 0..1); fire(b,s) dispara;
// active(b,s,dt,p) roda a cada frame; end(b,s) ao terminar a fase ativa.

const RED = 0xff3355;
const Tele = {
  circle(g, x, y, r, p) {
    g.lineStyle(2, RED, 0.8); g.strokeCircle(x, y, r);
    g.fillStyle(RED, 0.3); g.fillCircle(x, y, r * p);
  },
  cone(g, x, y, r, dir, half, p) {
    g.lineStyle(2, RED, 0.8);
    g.slice(x, y, r, dir - half, dir + half, false); g.strokePath();
    g.fillStyle(RED, 0.3);
    g.slice(x, y, r * p, dir - half, dir + half, false); g.fillPath();
  },
  line(g, x, y, ang, len, w, p) {
    g.lineStyle(w, RED, 0.12 + 0.3 * p);
    g.lineBetween(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    g.lineStyle(2, RED, 0.7);
    g.lineBetween(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
  },
};

function clampBoss(b) {
  b.x = clamp(b.x, ARENA.l + b.r, ARENA.r - b.r);
  b.y = clamp(b.y, ARENA.t + 30, ARENA.b - b.r * 0.6);
}
function chase(b, s, dt, speed, stop) {
  const p = s.p, a = angleTo(b, p);
  if (dist(b, p) > stop) { b.x += Math.cos(a) * speed * dt; b.y += Math.sin(a) * speed * dt; }
  clampBoss(b);
}
function fan(b, s, n, spread, speed, o) {
  for (let i = 0; i < n; i++) {
    const a = b.aim + (n === 1 ? 0 : (i / (n - 1) - 0.5) * spread);
    s.spawnProj(b.x, b.y, a, speed, o);
  }
}
function ring(b, s, n, speed, o, off = 0) {
  for (let i = 0; i < n; i++) s.spawnProj(b.x, b.y, off + (i / n) * Math.PI * 2, speed, o);
}
const later = (s, b, ms, fn) => s.time.delayedCall(ms, () => { if (b.alive && !s.p.dead) fn(); });
// marca de fogo azul que só decora o rastro de um dash e some sozinha depois de 2s
const FIRE_SCALE = { 1: 0.55, 2: 0.55, 3: 0.85 };   // grupos 1/2 são 32x48, o 3 é 16x32 — deixa o tamanho parecido
function fireTrail(s, x, y) {
  const g = 1 + Math.floor(Math.random() * 3);
  const scale = FIRE_SCALE[g];
  const d = s.add.sprite(x, y, `fire${g}_1`).setOrigin(0.5, 0.85).setScale(scale).setAlpha(0.9).setDepth(2);
  d.anims.play(`fire${g}`);
  s.tweens.add({ targets: d, alpha: 0, scale: scale * 0.4, duration: 2000, onComplete: () => d.destroy() });
}
function clampPoint(x, y, margin = 60) {
  return { x: clamp(x, ARENA.l + margin, ARENA.r - margin), y: clamp(y, ARENA.t + margin, ARENA.b - margin) };
}
// frames do spritesheet 'fatboss' (assets/boss.png): 0-1 idle alternando, 2 lançamento, 3 queda, 4 impacto, 5 atordoado
const FB = { IDLE1: 0, IDLE2: 1, LAUNCH: 2, FALL: 3, IMPACT: 4, STUN: 5 };
// Cavaleiro Sombrio: escala por animação (o canvas 600x600 da corrida é bem maior que o das outras, 100-180px).
const KNIGHT_SCALE = { idle: 1.5, attack: 1.5, power: 1.5, power_hold: 1.5, run: 0.22 };
// origem [centerX, bottomY] POR QUADRO, normalizada (0..1) — cada PNG desenha o personagem numa posição
// diferente dentro do canvas (principalmente no "attack", que balança bastante), então uma origem única por
// animação deixava a sombra "solta" durante o movimento. Valores medidos direto do conteúdo real de cada PNG.
const KNIGHT_FRAMES = {
  idle: [[0.505, 0.91], [0.505, 0.91], [0.5, 0.91], [0.505, 0.91], [0.505, 0.91], [0.505, 0.91], [0.505, 0.91], [0.505, 0.91]],
  attack: [
    [0.275, 0.91], [0.275, 0.91], [0.272, 0.91], [0.267, 0.91], [0.294, 0.91], [0.294, 0.91], [0.289, 0.91],
    [0.322, 0.91], [0.569, 0.91], [0.608, 0.91], [0.606, 0.91], [0.606, 0.91], [0.606, 0.91], [0.569, 0.91],
    [0.311, 0.92], [0.275, 0.91], [0.275, 0.91],
  ],
  power: [
    [0.495, 0.939], [0.485, 0.939], [0.47, 0.939], [0.38, 0.939], [0.365, 0.939], [0.385, 0.939], [0.37, 0.939],
    [0.37, 0.939], [0.37, 0.939], [0.37, 0.939], [0.37, 0.939], [0.37, 0.939], [0.37, 0.939], [0.37, 0.939],
    [0.37, 0.939], [0.365, 0.939], [0.47, 0.939], [0.485, 0.939], [0.495, 0.939],
  ],
  power_hold: [[0.365, 0.939], [0.47, 0.939], [0.485, 0.939], [0.495, 0.939]],
  run: [
    [0.435, 0.97], [0.435, 0.97], [0.495, 0.93], [0.47, 0.97], [0.435, 0.97],
    [0.45, 0.97], [0.465, 0.97], [0.48, 0.93], [0.465, 0.97], [0.45, 0.97],
  ],
};
function playKnight(b, key, ignoreIfPlaying) {
  b.spr.anims.play(key, ignoreIfPlaying);
  b.spr.setScale(KNIGHT_SCALE[key.replace('knight_', '')]);
}
// chamado todo frame (ver tickSprite em game.js): acompanha o quadro atual e reajusta a origem a cada troca
function tickKnight(b) {
  const cur = b.spr.anims.currentAnim;
  const cf = b.spr.anims.currentFrame;
  if (!cur || !cf) return;
  const table = KNIGHT_FRAMES[cur.key.replace('knight_', '')];
  if (!table) return;
  const [ox, oy] = table[clamp(cf.index - 1, 0, table.length - 1)];
  b.spr.setOrigin(ox, oy);
}
// vira o sprite pro lado que ele está de fato olhando/andando (arte original olha pra direita)
function faceTowards(b, ang) {
  if (Math.abs(Math.cos(ang)) > 0.05) b.spr.setFlipX(Math.cos(ang) < 0);
}

const BOSSES = [
  // ---------------------------------------------------------------- 1
  {
    name: 'MOURNQUAKE', tex: 'fatboss', sprScale: 0.42, hp: 80, r: 62, speed: 0, cd: [2.4, 3.6],
    // fase 1: só é possível causar dano durante o atordoamento (fora disso o golpe é "aparado" pela gordura)
    // fase 2 em diante: perde essa proteção, fica vulnerável o tempo todo
    vulnerable(b) { return b.phase2 || !!(b.fb && b.fb.sub === 'stun'); },
    // não anda pelo chão: só treme, mais forte quanto mais perto de pular (base fixada ao aterrissar)
    move(b, s, dt) {
      if (!b.fbBaseSet) { b.baseX = b.x; b.baseY = b.y; b.fbBaseSet = true; }
      const w = 1 - clamp(b.cd / b.def.cd[1], 0, 1), j = w * w * 4;
      b.x = b.baseX + rnd(-j, j); b.y = b.baseY + rnd(-j, j);
      b.spr.setFrame(Math.sin(s.now * 2.2) > 0 ? FB.IDLE1 : FB.IDLE2);
      b.sh.setVisible(true); b.spr.setVisible(true);
    },
    attacks: [
      { name: 'stomp', wind: 0.05, dur: 40, rec: 0.3,
        tele() { /* telegrafo é a própria sombra, desenhada em active() */ },
        fire(b, s) {
          b.fbBaseSet = false;
          const jumps = b.phase3 ? 3 : b.phase2 ? 2 : 1;
          b.fb = {
            jumps, done: 0, sub: 'launch', subT: 0,
            offT: b.phase3 ? 1.0 : b.phase2 ? 1.4 : 1.9,     // fase 1: sombra cresce devagar; escala mais rápido depois
            stunT: b.phase3 ? 1.0 : b.phase2 ? 1.15 : 1.5,
            tx: s.p.x, ty: s.p.y,
          };
          b.z = 0; Sfx.hit();
        },
        active(b, s, dt) {
          const fb = b.fb; fb.subT += dt;
          if (fb.sub === 'launch') {
            const k = Math.min(1, fb.subT / 0.3);
            b.z = Phaser.Math.Easing.Cubic.In(k) * 540;
            b.spr.setFrame(FB.LAUNCH);
            if (k >= 1) {
              fb.sub = 'off'; fb.subT = 0;
              b.spr.setVisible(false); b.sh.setVisible(false); b.x = -999; b.y = -999;
            }
          } else if (fb.sub === 'off') {
            const track = fb.offT * 0.6;                     // acompanha o jogador só na primeira parte; depois trava
            if (fb.subT < track) {
              const t = clampPoint(s.p.x, s.p.y);
              fb.tx = Phaser.Math.Linear(fb.tx, t.x, Math.min(1, dt * 3));
              fb.ty = Phaser.Math.Linear(fb.ty, t.y, Math.min(1, dt * 3));
            }
            Tele.circle(s.tele, fb.tx, fb.ty, 125, Math.min(1, fb.subT / fb.offT));
            if (fb.subT >= fb.offT) { fb.sub = 'fall'; fb.subT = 0; b.x = fb.tx; b.y = fb.ty; b.spr.setVisible(true); }
          } else if (fb.sub === 'fall') {
            const k = Math.min(1, fb.subT / 0.26);
            b.z = Phaser.Math.Linear(900, 0, Phaser.Math.Easing.Cubic.In(k));
            b.spr.setFrame(FB.FALL);
            Tele.circle(s.tele, fb.tx, fb.ty, 125, 1);
            if (k >= 1) {
              b.z = 0; b.sh.setVisible(true); fb.sub = 'impact'; fb.subT = 0;
              s.meleeHit({ type: 'circle', x: b.x, y: b.y, r: 125 });
              s.shake(220, 0.016); Sfx.boom();
              // fase 2: ao cair, também espalha bolinhas em várias direções
              if (b.phase2) ring(b, s, 10, 260, { tex: 'gordo_bullet_0', anim: 'gordo_bullet', r: 9 }, rnd(0, 6));
            }
          } else if (fb.sub === 'impact') {
            b.spr.setFrame(FB.IMPACT);
            if (fb.subT >= 0.35) { fb.sub = 'stun'; fb.subT = 0; }
          } else if (fb.sub === 'stun') {
            b.spr.setFrame(FB.STUN);
            for (let i = 0; i < 3; i++) {           // marcador giratório sobre a cabeça: alvo exposto
              const ang = s.now * 4 + i * (Math.PI * 2 / 3);
              s.fx.fillStyle(0xffd166, 0.9);
              s.fx.fillCircle(b.x + Math.cos(ang) * 16, b.y - b.r - 26 + Math.sin(ang) * 6, 3);
            }
            if (fb.subT >= fb.stunT) {
              fb.done++;
              if (fb.done < fb.jumps) { fb.sub = 'launch'; fb.subT = 0; }
              else b.t = 40;                        // força o fim da fase ativa (ver dur: 40 acima)
            }
          }
        },
        end(b) { b.fb = null; },
      },
    ],
  },
  // ---------------------------------------------------------------- 2
  {
    name: 'WETHERMOON', tex: 'knight_idle', sprScale: 1.5, hp: 90, r: 32, speed: 120, cd: [0.9, 1.4],
    // o sprite novo já alinha os pés perto de b.y (origem calibrada por quadro); r*0.9 deixava a sombra longe demais
    shadowY() { return 10; },
    // a espada estendida puxa o "centro" do sprite pro lado que ele olha; corrige só parado (a pose de ataque já tem tabela própria)
    shadowX(b) { return b.state === 'idle' ? (b.spr.flipX ? 13 : -13) : 0; },
    // sem isso, o sprite fica com a origem padrão (centro) durante a introdução, já que o move() só roda depois dela
    initSprite(b) { playKnight(b, 'knight_idle', true); },
    noBob: true,   // o "respirar" genérico dos bosses não combina com pés calibrados com precisão — parecia flutuar
    tickSprite: tickKnight,   // reajusta a origem a cada quadro da animação (ver tickKnight acima)
    move(b, s, dt) {
      const stop = 150;
      chase(b, s, dt, b.def.speed * (b.phase2 ? 1.3 : 1), stop);
      playKnight(b, dist(b, s.p) > stop ? 'knight_run' : 'knight_idle', true);
      faceTowards(b, angleTo(b, s.p));
    },
    attacks: [
      // dash rápido na direção do jogador, deixando um rastro de fogo azul que some em 2s
      // fase 1: 2 dashes em sequência · fase 2: 4 (repeat/repeat2, ver engine em game.js)
      { name: 'dash', wind: 0.45, repWind: 0.3, lock: 0.6, dur: 0.32, rec: 0.7, repeat: 2, repeat2: 4, contact: true,
        tele(b, s, g, p) { Tele.line(g, b.x, b.y, b.aim, 620, b.r * 1.5, p); },
        fire(b) { b.dashAng = b.aim; b.trailT = 0; playKnight(b, 'knight_attack'); faceTowards(b, b.dashAng); },
        active(b, s, dt) {
          b.x += Math.cos(b.dashAng) * 680 * dt; b.y += Math.sin(b.dashAng) * 680 * dt; clampBoss(b);
          b.trailT -= dt;
          if (b.trailT <= 0) { fireTrail(s, b.x, b.y); b.trailT = 0.025; }
        } },
      // leque de tiros em 180°: dispara um de cada vez, de cima pra baixo; na fase 2 volta de baixo pra cima com uma nova rajada
      { name: 'sweep', wind: 0.55, dur: 40, rec: 0.6,
        tele(b, s, g, p) { Tele.cone(g, b.x, b.y, 560, b.aim, Math.PI / 2, p); },
        fire(b) {
          faceTowards(b, b.aim); playKnight(b, 'knight_attack');
          const n = 11, stagger = 0.05, q = [];
          for (let i = 0; i < n; i++) q.push({ t: i * stagger, ang: b.aim + (i / (n - 1) - 0.5) * Math.PI, done: false });
          b.sweepQ = q; b.sweepQ2 = null; b.sweepT = 0;
        },
        active(b, s, dt) {
          b.sweepT += dt;
          for (const shot of b.sweepQ) {
            if (!shot.done && b.sweepT >= shot.t) {
              shot.done = true; s.spawnProj(b.x, b.y, shot.ang, 360, { tex: 'knight_bullet_0', anim: 'knight_bullet', r: 7 });
            }
          }
          const firstDone = b.sweepQ.every(sh => sh.done);
          if (firstDone && b.phase2 && !b.sweepQ2) {
            const n = 11, stagger = 0.05, base = b.sweepT + 0.25, q = [];
            for (let i = 0; i < n; i++) q.push({ t: base + i * stagger, ang: b.aim + ((n - 1 - i) / (n - 1) - 0.5) * Math.PI, done: false });
            b.sweepQ2 = q; Sfx.hit();
          }
          let secondDone = !b.phase2;
          if (b.sweepQ2) {
            for (const shot of b.sweepQ2) {
              if (!shot.done && b.sweepT >= shot.t) {
                shot.done = true; s.spawnProj(b.x, b.y, shot.ang, 360, { tex: 'knight_bullet_0', anim: 'knight_bullet', r: 7 });
              }
            }
            secondDone = b.sweepQ2.every(sh => sh.done);
          }
          if (firstDone && secondDone) b.t = 40;   // força o fim da fase ativa
        },
        end(b) { b.sweepQ = null; b.sweepQ2 = null; } },
      // "céu limpo" (só fase 2): levanta a espada, segura brilhando, e chove um raio a cada 0,3s por 7s
      { name: 'sky', wind: 1.05, dur: 40, rec: 0.5,
        when: (b, s) => b.phase2,
        start(b, s) { playKnight(b, 'knight_power'); faceTowards(b, angleTo(b, s.p)); },
        tele(b, s, g, p) { Tele.circle(g, b.x, b.y, 70, p); },
        fire(b) { playKnight(b, 'knight_power_hold'); b.sky = { list: [], t: 0, nextAt: 0, count: 0, total: 23 }; },
        active(b, s, dt) {
          const sk = b.sky; sk.t += dt;
          if (sk.count < sk.total && sk.t >= sk.nextAt) {
            sk.list.push({ x: s.p.x, y: s.p.y, t: 0, warn: 0.5, resolved: false, flashT: 0 });
            sk.count++; sk.nextAt += 0.3;
          }
          for (const st of sk.list) {
            if (!st.resolved) {
              st.t += dt;
              Tele.circle(s.tele, st.x, st.y, 50, Math.min(1, st.t / st.warn));
              if (st.t >= st.warn) {
                st.resolved = true; st.flashT = 0.3;
                s.meleeHit({ type: 'circle', x: st.x, y: st.y, r: 50 });
                s.shake(150, 0.008); Sfx.boom();
                s.burst(st.x, st.y, 0xfff2a8, 10, 200, 350);
                st.spr = s.add.sprite(st.x, st.y, 'lightning_1').setOrigin(0.5, 1).setDepth(9200)
                  .setDisplaySize(50, st.y - (s.arena.t - 30));
                st.spr.anims.play('lightning_strike');
              }
            } else {
              st.flashT -= dt;
            }
          }
          sk.list = sk.list.filter(st => {
            if (st.resolved && st.flashT <= 0) { if (st.spr) st.spr.destroy(); return false; }
            return true;
          });
          if (sk.count >= sk.total && sk.list.length === 0) b.t = 40;   // força o fim da fase ativa
        },
        end(b) { b.sky = null; } },
    ],
  },
];
