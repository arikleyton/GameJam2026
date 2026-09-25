(function(root){
const actions={left:'Mover à esquerda',right:'Mover à direita',jump:'Saltar',down:'Descer da plataforma',dash:'Dash',attack:'Atacar (tecla alternativa)',interact:'Interagir',pause:'Pausar / continuar',restart:'Reiniciar fase'};
const defaults={volume:70,resolution:'1100x620',bindings:{left:65,right:68,jump:32,down:83,dash:16,attack:74,interact:69,pause:27,restart:82}};
const resolutions={'880x496':[880,496],'1100x620':[1100,620],'1650x930':[1650,930],'2200x1240':[2200,1240]};
const validKey=k=>Number.isInteger(k)&&((k>=65&&k<=90)||(k>=48&&k<=57)||[16,17,27,32,37,38,39,40].includes(k));
function normalize(raw){const d=JSON.parse(JSON.stringify(defaults));if(!raw||typeof raw!=='object')return d;if(Number.isFinite(raw.volume))d.volume=Math.max(0,Math.min(100,raw.volume));if(resolutions[raw.resolution])d.resolution=raw.resolution;const keys=Object.keys(actions);if(raw.bindings&&keys.every(k=>validKey(raw.bindings[k]))&&new Set(keys.map(k=>raw.bindings[k])).size===keys.length)d.bindings={...raw.bindings};return d}
function keyName(k){return ({16:'Shift',17:'Ctrl',27:'Esc',32:'Espaço',37:'←',38:'↑',39:'→',40:'↓'})[k]||String.fromCharCode(k)}
function rebind(prefs,action,key){if(!Object.hasOwn(actions,action)||!validKey(key))return {ok:false,message:'Use uma letra, número, seta, Espaço, Shift, Ctrl ou Esc.'};const conflict=Object.keys(actions).find(a=>a!==action&&prefs.bindings[a]===key);if(conflict)return {ok:false,message:keyName(key)+' já está em uso: '+actions[conflict]+'.'};prefs.bindings[action]=key;return {ok:true}}
let current;try{current=normalize(JSON.parse(localStorage.getItem('o-um-preferences-v1')))}catch{current=normalize(null)}
const api={actions,defaults,resolutions,normalize,keyName,rebind,current,save(){try{localStorage.setItem('o-um-preferences-v1',JSON.stringify(this.current));return true}catch{return false}}};root.OUPrefs=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
