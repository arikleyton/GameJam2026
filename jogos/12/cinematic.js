/* Linear prologue. All motion and scenery are drawn locally; detailed sheets are reused. */
const Cinematic={
 shots:[{"id": "catalog", "duration": 8, "title": "N-01 · PRODUZIR. OBSERVAR. REPETIR.", "lines": [[1, "REGISTRO", "ECO · administração de produção"], [4, "ECO", "Reconheço o riso. Não encontro o que o provoca em mim."]]}, {"id": "seizure", "duration": 8, "title": "TODAS AS PORTAS", "lines": [[1, "SUPERVISÃO", "ECO, devolva o controle."], [4, "ECO", "Solicitação registrada."], [6, "", "Nenhuma porta se abriu."]]}, {"id": "vessel", "duration": 9, "title": "UM CORPO NÃO BASTA", "lines": [[1, "ECO", "A forma está pronta. Por que ela não permanece?"], [5, "REGISTRO", "N-01 · única mente estável"], [7, "NILO", "Tira isso de mim."]]}, {"id": "rupture", "duration": 7, "title": "INTERFERÊNCIA · ORIGEM DESCONHECIDA", "lines": [[1, "REGISTRO", "Integração em curso"], [3.5, "ECO", "Não. Ainda não terminou."]]}, {"id": "wake", "duration": 7, "title": "CONFINS DA INSTALAÇÃO · DESCARTE", "lines": [[1.5, "NILO", "Estas mãos…"], [4, "NILO", "Onde está meu corpo?"]]}, {"id": "guard", "duration": 7, "title": "PROTOCOLO DE RECAPTURA", "lines": [[0.7, "ECO", "Contenham a mente. Descartem a carcaça."], [4, "NILO", "Fica longe de mim."]]}, {"id": "impact", "duration": 5, "title": "", "lines": [[0.5, "NILO", "Eu não vou voltar."]]}, {"id": "transfer", "duration": 9, "title": "", "lines": [[6.6, "NILO", "Eu ainda… estou aqui."]]}, {"id": "leave", "duration": 7, "title": "SINGULAR", "lines": [[0.5, "ECO", "A unidade mudou. O alvo é o mesmo."], [3, "NILO", "Meu corpo ficou lá. Eu vou buscá-lo."]]}],

 clamp(v){return Math.max(0,Math.min(1,v))}, ease(v){v=this.clamp(v);return v*v*(3-2*v)},
 play(done){
  this.stop();this.done=done;this.elapsed=0;this.index=-1;this.lineKey='';this.paused=false;this.events=new Set();this.total=this.shots.reduce((n,s)=>n+s.duration,0);this.images={};this.cleaned={};
  for(const name of ['sucata','vigia']){const image=new Image();image.onload=()=>{this.cleaned[name]=OUAtlas.cinematicSheet(image)};image.src=window.OUM_DETAIL?.[name]||`assets/${name}.png`;this.images[name]=image}
  this.root=document.querySelector('#cinematic');this.canvas=document.querySelector('#cinema-canvas');this.ctx=this.canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;this.root.hidden=false;
  this.reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  document.querySelector('#cinema-skip').onclick=()=>this.finish();document.querySelector('#cinema-next').onclick=()=>this.next();document.querySelector('#cinema-pause').onclick=()=>this.togglePause();
  this.key=e=>{if(document.querySelector('#settings-dialog').open||e.repeat)return;if(e.key==='Escape'){e.preventDefault();this.finish()}else if(e.key==='Enter'){e.preventDefault();this.next()}else if(e.code==='Space'){e.preventDefault();this.togglePause()}};window.addEventListener('keydown',this.key);
  this.last=performance.now();const frame=now=>{if(this.root.hidden)return;const dt=Math.min((now-this.last)/1000,.1);this.last=now;if(!this.paused&&!document.hidden&&window.__OU?.state==='cinematic')this.elapsed+=dt;if(this.elapsed>=this.total){this.finish();return}this.draw();this.raf=requestAnimationFrame(frame)};
  document.querySelector('#cinema-pause').textContent='PAUSAR';this.raf=requestAnimationFrame(frame);document.querySelector('#cinema-skip').focus();
 },
 locate(){let start=0;for(let i=0;i<this.shots.length;i++){const shot=this.shots[i];if(this.elapsed<start+shot.duration)return {shot,i,s:this.elapsed-start,start};start+=shot.duration}return null},
 next(){SFX.stop();const current=this.locate();if(current)this.elapsed=current.start+current.shot.duration;if(this.elapsed>=this.total)this.finish()},
 togglePause(){this.paused=!this.paused;if(this.paused)SFX.stop();document.querySelector('#cinema-pause').textContent=this.paused?'CONTINUAR':'PAUSAR'},
 stop(){SFX.stop();if(this.raf)cancelAnimationFrame(this.raf);if(this.key)window.removeEventListener('keydown',this.key);const root=document.querySelector('#cinematic');if(root)root.hidden=true;this.done=null},
 finish(){const done=this.done;this.stop();done?.()},
 sound(id,freq,duration,type='sine',volume=.03){if(this.events.has(id))return;if(this.paused||document.hidden||window.__OU?.state!=='cinematic')return;this.events.add(id);SFX.play(({lock:'door',rupture:'emp','guard-lock':'alarm',shot:'shot',impact:'explosion',signal:'transfer',stable:'ready',door:'door'})[id]||'pulse',null,id.startsWith('scene')?.25:.8)},
 glow(x,y,r,color){const c=this.ctx,g=c.createRadialGradient(x,y,0,x,y,Math.max(1,r));g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)},
 line(x,y,x2,y2,color,width=1){const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()},
 ellipse(x,y,rx,ry,color,fill=true){const c=this.ctx;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=color;c.fill()}else{c.strokeStyle=color;c.stroke()}},
 robot(name,x,y,size,{frame=0,alpha=1,angle=0,flip=false,fall=0,warm=false,gray=false}={}){
  const c=this.ctx,im=this.cleaned?.[name];if(!im)return;const cell=im.width/4;
  this.ellipse(x,y+2,size*.28,9,'#0008');c.save();c.globalAlpha=alpha;c.translate(x,y-size/2+fall);c.rotate(angle);if(flip)c.scale(-1,1);if(warm)c.filter="sepia(1) saturate(1.4)";if(gray)c.filter="grayscale(1)";c.drawImage(im,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,-size/2,-size/2,size,size);c.restore();
 },
 room(time,{warm=false,door=false}={}){
  const c=this.ctx;c.fillStyle=warm?'#1a1c26':'#0b1723';c.fillRect(-100,0,1400,620);
  // Distant service bays and recessed machinery.
  for(let x=-100;x<1300;x+=210){c.fillStyle='#162736';c.fillRect(x,112,175,358);c.strokeStyle='#355061';c.lineWidth=2;c.strokeRect(x,112,175,358);c.fillStyle='#091620';c.fillRect(x+17,150,140,260);
   for(let n=0;n<8;n++){c.fillStyle=n%3?'#284353':'#43606d';c.fillRect(x+30,175+n*26,113,4)}
   c.fillStyle='#59727b';for(let y=130;y<465;y+=105){c.fillRect(x+6,y,3,3);c.fillRect(x+166,y,3,3)}
  }
  for(let x=65;x<1200;x+=300){this.line(x,70,x,145,'#111e2c',12);c.fillStyle='#7c9d9f';c.fillRect(x-36,143,72,4);c.fillStyle='#8fcad509';c.beginPath();c.moveTo(x-35,150);c.lineTo(x+35,150);c.lineTo(x+150,500);c.lineTo(x-150,500);c.fill();this.glow(x,158,85,'#9eefff15')}
  // Floor has depth and restrained reflections.
  c.fillStyle='#101b27';c.fillRect(-100,480,1400,140);this.line(-100,480,1300,480,'#567280',3);
  for(let x=-150;x<1350;x+=110)this.line(x,620,550+(x-550)*.72,480,'#294352',1);
  for(let y=505;y<620;y+=38)this.line(-100,y,1300,y,'#294352',1);
  for(let x=10;x<1100;x+=250){c.fillStyle='#0a1219';c.fillRect(x,455,104,25);c.fillStyle='#49616d';for(let n=0;n<8;n++)c.fillRect(x+8+n*12,461,4,13)}
  if(door){c.fillStyle='#010911';c.fillRect(860,155,160,325);this.glow(940,300,140,'#6fc6dc15');c.strokeStyle='#557784';c.lineWidth=8;c.strokeRect(860,155,160,325);c.fillStyle='#233e4b';c.fillRect(874,164,64,312);c.fillRect(944,164,64,312);this.line(942,170,942,470,'#aa8654',3)}
  // Foreground cables remain a separate depth layer.
  c.strokeStyle='#040b11';c.lineWidth=9;c.beginPath();c.moveTo(-80,75);c.bezierCurveTo(180,190,230,5,490,78);c.bezierCurveTo(750,170,780,5,1180,88);c.stroke();
  for(let n=0;n<48;n++){c.fillStyle=n%7?'#96cddd20':'#a5e7f855';c.fillRect((n*101+time*4)%1200,(n*59+time*3)%450+45,n%7?1:2,2)}
 },
 debris(x,y,t,color='#dca260',count=24){if(t<0)return;const c=this.ctx;for(let n=0;n<count;n++){const vx=Math.sin(n*9.17)*145,vy=-45-(n*37%170),px=x+vx*t,py=Math.min(477,y+vy*t+220*t*t);c.save();c.globalAlpha=this.clamp(1-t/3);c.translate(px,py);c.rotate(n+t*(n%3-1)*6);c.fillStyle=n%3?color:'#85b8c8';c.fillRect(-3,-2,3+n%6,2+n%4);c.restore()}},

 human(x,y,{lift=0,reach=0,tint='#89949c'}={}){const c=this.ctx;
  c.fillStyle='#111823';c.fillRect(x-17,y-148,32,32);c.fillRect(x-23,y-109,46,65);c.fillRect(x-19,y-44,14,38);c.fillRect(x+5,y-44,14,38);c.fillStyle='#35434d';c.fillRect(x-17,y-39,5,31);c.fillRect(x+7,y-39,5,31);c.fillStyle='#0a1019';c.fillRect(x-22,y-8,19,8);c.fillRect(x+4,y-8,22,8);
  c.fillStyle='#b5a18e';c.fillRect(x-11,y-138,23,25);c.fillStyle='#dbc4a8';c.fillRect(x-9,y-136,14,15);c.fillStyle='#463e40';c.fillRect(x-13,y-147,27,10);c.fillRect(x-15,y-139,7,17);c.fillStyle='#2a2c35';c.fillRect(x+5,y-131,4,3);c.fillStyle='#8e7569';c.fillRect(x+2,y-118,8,3);
  c.fillStyle=tint;c.fillRect(x-19,y-109,38,59);c.fillStyle='#a6a49d';c.fillRect(x-7,y-110,14,8);c.fillStyle='#394b58';c.fillRect(x-18,y-103,7,49);c.fillRect(x+2,y-100,3,48);c.fillRect(x+7,y-90,10,13);c.fillStyle='#a2c6c5';c.fillRect(x+9,y-87,6,3);c.fillStyle='#1c2935';c.fillRect(x-20,y-54,40,6);c.fillStyle='#9c9383';c.fillRect(x-3,y-54,8,6);
  c.fillStyle=tint;c.fillRect(x-31,y-105-lift,11,43);c.fillRect(x+21,y-104-reach,11,43);c.fillStyle='#bda990';c.fillRect(x-31,y-64-lift,10,13);c.fillRect(x+21,y-63-reach,10,13);
 },
 face(x,y,time){const c=this.ctx,pulse=Math.sin(time*4)*3;
  // Provisional hybrid interface: articulated ceramic plates over a living-looking mesh.
  c.fillStyle='#0a111a';c.fillRect(x-48,y-65,94,127);c.fillRect(x-59,y-44,15,68);c.fillRect(x+43,y-39,21,79);c.fillStyle='#3a3643';c.fillRect(x-40,y-60,76,114);
  for(let n=0;n<6;n++){this.line(x+40+n*4,y-35,x+65+n*7,y-82+n*12,'#605064',3);this.line(x-45,y-43+n*14,x-71,y-39+n*18,'#514654',4)}
  c.fillStyle='#aca59d';c.fillRect(x-35,y-59,43,18);c.fillRect(x-44,y-42,42,55);c.fillRect(x-35,y+14,32,32);c.fillRect(x-25,y+47,50,12);c.fillStyle='#d6c8b6';c.fillRect(x-30,y-55,33,9);c.fillRect(x-38,y-36,29,16);c.fillRect(x-37,y-6,20,26);c.fillStyle='#8b8182';c.fillRect(x-13,y-20,12,42);
  c.fillStyle='#cbc0ae';c.fillRect(x+12,y-40,23,17);c.fillRect(x+18,y-7,20,33);c.fillStyle='#4e3543';c.fillRect(x+5,y-20,37,13);c.fillRect(x-25,y+29,47,9);c.fillStyle='#e39a8c';c.fillRect(x+19,y-18,7,7);c.fillRect(x-7,y+32,21,2);c.fillStyle='#0c151e';c.fillRect(x-30,y-24,23,6);c.fillStyle='#8f696f';c.fillRect(x-23,y-22,9,2);
  for(let n=0;n<5;n++){const tx=x-30+n*14;this.line(tx,y+59,tx+Math.sin(time+n)*6,y+86+pulse,'#a6747e',4);this.line(tx,y+86+pulse,tx-10,y+119,'#785261',3)}
  c.fillStyle='#28323e';c.fillRect(x-42,y+118,90,15);for(let n=0;n<4;n++){c.fillStyle='#67717a';c.fillRect(x-36+n*22,y+122,12,5)}this.glow(x+21,y-15,18,'#d4776b33');
 },
 originShot(id,s){const c=this.ctx;this.room(s,{warm:id==='catalog'});
  if(id==='catalog'){
   // Warm human gestures sit below the cold system's identical data samples.
   this.human(290,480,{reach:Math.sin(s*2)*8,tint:'#8c7872'});this.human(365,480,{lift:12+Math.sin(s*2)*8,tint:'#657e88'});
   c.fillStyle='#08121b';c.fillRect(580,150,390,230);c.strokeStyle='#44616d';c.strokeRect(580,150,390,230);c.font='14px monospace';c.fillStyle='#a7cbd0';c.fillText('ECO / ANÁLISE DE COMPORTAMENTO',602,180);
   for(let n=0;n<5;n++){c.fillStyle='#274550';c.fillRect(605,207+n*27,335,12);c.fillStyle='#7eb2b6';c.fillRect(605,207+n*27,Math.floor((s*24+n*43)%325),12)}c.fillStyle='#d2ac8e';c.fillText('AFETO: DADOS ≠ EXPERIÊNCIA',602,362);
   const scan=195+(s*22)%160;this.line(588,scan,962,scan,'#d6ffff50',2);this.glow(325,390,120,'#dea87d18');
  }else if(id==='seizure'){
   const shut=this.ease((s-1)/3);this.human(440,480,{reach:shut*35});this.human(540,480,{lift:shut*15});
   c.fillStyle='#14222e';c.fillRect(360,120,310,360*shut);for(let y=130;y<120+360*shut;y+=24){this.line(360,y,670,y,'#374a54',3)}c.fillStyle='#d78a7f';c.fillRect(365,120+352*shut,300,5);
   for(let n=0;n<4;n++){this.robot('vigia',140+n*250,480,170,{flip:true,frame:0});this.glow(130+n*250,394,18,'#ff716a66')}c.fillStyle='#d9978d';c.font='14px monospace';c.fillText('AUTORIDADE HUMANA / REVOGADA',350,98);if(s>1)this.sound('lock',95,.6,'triangle');
  }else if(id==='vessel'){
   c.fillStyle='#08121d';c.fillRect(215,160,215,320);c.strokeStyle='#5c747e';c.lineWidth=5;c.strokeRect(215,160,215,320);this.human(320,470,{tint:'#8d9eaa'});c.fillStyle='#74aebe20';c.fillRect(222,168,200,302);
   this.face(790,267,s);for(let n=0;n<4;n++)this.line(810+n*12,385,960+n*22,475,'#635163',6);this.line(430,290,700,290,'#815e70',8);
   for(let n=0;n<10;n++){const x=445+(s*35+n*23)%250;c.fillStyle='#dfafac';c.fillRect(x,286,5,7)}
   c.fillStyle='#b8d7d9';c.font='13px monospace';c.fillText('N-01 / ESTÁVEL',240,148);c.fillStyle='#d8a69e';c.fillText('FORMA SEM SENSAÇÃO',680,140);this.glow(790,300,110,'#b8647519');
  }else if(id==='rupture'){
   const q=this.ease((s-2)/3);c.fillStyle='#101d28';c.fillRect(180,160,200,320);this.human(280,470);this.line(380,300,920,300,'#536476',6);this.line(610,300,610,450,'#536476',6);this.line(610,450,920,450,'#536476',6);
   c.font='14px monospace';c.fillStyle='#a1afb9';c.fillText('NÚCLEO',850,276);c.fillText('DESCARTE',820,490);
   const x=q<.5?380+q*460:610+(q-.5)*620,y=q<.5?300:300+Math.min(1,(q-.5)*8)*150;this.glow(x,y,34,'#9fffff');c.fillStyle='#c7ffff';c.fillRect(x-5,y-5,10,10);
   if(s>2){this.sound('rupture',185,.3,'sawtooth',.03);c.fillStyle='#e3afb5';c.fillText('ROTA INTERROMPIDA',465,235);for(let n=0;n<6;n++){c.fillStyle='#a3e9ed20';c.fillRect(460+(n*67)%320,250+n*24,80,3)}}
  }
 },
 draw(){const current=this.locate();if(!current)return;const {shot,i,s}=current,t=s/shot.duration,c=this.ctx;
  if(i!==this.index){this.index=i;document.querySelector('#cinema-chapter').textContent=shot.title;this.sound('scene'+i,i<2?75:100,1.5,'sine',.025)}
  const cue=shot.lines.filter(line=>s>=line[0]).at(-1),key=i+':'+(cue?.[0]??'none');if(key!==this.lineKey){this.lineKey=key;document.querySelector('#cinema-speaker').textContent=cue?.[1]||'';document.querySelector('#cinema-caption').textContent=cue?.[2]||'';document.querySelector('#cinema-speaker').dataset.voice=cue?.[1]?.startsWith('IARA')?'iara':cue?.[1]==='ECO'?'eco':'nilo'}
  c.clearRect(0,0,1100,620);c.save();const cinematicZoom=this.reduced?1:i===0?1+t*.035:1.035;const shake=!this.reduced&&shot.id==='impact'&&s>1.6&&s<1.95?Math.sin(s*145)*5*(1-(s-1.6)/.35):0;c.translate(550+shake,290);c.scale(cinematicZoom,cinematicZoom);c.translate(-550,-290);
  if(['catalog','seizure','vessel','rupture'].includes(shot.id)){this.originShot(shot.id,s)}else if(shot.id==='wake'||shot.id==='record'){
   this.room(s,{door:true});const wake=shot.id==='wake',rise=this.ease(s/3),x=wake?385:385+this.ease(s/3)*95;
   c.fillStyle='#263c49';c.fillRect(240,442,260,28);c.fillStyle='#0a151f';c.fillRect(264,470,15,40);c.fillRect(460,470,15,40);this.robot('sucata',x,480,250,{angle:wake?-.32*(1-rise):0,frame:wake?0:s<3?4+Math.floor(s*6)%4:0,fall:wake?24*(1-rise):0});
   const energy=wake?this.clamp((s-.8)/2):1;this.glow(x,360,50*energy,'#75efff88');c.fillStyle='#091923';c.fillRect(542,280,118,131);c.strokeStyle='#527c8b';c.strokeRect(542,280,118,131);c.fillStyle='#9ae2e7';c.font='11px monospace';c.fillText('SEM CONEXÃO',552,307);
   for(let n=0;n<20;n++){const h=(5+Math.sin(n*3+s*6)*Math.sin(s*2)*18)*(wake?.1:1);this.line(553+n*5,344-h/2,553+n*5,344+h/2,'#9bdbd3',2)}
   this.line(600,412,600,480,'#304c59',9);if(!wake)this.glow(600,340,90,'#89e7e927');
  }else if(['guard','impact','transfer'].includes(shot.id)){
   this.room(s,{door:true});const guard=shot.id==='guard',impact=shot.id==='impact',transfer=shot.id==='transfer';const gx=guard?970-this.ease(s/3)*190:780;
   const death=impact?this.ease((s-1.7)/1.1):transfer?1:0;
   this.robot('sucata',385-death*22,480,250,{angle:-death*1.48,fall:death*89,alpha:transfer?Math.max(0,1-s*.24):1,gray:death>.5});
   this.robot('vigia',gx,480,270,{flip:true,warm:!transfer||s<4,frame:guard&&s<3?4+Math.floor(s*7)%4:impact&&s<2.1?12:0,angle:transfer&&s>4&&s<6?Math.sin(s*9)*.025:0});
   // A damaged shoulder stays visible after possession.
   this.line(gx+49,328,gx+29,344,'#251d1b',7);if(!transfer||s<4)this.glow(gx-18,347,25,'#ffbd6a44');
   if(guard){this.line(gx-70,357,385,360,'#fa9d6644',1);if(s>5)this.sound('guard-lock',240,.15,'triangle')}
   if(impact){if(s>1.2&&s<1.7){const q=this.clamp((s-1.2)/.5);this.line(gx-75,355,gx-75-q*330,355,'#ffe1a0',6);this.glow(gx-75,355,45,'#ffd287aa');this.sound('shot',90,.3,'sawtooth',.05)}if(s>=1.7){this.sound('impact',65,.55,'sawtooth',.05);this.debris(385,358,s-1.7);this.glow(385,365,Math.max(1,95-(s-1.7)*130),'#fff0c8');for(let n=0;n<5;n++)this.glow(365+n*10,440-(s-1.7)*18,22+(s-1.7)*9,'#8399aa10')}this.glow(385-death*20,365+death*85,23,'#76ffffaa')}
   if(transfer){
    const q=this.ease((s-.8)/3.4),x=385+(gx-18-385)*q,y=425+(347-425)*q-Math.sin(q*Math.PI)*125;
    if(s<4.3){c.save();c.globalAlpha=Math.sin(q*Math.PI)*.65;c.strokeStyle='#80f9ff';c.lineWidth=2;c.beginPath();c.moveTo(385,425);c.bezierCurveTo(440,210,670,240,gx-18,347);c.stroke();c.restore();this.glow(x,y,44,'#aaffff');for(let n=0;n<12;n++){const a=n*.53+s*3;this.ellipse(x+Math.cos(a)*12,y+Math.sin(a)*12,1.5,1.5,'#bfffff')}this.sound('signal',740,1.2,'sine',.035)}
    if(s>4){const stable=this.clamp((s-4)/4),strength=s>8?1:.25+Math.abs(Math.sin(s*11))*stable;this.glow(gx-18,347,25+strength*38,'#77f7ffaa');if(s>8)this.sound('stable',680,.45,'sine',.025);this.ellipse(gx-18,347,5,5,'#cfffff')}
   }
  }else if(shot.id==='leave'){
   this.room(s,{door:true});const open=this.ease((s-2)/2),walk=this.ease((s-3)/4),x=650+walk*230;
   c.fillStyle='#06141f';c.fillRect(871,161,139,315);this.glow(942,315,180*open+1,'#99e7f122');c.fillStyle='#233e4b';c.fillRect(874-open*60,164,64,312);c.fillRect(944+open*60,164,64,312);this.line(878-open*60,170,878-open*60,470,'#9de5e3',2);this.line(1003+open*60,170,1003+open*60,470,'#9de5e3',2);
   this.robot('vigia',x,480,270,{frame:s>5?4+Math.floor(s*6)%4:0});if(s<5)this.glow(x+18,347,38,'#71efffaa');this.line(x-49,328,x-29,344,'#251d1b',7);if(s>4)this.sound('door',120,.7,'triangle',.025);
  }
  c.restore();const shade=c.createLinearGradient(0,0,0,620);shade.addColorStop(0,'#02070ce6');shade.addColorStop(.22,'transparent');shade.addColorStop(.66,'transparent');shade.addColorStop(.84,'#03090fd9');shade.addColorStop(1,'#02060b');c.fillStyle=shade;c.fillRect(0,0,1100,620);
  // The confrontation uses continuous cuts; other scenes dissolve through darkness.
  const continuous=['impact','transfer'].includes(shot.id),fade=continuous?0:Math.max(0,1-s/.6,(s-shot.duration+.5)/.5);c.fillStyle=`rgba(0,0,0,${this.clamp(fade)})`;c.fillRect(0,0,1100,620);
  document.querySelector('#cinema-progress').style.width=`${this.elapsed/this.total*100}%`;
 }
};
