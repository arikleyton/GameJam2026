/* Original procedural ambience. Browser audio starts only after a deliberate click. */
const SMenu={enabled:false,elapsed:0,paintAt:0,noteAt:0,
 attach(scene){this.canvas=document.querySelector('#menu-scene');this.ctx=this.canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;document.querySelector('#menu-audio').onclick=()=>{this.enabled=!this.enabled;this.unlock();this.label()};document.querySelector('#menu-about').onclick=()=>document.querySelector('#about-dialog').showModal();document.querySelector('#close-about').onclick=()=>document.querySelector('#about-dialog').close();this.label()},
 label(){document.querySelector('#menu-audio').textContent=this.enabled?'AMBIÊNCIA · LIGADA':'ATIVAR AMBIÊNCIA'},
 unlock(){try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();if(this.gain)return;this.gain=audioCtx.createGain();this.gain.gain.value=0;const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=480;this.gain.connect(filter);filter.connect(audioCtx.destination);this.voices=[55,82.41,110.4].map((f,i)=>{const o=audioCtx.createOscillator();o.type=i===1?'triangle':'sine';o.frequency.value=f;o.detune.value=i===2?-9:0;o.connect(this.gain);o.start();return o})}catch{this.enabled=false;this.label()}},
 update(scene,dt){this.elapsed+=dt;const menu=scene.state==='menu'||(scene.state==='settings'&&Settings.previous==='menu'),mode=menu?'title':scene.state;
  if(ui.overlay.dataset.mode!==mode)ui.overlay.dataset.mode=mode;
  if(menu&&this.ctx&&this.elapsed>=this.paintAt){this.paintAt=this.elapsed+1/30;this.draw(scene)}
  if(this.gain){const audible=this.enabled&&menu&&!document.hidden,v=audible?OUPrefs.current.volume/100:0;this.gain.gain.setTargetAtTime(v*.017,audioCtx.currentTime,.25);if(v>0&&this.elapsed>this.noteAt){this.noteAt=this.elapsed+3.6;const notes=[220,207.65,164.81,146.83,155.56,110],o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.value=notes[Math.floor(this.elapsed/3.6)%notes.length];g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(v*.014,audioCtx.currentTime+.6);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+3.3);o.connect(g);g.connect(this.gain);o.start();o.stop(audioCtx.currentTime+3.4)}}
 },
 draw(scene){const c=this.ctx,t=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:this.elapsed;c.clearRect(0,0,1100,620);c.fillStyle='#090910';c.fillRect(0,0,1100,620);
  for(let i=0;i<8;i++){const x=i*160;c.fillStyle=i%2?'#13131d':'#10121b';c.fillRect(x,50,132,500);c.strokeStyle='#2d2734';c.lineWidth=3;c.strokeRect(x+16,80,100,430);for(let n=0;n<8;n++){c.fillStyle='#342b38';c.fillRect(x+26,115+n*48,78,3)}}
  c.fillStyle='#090b12';c.fillRect(0,510,1100,110);c.strokeStyle='#262633';for(let x=-150;x<1200;x+=100){c.beginPath();c.moveTo(x,620);c.lineTo(550+(x-550)*.72,510);c.stroke()}
  c.strokeStyle='#463341';c.lineWidth=8;for(let n=0;n<5;n++){c.beginPath();c.moveTo(690+n*34,0);c.bezierCurveTo(680+n*30,150,1040,60+n*35,890,220+n*22);c.stroke()}
  const im=scene.textures.get('eco').getSourceImage();c.globalAlpha=.76;const frame=Math.floor(t*2)%4;c.drawImage(im,frame*96,0,96,96,640,40+Math.sin(t*.7)*3,535,535);c.globalAlpha=1;
  const glow=c.createRadialGradient(915,310,5,915,310,240);glow.addColorStop(0,'#c5646326');glow.addColorStop(1,'transparent');c.fillStyle=glow;c.fillRect(665,60,500,500);
  for(let n=0;n<24;n++){c.fillStyle='#c5a4a21c';c.fillRect((n*73+t*(n%3+2))%1100,100+(n*43)%440,2,2)}
  const shade=c.createLinearGradient(0,0,1100,0);shade.addColorStop(0,'#05080b99');shade.addColorStop(.48,'#05080ba6');shade.addColorStop(1,'#05080b22');c.fillStyle=shade;c.fillRect(0,0,1100,620);c.fillStyle='#05060a66';c.fillRect(0,0,1100,85);c.fillRect(0,560,1100,60);
 }
};
