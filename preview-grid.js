'use strict';

(function(){
  const preview=window.JiangnanPreview,gridCanvas=document.querySelector('#snap-grid'),snapToggle=document.querySelector('#snap-toggle'),snapReadout=document.querySelector('#snap-readout'),offsetInputs=[document.querySelector('#offset-x'),document.querySelector('#offset-y'),document.querySelector('#offset-z')],gizmoAxes=Array.from(document.querySelectorAll('#transform-gizmo [data-axis]'));
  if(!preview||!gridCanvas)return;
  const ctx=gridCanvas.getContext('2d'),axisIndex={x:0,y:1,z:2};
  let snapEnabled=true,activeAxis=null,adjustingInput=false,modifier='default',frame=0;
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function sub(a,b){return a.map(function(value,index){return value-b[index];});}
  function dot(a,b){return a.reduce(function(sum,value,index){return sum+value*b[index];},0);}
  function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function norm(a){const length=Math.hypot.apply(null,a)||1;return a.map(function(value){return value/length;});}
  function mul(a,b){const result=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)result[j*4+i]+=a[k*4+i]*b[j*4+k];return result;}
  function matrix(aspect){const camera=preview.getCamera(),target=camera.target,eye=[target[0]+Math.sin(camera.yaw)*Math.cos(camera.pitch)*camera.distance,target[1]+Math.sin(camera.pitch)*camera.distance,target[2]+Math.cos(camera.yaw)*Math.cos(camera.pitch)*camera.distance],z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x),view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1],near=.1,far=100,f=1/Math.tan(.47),projection=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];return mul(projection,view);}
  function project(point,width,height){const m=matrix(width/height),x=point[0],y=point[1],z=point[2],cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13],cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<=0)return null;return{x:(cx/cw*.5+.5)*width,y:(1-(cy/cw*.5+.5))*height,z:cw};}
  function partInfo(){const state=preview.getState();if(!state.authoring||!state.authoring.enabled)return null;const report=preview.getReport(),meta=(report.metrics&&report.metrics.metadata||[]).find(function(value){return value.type==='sideGate'&&Array.isArray(value.authoringParts);});if(!meta)return null;const part=meta.authoringParts.find(function(value){return value.id===state.authoring.selected;});if(!part)return null;const offsets=preview.getAuthoringOffsets(),offset=Array.isArray(offsets[part.id])?offsets[part.id].slice(0,3):[0,0,0],base=[part.position[0]-offset[0],part.position[1]-offset[1],part.position[2]-offset[2]];return{part:part,offset:offset,base:base,state:state};}
  function stepFor(axis,event){if(!snapEnabled)return 0;if((event&&event.altKey)||modifier==='fine')return .01;if((event&&event.shiftKey)||modifier==='coarse')return .25;return axis==='y'?.025:.05;}
  function updateReadout(event){if(!snapReadout)return;if(!snapEnabled){snapReadout.textContent='自由拖动';return;}const fine=(event&&event.altKey)||modifier==='fine',coarse=(event&&event.shiftKey)||modifier==='coarse';snapReadout.textContent=fine?'精细 1cm':coarse?'粗调 25cm':'X/Z 5cm · Y 2.5cm';}
  function clamp(value){return Math.max(-3,Math.min(3,value));}
  function rounded(value){return Math.round(value*10000)/10000;}
  function snapAxis(axis,event){if(!snapEnabled)return;const info=partInfo(),index=axisIndex[axis],input=offsetInputs[index];if(!info||!input)return;const step=stepFor(axis,event),world=info.base[index]+info.offset[index],snappedWorld=Math.round(world/step)*step,next=rounded(clamp(snappedWorld-info.base[index]));if(Math.abs(next-info.offset[index])<.000001)return;adjustingInput=true;input.value=String(next);input.dispatchEvent(new Event('change',{bubbles:true}));adjustingInput=false;}
  function syncToggle(){if(snapToggle){snapToggle.classList.toggle('active',snapEnabled);snapToggle.textContent=snapEnabled?'网格吸附：开':'网格吸附：关';}updateReadout();gridCanvas.hidden=!snapEnabled;}
  function line(a,b,color,width){const pa=project(a,innerWidth,innerHeight),pb=project(b,innerWidth,innerHeight);if(!pa||!pb)return;ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function multiple(value,unit){return Math.abs(value/unit-Math.round(value/unit))<.001;}
  function drawGrid(){
    const dpr=Math.min(devicePixelRatio||1,1.5),width=Math.max(1,Math.round(innerWidth*dpr)),height=Math.max(1,Math.round(innerHeight*dpr));if(gridCanvas.width!==width||gridCanvas.height!==height){gridCanvas.width=width;gridCanvas.height=height;}gridCanvas.style.width=innerWidth+'px';gridCanvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,innerWidth,innerHeight);
    const info=partInfo();if(!snapEnabled||!info){gridCanvas.hidden=true;frame=requestAnimationFrame(drawGrid);return;}gridCanvas.hidden=false;
    const centerX=Math.round(info.part.position[0]/.05)*.05,centerZ=Math.round(info.part.position[2]/.05)*.05,range=2.5,startX=Math.ceil((centerX-range)/.05)*.05,endX=Math.floor((centerX+range)/.05)*.05,startZ=Math.ceil((centerZ-range)/.05)*.05,endZ=Math.floor((centerZ+range)/.05)*.05,y=.006;
    for(let i=0,x=startX;x<=endX+.0001;i++,x=startX+i*.05){const major=multiple(x,1),medium=!major&&multiple(x,.25);line([x,y,startZ],[x,y,endZ],major?'rgba(245,243,232,.34)':medium?'rgba(245,243,232,.18)':'rgba(245,243,232,.075)',major?1.5:medium?1:.6);}
    for(let i=0,z=startZ;z<=endZ+.0001;i++,z=startZ+i*.05){const major=multiple(z,1),medium=!major&&multiple(z,.25);line([startX,y,z],[endX,y,z],major?'rgba(245,243,232,.34)':medium?'rgba(245,243,232,.18)':'rgba(245,243,232,.075)',major?1.5:medium?1:.6);}
    if(activeAxis==='y'){
      const x=info.part.position[0],z=info.part.position[2];line([x,0,z],[x,3,z],'rgba(83,178,107,.75)',1.5);
      for(let yy=0;yy<=3.0001;yy+=.05){const major=multiple(yy,.25),tick=major?.10:.055;line([x-tick,yy,z],[x+tick,yy,z],major?'rgba(245,243,232,.72)':'rgba(245,243,232,.28)',major?1.3:.7);}
    }
    frame=requestAnimationFrame(drawGrid);
  }
  if(snapToggle)snapToggle.addEventListener('click',function(){snapEnabled=!snapEnabled;syncToggle();});
  gizmoAxes.forEach(function(handle){const axis=handle.dataset.axis;handle.addEventListener('pointerdown',function(event){activeAxis=axis;updateReadout(event);});handle.addEventListener('pointermove',function(event){if(activeAxis!==axis)return;snapAxis(axis,event);updateReadout(event);});function end(){if(activeAxis===axis)activeAxis=null;updateReadout();}handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);});
  offsetInputs.forEach(function(input,index){if(!input)return;input.addEventListener('change',function(){if(adjustingInput||!snapEnabled)return;const axis=['x','y','z'][index];snapAxis(axis,null);});});
  window.addEventListener('keydown',function(event){if(event.altKey)modifier='fine';else if(event.shiftKey)modifier='coarse';updateReadout(event);});
  window.addEventListener('keyup',function(event){modifier=event.altKey?'fine':event.shiftKey?'coarse':'default';updateReadout(event);});
  syncToggle();frame=requestAnimationFrame(drawGrid);
  window.JiangnanSnapGrid={setEnabled:function(value){snapEnabled=!!value;syncToggle();return snapEnabled;},isEnabled:function(){return snapEnabled;},getSteps:function(){return{x:.05,y:.025,z:.05,fine:.01,coarse:.25};},snapSelected:function(axis){snapAxis(axis||'x',null);return copy(preview.getAuthoringOffsets());}};
})();
