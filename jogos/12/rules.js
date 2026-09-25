(function(root){
const bodies={sucata:{label:'SUCATA',hp:40,speed:220,jump:550,damage:13,range:60,rate:.42},vigia:{label:'VIGIA',hp:85,speed:172,jump:560,damage:18,range:510,rate:.5},gume:{label:'GUME',hp:60,speed:270,jump:590,damage:24,range:80,rate:.36}};
Object.assign(bodies,{
 eco:{label:'ECO',hp:480,speed:50,jump:0,damage:20,range:1000,rate:2,color:0xe2a3ab,possessable:false},
 forja:{label:'FORJA',hp:100,speed:160,jump:555,damage:30,range:440,rate:.95,color:0xf19d4f},
 prisma:{label:'PRISMA',hp:52,speed:235,jump:585,damage:27,range:620,rate:.85,color:0xc5a5ff},
 ancora:{label:'ÂNCORA',hp:125,speed:155,jump:555,damage:32,range:90,rate:.85,color:0x66c9ba,melee:true},
 turret:{label:'TORRETA',hp:55,speed:0,jump:0,damage:12,range:600,rate:1.7,color:0xe96b69,possessable:false}
});
bodies.sucata.melee=bodies.gume.melee=true;
function possession(cooldown,killer,empLock=0){if(empLock>0)return {ok:false,reason:"O pulso eletromagnético bloqueou a transferência de consciência."};if(killer?.type==='turret'||killer?.possessable===false)return {ok:false,reason:killer?.type==='eco'?'ECO rejeitou a transferência. Use os autômatos de contenção para receber sua consciência.':'A torreta não possui um núcleo compatível. Nenhum corpo recebeu o sinal.'};if(cooldown>0)return {ok:false,reason:'O núcleo ainda estava recarregando.'};if(!killer||!killer.alive||killer.hp<=0)return {ok:false,reason:'Nenhum corpo ativo recebeu o seu sinal.'};return {ok:true,hp:killer.hp,cooldown:4};}
const upgrades=[
 {id:'power',label:'Potência',description:'Dano +5% por nível.',effect:n=>'Dano +'+n*5+'%'},
 {id:'armor',label:'Blindagem',description:'Dano recebido −4% por nível.',effect:n=>'Dano recebido −'+n*4+'%'},
 {id:'haste',label:'Cadência',description:'Intervalo entre ataques −4% por nível.',effect:n=>'Intervalo de ataque −'+n*4+'%'},
 {id:'mobility',label:'Impulso',description:'Recarga do dash −8% por nível.',effect:n=>'Recarga do dash −'+n*8+'%'},
 {id:'repair',label:'Reparo',description:'Recupere 5 HP por nível após cada posse.',effect:n=>'Reparo após posse: '+n*5+' HP'},
 {id:'reactor',label:'Reator',description:'Recarga do núcleo −0,35 s por nível.',effect:n=>'Recarga do núcleo: '+(4-n*.35).toFixed(2)+' s'},
 {id:'shield',label:'Proteção',description:'Invulnerabilidade após posse +0,2 s por nível.',effect:n=>'Proteção após posse: '+(1.1+n*.2).toFixed(1)+' s'},
 {id:'insulation',label:'Isolamento',description:'Duração do bloqueio EMP −15% por nível.',effect:n=>'Duração do EMP −'+n*15+'%'}
];
function upgradeLevel(scene,id){return scene.upgrades?.[0]===id?Math.min(5,scene.upgradeTier||1):0}
const dashes={
 sucata:{label:'ARRANCADA',speed:560,duration:.15,cooldown:.8,air:true,color:0xffc45d},
 vigia:{label:'AVANÇO BLINDADO',speed:440,duration:.24,cooldown:1.6,air:true,color:0xffd173},
 gume:{label:'PASSO FANTASMA',speed:800,duration:.20,cooldown:1.1,air:true,color:0x6ef7ff}
};
Object.assign(dashes,{
 forja:{label:'RECUO TÉRMICO',speed:590,duration:.17,cooldown:1.3,air:true,color:0xffa455},
 prisma:{label:'REFRAÇÃO',speed:880,duration:.14,cooldown:1.1,air:true,color:0xc5a5ff},
 ancora:{label:'INVESTIDA DE AÇO',speed:510,duration:.23,cooldown:1.6,air:true,color:0x66c9ba},
 turret:{label:'FIXA',speed:0,duration:0,cooldown:1,air:false,color:0xff7777}
});
function segmentHit(x0,y0,x1,y1,left,top,right,bottom){let enter=0,exit=1;for(const [start,delta,min,max] of [[x0,x1-x0,left,right],[y0,y1-y0,top,bottom]]){if(Math.abs(delta)<1e-8){if(start<min||start>max)return null;continue}let a=(min-start)/delta,b=(max-start)/delta;if(a>b)[a,b]=[b,a];enter=Math.max(enter,a);exit=Math.min(exit,b);if(enter>exit)return null}return enter}
const api={bodies,possession,upgrades,upgradeLevel,dashes,segmentHit};root.OURules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
