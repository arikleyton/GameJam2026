/* Small platform graph built once per room; BFS runs at most 5 Hz per awake actor. */
const SNavigation={
 build(platforms,hazards){
  const nodes=[];
  for(const p of platforms.filter(p=>!p.dynamic)){
   let spans=[[p.x+20,p.x+p.w-20]];
   const obstacles=platforms.filter(q=>q.solid&&q.y<p.y&&q.y+q.h>p.y-48);
   for(const q of obstacles){const next=[];for(const [l,r] of spans){if(q.x>=r||q.x+q.w<=l)next.push([l,r]);else{if(q.x-20>l)next.push([l,q.x-20]);if(q.x+q.w+20<r)next.push([q.x+q.w+20,r])}}spans=next}
   for(const [l,r] of spans)if(r-l>=20)nodes.push({l,r,y:p.y,p,links:[]});
  }
  for(let i=0;i<nodes.length;i++)for(let j=0;j<nodes.length;j++){if(i===j)continue;const a=nodes[i],b=nodes[j],gap=Math.max(0,b.l-a.r,a.l-b.r),rise=a.y-b.y;if(rise<=115&&rise>=-210&&gap<=145&&!(rise===0&&gap>0&&gap<38))a.links.push(j)}
  return nodes;
 },
 nearest(nodes,a){let best=-1,score=Infinity;nodes.forEach((n,i)=>{const d=Math.abs(a.y-n.y)*3+Math.max(n.l-a.x,0,a.x-n.r);if(d<score){score=d;best=i}});return best},
 route(nodes,from,to){if(from<0||to<0||from===to)return null;const queue=[from],seen=new Set(queue),prev=new Map();for(let k=0;k<queue.length;k++){for(const j of nodes[queue[k]].links){if(seen.has(j))continue;seen.add(j);prev.set(j,queue[k]);if(j===to){let step=j;while(prev.get(step)!==from)step=prev.get(step);return nodes[step]}queue.push(j)}}return null},
 clear(scene,a,b){return !scene.platforms.some(p=>p.solid&&p.y<500&&OURules.segmentHit(a.x,a.y-28,b.x,b.y-28,p.x,p.y,p.x+p.w,p.y+p.h)!==null)},
 steer(scene,a,dt){
  a.think=(a.think||0)-dt;a.alert=Math.max(0,(a.alert||0)-dt);a.jumpWait=Math.max(0,(a.jumpWait||0)-dt);
  const player=scene.player,dx=player.x-a.x,dy=player.y-a.y;
  if(a.think<=0){a.think=.20+(a.home%7)*.012;a.sight=this.clear(scene,a,player);a.awake=(Math.abs(dx)<(a.type==='gume'?760:600)&&Math.abs(dy)<300)||a.alert>0;if(a.awake){a.navNext=this.route(scene.navNodes,this.nearest(scene.navNodes,a),this.nearest(scene.navNodes,player));a.aiState=a.sight?'perseguir':'buscar'}else{a.navNext=null;a.aiState='patrulhar'}}
  if(!a.awake){a.vx=0;return false}
  const speed=a.type==='gume'?225:a.type==='ancora'?115:145,next=a.navNext;
  if(!a.ground){if(a.navAir!==undefined)a.vx=a.navAir;return true}
  a.navAir=undefined;
  if(next){
   const target=Math.max(next.l+7,Math.min(next.r-7,a.x)),diff=target-a.x,dir=Math.sign(diff)||Math.sign(dx)||1;
   a.vx=Math.abs(diff)>10?dir*speed:0;
   if(next.y<a.y-8){const edge=a.support,near=next.l<=a.x+48&&next.r>=a.x-48;
    if(near&&a.jumpWait<=0){a.vy=-OURules.bodies[a.type].jump;a.ground=false;a.navAir=a.vx=dir*Math.min(speed,180);a.jumpWait=.8}
   }else if(next.y>a.y+12&&next.l<a.x&&next.r>a.x&&a.support&&!a.support.solid){scene.dropThrough(a);a.navAir=a.vx;}
   else if(a.support&&((dir>0&&a.x>a.support.x+a.support.w-42)||(dir<0&&a.x<a.support.x+42))&&a.jumpWait<=0){a.vy=-OURules.bodies[a.type].jump;a.ground=false;a.navAir=a.vx=dir*speed;a.jumpWait=.8}
  }else if(OURules.bodies[a.type].melee){a.vx=Math.abs(dx)>OURules.bodies[a.type].range*.7?Math.sign(dx)*speed:0}
  // Proactive step-up and spike avoidance, even when both actors share a floor node.
  const dir=Math.sign(a.vx);if(dir&&a.jumpWait<=0){const x=a.x+dir*44,wall=scene.platforms.some(p=>p.solid&&p.y<a.y&&a.y-p.y<=118&&x>p.x&&x<p.x+p.w),spike=scene.hazards.some(h=>x>h.x-12&&x<h.x+h.w+12&&a.y>490);if(wall||spike){a.vy=-OURules.bodies[a.type].jump;a.ground=false;a.navAir=a.vx;a.jumpWait=.8}}
  // Do not walk into an unplanned pit.
  if(a.ground&&a.support&&!next){const x=a.x+a.vx*dt;if(x<a.support.x+18||x>a.support.x+a.support.w-18)a.vx=0}
  return true;
 }
};
