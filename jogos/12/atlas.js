/* Isolate each frame before packing it. Neighbouring poses never share a draw rectangle. */
const OUAtlas={
 cleanFrame(rgba,w,h){
  const visited=new Uint8Array(w*h),groups=[];
  for(let start=0;start<w*h;start++){if(visited[start]||rgba[start*4+3]<28)continue;const stack=[start],pixels=[];visited[start]=1;
   while(stack.length){const n=stack.pop();pixels.push(n);const x=n%w,y=Math.floor(n/w);for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){const q=yy*w+xx;if(!visited[q]&&rgba[q*4+3]>=28){visited[q]=1;stack.push(q)}}}
   groups.push(pixels);
  }
  groups.sort((a,b)=>b.length-a.length);const keep=new Uint8Array(w*h);for(const n of groups[0]||[])keep[n]=1;
  let left=w,top=h,right=0,bottom=0;for(let n=0;n<w*h;n++){if(!keep[n])rgba[n*4+3]=0;else{left=Math.min(left,n%w);right=Math.max(right,n%w);top=Math.min(top,Math.floor(n/w));bottom=Math.max(bottom,Math.floor(n/w))}}
  return {left,top,width:Math.max(1,right-left+1),height:Math.max(1,bottom-top+1),removed:groups.slice(1).reduce((sum,g)=>sum+g.length,0)};
 },
 cinematicSheet(source){
  const cell=256,scratch=document.createElement('canvas');scratch.width=scratch.height=cell;const c=scratch.getContext('2d',{willReadFrequently:true}),out=document.createElement('canvas');out.width=out.height=cell*4;const g=out.getContext('2d');c.imageSmoothingEnabled=g.imageSmoothingEnabled=false;const frames=[];
  for(let n=0;n<16;n++){c.clearRect(0,0,cell,cell);const x0=Math.round(n%4*source.naturalWidth/4),y0=Math.round(Math.floor(n/4)*source.naturalHeight/4),x1=Math.round((n%4+1)*source.naturalWidth/4),y1=Math.round((Math.floor(n/4)+1)*source.naturalHeight/4);c.drawImage(source,x0,y0,x1-x0,y1-y0,0,0,cell,cell);const data=c.getImageData(0,0,cell,cell),box=this.cleanFrame(data.data,cell,cell);frames.push({data,box})}
  const scale=Math.min(224/Math.max(...frames.map(f=>f.box.width)),232/Math.max(...frames.map(f=>f.box.height)));
  frames.forEach(({data,box},n)=>{c.putImageData(data,0,0);const w=Math.round(box.width*scale),h=Math.round(box.height*scale);g.drawImage(scratch,box.left,box.top,box.width,box.height,n%4*cell+Math.floor((cell-w)/2),Math.floor(n/4)*cell+244-h,w,h)});return out;
 },
 build(scene){for(const name of [...Object.keys(OURules.bodies),'gume-corrupt','vigia-corrupt']){
   
   const source=scene.textures.get(name).getSourceImage(),scratch=document.createElement('canvas');scratch.width=scratch.height=96;const ctx=scratch.getContext('2d',{willReadFrequently:true}),sheet=document.createElement('canvas');sheet.width=sheet.height=384;const out=sheet.getContext('2d');ctx.imageSmoothingEnabled=out.imageSmoothingEnabled=false;
   const frames=[];for(let frame=0;frame<16;frame++){ctx.clearRect(0,0,96,96);ctx.drawImage(source,frame%4*source.width/4,Math.floor(frame/4)*source.height/4,source.width/4,source.height/4,0,0,96,96);const data=ctx.getImageData(0,0,96,96),box=this.cleanFrame(data.data,96,96);frames.push({data,box})}const heights={sucata:68,vigia:72,gume:72,forja:68,prisma:74,ancora:76,turret:54,eco:80,'gume-corrupt':72,'vigia-corrupt':72};const scale=Math.min((name==='ancora'?90:76)/Math.max(...frames.map(f=>f.box.width)),heights[name]/Math.max(...frames.map(f=>f.box.height)));for(let frame=0;frame<16;frame++){const {data,box}=frames[frame];ctx.putImageData(data,0,0);const w=Math.round(box.width*scale),h=Math.round(box.height*scale);out.drawImage(scratch,box.left,box.top,box.width,box.height,frame%4*96+Math.floor((96-w)/2),Math.floor(frame/4)*96+94-h,w,h)}
   scene.textures.remove(name);scene.textures.addCanvas(name,sheet);
  }}
};
