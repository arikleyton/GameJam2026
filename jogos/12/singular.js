/* Singular: sixth sector, ECO encounter, authored hazards and bounded enemy decisions. */
const Singular={
 finalLevel:{name:'O corpo que falta',color:0xe2a3ab,bg:0x190f1b,kind:'core',ground:[[0,720],[840,660],[1620,2040]],platforms:[[410,410,250],[690,320,350],[1090,410,240],[1390,410,390],[1950,410,260],[2240,320,220],[2470,410,250],[2770,320,260],[3090,410,190]],hazards:[[350,55],[1200,60]],relays:[[2080,410],[2350,320],[2890,320]],enemies:[['gume',530,410],['vigia',910,320],['forja',1200,410],['gume',1520,410]],goal:{data:3,keys:0,label:'ROMPA OS TRÊS CONDUTORES'},memory:[[['ECO','Esse corpo não pode sair daqui.'],['NILO','Ele nunca foi seu.']]],intro:'NÚCLEO — A parede de contenção está avançando. Atravesse as passarelas e alcance a câmara à direita.'},
 install(Sector){
  OUC.levels.push(this.finalLevel);
  // Spikes occupy exposed floor strips, never the interior of solid machinery.
  const placements=[[[1080,65]],[[1985,50]],[[1500,55]],[[1100,60],[2460,60]],[[2740,55]]];placements.forEach((h,i)=>OUC.levels[i].hazards=h);
  const p=Sector.prototype,old={};for(const k of ['create','reset','enemyAI','move','hit','retire','attack','update','drawEffects','renderActors','interact','gateReady','end','updateHUD','mainMenu','animateDeaths'])old[k]=p[k];
  p.create=function(){old.create.call(this);SMenu.attach(this)};
  p.reset=function(){this.finalEncounter=null;this.lifts=[];this.vents=[];old.reset.call(this);
   this.hazards=this.hazards.filter(h=>this.platforms.some(p=>p.y===500&&h.x>=p.x&&h.x+h.w<=p.x+p.w)&&!this.platforms.some(p=>p.solid&&p.y<500&&h.x<p.x+p.w&&h.x+h.w>p.x));
   this.navNodes=SNavigation.build(this.platforms,this.hazards);
   const liftSpecs=[[[1740,410,150,45]],[[2470,360,145,45]],[[1880,350,150,50]],[[1880,360,140,45]],[[1370,360,145,45]],[[1540,355,150,45]]];
   for(const [x,y,w,amp] of liftSpecs[this.levelIndex]||[]){const lift={x,y,w,h:16,solid:false,dynamic:true,baseY:y,amp};this.platforms.push(lift);this.lifts.push(lift)}
   const ventsByLevel=[[{x:2840,y:410,w:55}],[{x:1420,y:320,w:65}],[{x:1640,y:320,w:60}],[{x:1740,y:320,w:60}],[{x:2430,y:230,w:60}],[]];this.vents=(ventsByLevel[this.levelIndex]||[]).map((v,i)=>({...v,offset:i*1.7,active:false,warning:false}));
   for(const a of this.actors){a.think=(a.home%11)*.02;if(a.variant)a.sprite.setTexture(a.type+'-corrupt',0)}
   if(this.levelIndex===5){const b=this.spawn('eco',3260,500);b.hp=b.maxHp=480;b.possessable=false;b.hitWidth=38;b.hitHeight=94;b.sprite.setScale(1.3);this.boss=b;this.finalEncounter={stage:'chase',wall:-180,time:0,cooldown:2,attackTime:0,cycle:0,spawnTime:4,defeatTime:0};if(this.finalCheckpoint){this.player.x=1870;this.player.y=500;this.player.hp=this.player.maxHp;this.finalEncounter.stage='containment';this.finalEncounter.wall=1750;this.cameras.main.scrollX=1490;this.actors.filter(a=>!a.controlled&&a.type!=='eco').forEach(a=>{a.alive=false;a.sprite.setVisible(false)})}}
   this.drawWorld();this.updateHUD();
  };
  p.enemyAI=function(a,dt){if(a.type==='eco'){a.vx=0;return}if(Math.abs(a.x-this.player.x)>1100&&!(a.alert>0)){a.vx=0;return}
   old.enemyAI.call(this,a,dt);if(a.type==='turret')return;
   if(a.windup>0||a.rush>0)return;
   SNavigation.steer(this,a,dt);if(a.awake)a.face=this.player.x<a.x?-1:1;
  };
  p.attack=function(a){if(a.type==='eco')return;if(!a.controlled&&!SNavigation.clear(this,a,this.player)){a.windup=0;a.aiCooldown=.35;return}old.attack.call(this,a)};
  p.move=function(a,dt){if(a.type==='eco'){a.y=500;return}old.move.call(this,a,dt);if(this.finalEncounter&&this.finalEncounter.stage!=='chase'&&a.controlled&&this.boss?.alive)a.x=Math.max(1820,Math.min(3400,a.x))};
  p.hit=function(a,damage,killer){if(a.type==='eco'&&this.finalEncounter?.stage!=='duel'){if(killer?.controlled&&this.clock>(this.shieldHint||0)){this.shieldHint=this.clock+3;this.say('ECO ESTÁ VINCULADA · use E nos três condutores elevados.',3)}return}
   if(!a.controlled&&a.type!=='turret'){a.alert=8;a.think=0}
   const was=this.player;old.hit.call(this,a,damage,killer);if(was!==this.player){this.player.sprite.setTexture(this.player.type,0);this.player.navAir=undefined;this.player.navNext=null}
  };
  p.retire=function(a){old.retire.call(this,a);if(a.type==='eco'){const d=this.deaths.at(-1);if(d)d.scale=1.3;this.finalEncounter.stage='defeated';this.finalEncounter.defeatTime=0;this.shots=[];this.grenades=[];this.waves=[];this.say('VÍNCULO ROMPIDO · alcance seu corpo na cápsula à direita. E para recuperar.',10);for(const other of this.actors)if(other!==a&&!other.controlled&&other.alive)old.retire.call(this,other)}};
  p.animateDeaths=function(dt){old.animateDeaths.call(this,dt);for(const d of this.deaths)if(d.actor.type==='eco')d.actor.sprite.setFrame(12+Math.min(3,Math.floor(d.time*2))).setRotation(0).setScale(1.3);const expired=this.actors.filter(a=>!a.alive&&a.deathProgress>=1);for(const a of expired){a.sprite.destroy();a.roleLabel?.destroy();}if(expired.length){const sprites=new Set(expired.map(a=>a.sprite));this.corpses=this.corpses.filter(c=>!sprites.has(c));this.actors=this.actors.filter(a=>!expired.includes(a));}};
  p.gateReady=function(){if(this.levelIndex===5)return this.finalEncounter?.stage==='defeated';return old.gateReady.call(this)};
  p.interact=function(){if(this.levelIndex!==5)return old.interact.call(this);const f=this.finalEncounter;
   if(f.stage==='containment'){for(const r of this.relays){if(r.on||Math.abs(this.player.x-r.x)>60||Math.abs(this.player.y-r.y)>55)continue;r.on=true;this.accessData++;this.burst(r.x,r.y-28,0xe4a0ab,22);SFX.play('terminal',r.x);this.say('CONDUTOR ROMPIDO · '+this.accessData+'/3',4);if(this.accessData===3){f.stage='duel';f.cooldown=1.5;this.shots=[];this.boss.invuln=.7;this.say('ECO EXPOSTA · observe o aviso antes de cada ataque. Autômatos ainda podem receber sua consciência.',7)}this.drawWorld();return}}
   if(this.player.x>3450&&f.stage==='defeated')this.end(true);
  };
  p.end=function(win,reason){if(win&&this.levelIndex===5){this.state='complete';this.mouseAim.down=false;ui.overlay.style.display='flex';ui.eyebrow.textContent='SINGULAR · SINAL LIBERADO';ui.title.textContent='Uma vida sua.';ui.story.innerHTML='A instalação deixa de responder a ECO.<br>Nilo encontra o próprio corpo ainda respirando.<br><br>O sinal azul atravessa o vidro. Pela primeira vez, o próximo movimento é só dele.';ui.brief.style.display='none';ui.button.disabled=false;ui.button.innerHTML='VOLTAR AO MENU';ui.hint.textContent='Seis setores concluídos · obrigado por jogar Singular.';document.querySelector('#upgrades').innerHTML='';this.rewardPending=false;this.finalCheckpoint=false;return}old.end.call(this,win,reason)};
  p.mainMenu=function(){this.finalCheckpoint=false;old.mainMenu.call(this);ui.title.textContent='SINGULAR'};
  p.updateHUD=function(){old.updateHUD.call(this);if(this.levelIndex===5&&this.finalEncounter){const f=this.finalEncounter;this.objective.setText('06/06 · O CORPO QUE FALTA\n\n'+({chase:'FUJA DA CONTENÇÃO →',containment:'CONDUTORES '+this.accessData+'/3',duel:'ECO · '+Math.ceil(this.boss.hp)+' / '+this.boss.maxHp,defeated:'RECUPERE SEU CORPO →'})[f.stage]);if(f.stage==='duel'){this.hud.fillStyle(0x3b2634);this.hud.fillRect(700,92,370,6);this.hud.fillStyle(0xeeb0b0);this.hud.fillRect(700,92,370*this.boss.hp/this.boss.maxHp,6)}}};
  p.tickECO=function(dt){const f=this.finalEncounter,b=this.boss;if(!f)return;f.time+=dt;
   if(f.stage==='chase'){f.wall+=65*dt;if(this.player.x<f.wall+26)this.hit(this.player,18,b);if(this.player.x>=1830){f.stage='containment';f.wall=1750;this.finalCheckpoint=true;this.player.hp=Math.min(this.player.maxHp,this.player.hp+25);this.say('CHECKPOINT · rompa os três condutores com E. ECO está protegida; use os autômatos para trocar de corpo.',9)}return}
   if(f.stage==='defeated'){f.defeatTime+=dt;return}
   f.spawnTime-=dt;const minions=this.actors.filter(a=>a.alive&&!a.controlled&&a.type!=='eco'&&a.x>1800);
   if(f.spawnTime<=0&&minions.length<3){const type=['gume','vigia','prisma'][f.cycle%3],x=this.player.x<2600?3040:1990;const a=this.spawn(type,x,500);a.alert=10;a.aiCooldown=1.5;a.invuln=.5;f.spawnTime=f.stage==='duel'?12:9;this.burst(x,465,0xd79ea4,18)}
   if(f.attackTime>0){f.attackTime-=dt;if(f.attackTime<=0){const q=this.player;
     if(f.kind==='sweep'){if(q.y>466&&q.x>1840&&q.x<3400)this.hit(q,24,b);f.flash=.25}
     else{const count=f.kind==='fan'?5:3,dx=f.aimX-b.x,dy=f.aimY-(b.y-90),angle=Math.atan2(dy,dx);for(let i=0;i<count;i++){const ang=angle+(i-(count-1)/2)*.14;this.shots.push({x:b.x-28,y:b.y-90,vx:Math.cos(ang)*290,vy:Math.sin(ang)*290,life:4,owner:b,team:false,damage:f.stage==='duel'?17:12})}}
     f.cooldown=f.stage==='duel'?(b.hp<b.maxHp*.5?1.15:1.65):2.2;f.cycle++;
    }return}
   f.flash=Math.max(0,(f.flash||0)-dt);f.cooldown-=dt;
   if(f.stage==='duel'){const dx=this.player.x-b.x;b.face=dx<0?-1:1;b.x=Math.max(2050,Math.min(3320,b.x+Math.sign(dx)*(Math.abs(dx)>170?50:0)*dt));}
   if(f.cooldown<=0){f.kind=f.stage==='duel'&&f.cycle%3===2?'sweep':'fan';f.aimX=this.player.x;f.aimY=this.player.y-25;f.attackTime=f.kind==='sweep'?1.25:1;this.say(f.kind==='sweep'?'ECO · VARREDURA BAIXA — salte ou suba numa plataforma.':'ECO · PULSO DIRECIONADO — saia da linha marcada.',2)}
  };
  p.update=function(time,delta){const dt=Math.min(delta/1000,.035);if(this.state==='play'){
    for(const lift of this.lifts||[]){const prior=lift.y;lift.y=lift.baseY+Math.sin(this.elapsed*.9)*lift.amp;for(const a of this.actors)if(a.alive&&a.ground&&a.support===lift)a.y+=lift.y-prior}
    for(const vent of this.vents||[]){const t=(this.elapsed+vent.offset)%5.8;vent.warning=t>3.1&&t<4;vent.active=t>=4&&t<5.1;if(vent.active&&this.player.x>vent.x&&this.player.x<vent.x+vent.w&&this.player.y<=vent.y+3&&this.player.y>vent.y-85)this.hit(this.player,12,null)}
    this.tickECO(dt);
   }old.update.call(this,time,delta);if(this.state==='play'&&this.levelIndex===5){for(const r of this.relays)if(!r.on&&Math.abs(r.x-this.player.x)<100&&Math.abs(r.y-this.player.y)<65)this.prompt.setText(this.keyLabel('interact')+' · ROMPER CONDUTOR')}
   SMenu.update(this,dt);
  };
  p.renderActors=function(dt){old.renderActors.call(this,dt);for(const a of this.actors){if(!a.alive)continue;const texture=a.variant?a.type+'-corrupt':a.type;if(a.sprite.texture?.key!==texture)a.sprite.setTexture(texture,a.sprite.frame?.name||0);if(a.variant)a.sprite.clearTint();if(a.type==='eco'){a.sprite.setScale(1.3).setFlipX(a.face>0).clearTint();a.sprite.setFrame(this.finalEncounter?.attackTime>0?8+Math.floor(this.clock*6)%4:Math.floor(this.clock*3)%4)}}};
  p.drawEffects=function(dt){old.drawEffects.call(this,dt);const g=this.effects;
   for(const lift of this.lifts||[]){g.fillStyle(0x2e454f);g.fillRect(lift.x,lift.y,lift.w,16);g.fillStyle(0xa6dddd);g.fillRect(lift.x,lift.y,lift.w,4);g.lineStyle(2,0x6a8f96,.4);g.lineBetween(lift.x+lift.w/2,lift.baseY-lift.amp-15,lift.x+lift.w/2,lift.baseY+lift.amp+45)}
   for(const v of this.vents||[]){g.fillStyle(v.active?0xff8e89:v.warning?0xffd590:0x415361);g.fillRect(v.x,v.y-5,v.w,5);for(let n=0;n<5;n++){g.fillStyle(v.active?0xe9afa8:0x101b27,v.active?.65:1);g.fillRect(v.x+n*v.w/5+3,v.y-(v.active?70:4),4,v.active?65:4)}if(v.warning){g.lineStyle(1,0xe8a384,.7);g.strokeRect(v.x,v.y-80,v.w,76)}}
   const f=this.finalEncounter,b=this.boss;if(!f)return;
   if(f.stage==='chase'){g.fillStyle(0x9d5364,.3);g.fillRect(f.wall-25,112,25,388);g.lineStyle(4,0xf2b0b8);g.lineBetween(f.wall,112,f.wall,500)}
   if(f.stage==='containment'){g.lineStyle(2,0xf2b5bc,.5);g.strokeEllipse(b.x,b.y-72,150,175);for(const r of this.relays)if(!r.on)g.lineBetween(r.x,r.y-40,b.x,b.y-70)}
   if(f.attackTime>0){g.lineStyle(2,0xf6a7b0,.7);if(f.kind==='sweep'){g.strokeRect(1840,472,1560,26)}else if(f.kind==='fan')g.lineBetween(b.x,b.y-55,f.aimX,f.aimY)}
   if(f.flash>0){g.fillStyle(0xf8b9ad,.7);g.fillRect(1840,474,1560,20)}
   if(f.stage!=='chase'&&b.alive){g.fillStyle(0x3b2533,.9);g.fillRect(1796,310,18,190)}
   // Nilo's body capsule remains visibly distinct from the exit gate.
   g.fillStyle(0x06131b);g.fillRect(3495,319,115,178);g.lineStyle(3,0x8bd3d0);g.strokeRect(3495,319,115,178);g.fillStyle(0xc0b09e,.65);g.fillRect(3540,340,23,25);g.fillStyle(0x66848a,.8);g.fillRect(3530,368,43,75);g.fillRect(3532,444,13,46);g.fillRect(3557,444,13,46);
  };
 }
};
