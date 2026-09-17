'use strict';

(function(){
  const preview=window.JiangnanPreview,panel=document.querySelector('#authoring-panel'),partSelect=document.querySelector('#part-select'),gizmo=document.querySelector('#transform-gizmo'),gizmoAxes=gizmo?Array.from(gizmo.querySelectorAll('[data-axis]')):[],resetPart=document.querySelector('#reset-part'),resetAll=document.querySelector('#reset-all'),snapReadout=document.querySelector('#snap-readout');
  if(!preview||!panel||!gizmo)return;
  const axisIndex={x:0,y:1,z:2};
  let mode='move',scales={},scaleDrag=null;
  window.JiangnanAuthoringScales=scales;

  const style=document.createElement('style');
  style.textContent='.gizmo-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}.gizmo-mode button{padding:6px 7px;font-size:11px}.scale-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:9px}.scale-grid label{display:grid;grid-template-columns:14px 1fr;gap:4px;align-items:center}.scale-grid input{width:100%;min-width:0;border:1px solid #f3efe055;background:#f4f1e9;color:#26302c;border-radius:2px;padding:6px 7px;font:12px system-ui,sans-serif}.scale-caption{margin:7px 0 0;opacity:.72;font-size:11px}.scale-mode .gizmo-axis{height:8px!important}.scale-mode .gizmo-axis span{width:18px;height:18px;right:-9px;border-radius:2px;font-size:9px}.scale-mode .gizmo-origin{border-radius:2px}';
  document.head.appendChild(style);

  const modeRow=document.createElement('div');modeRow.className='gizmo-mode';
  const moveButton=document.createElement('button');moveButton.type='button';moveButton.textContent='移动';moveButton.className='active';
  const scaleButton=document.createElement('button');scaleButton.type='button';scaleButton.textContent='沿轴缩放';
  modeRow.appendChild(moveButton);modeRow.appendChild(scaleButton);
  const offsetGrid=panel.querySelector('.offset-grid');panel.insertBefore(modeRow,offsetGrid||panel.firstChild);

  const scaleGrid=document.createElement('div');scaleGrid.className='scale-grid';
  const scaleInputs=['X','Y','Z'].map(function(label,index){const wrap=document.createElement('label'),input=document.createElement('input');wrap.appendChild(document.createTextNode(label));input.type='number';input.min='.1';input.max='4';input.step='.05';input.value='1.000';input.dataset.index=String(index);wrap.appendChild(input);scaleGrid.appendChild(wrap);return input;});
  const snapControls=panel.querySelector('.snap-controls');panel.insertBefore(scaleGrid,snapControls||panel.querySelector('.authoring-actions'));
  const caption=document.createElement('p');caption.className='scale-caption';caption.textContent='缩放模式：沿 X / Y / Z 单轴缩放。默认 5%，Alt 1%，Shift 25%。';scaleGrid.insertAdjacentElement('afterend',caption);

  function clamp(value){return Math.max(.1,Math.min(4,value));}
  function selectedId(){const state=preview.getState();return state.authoring&&state.authoring.selected||partSelect&&partSelect.value||'leftWall';}
  function ensureScale(id){if(!Array.isArray(scales[id]))scales[id]=[1,1,1];return scales[id];}
  function format(value){return(Math.round(value*1000)/1000).toFixed(3);}
  function syncInputs(){const values=ensureScale(selectedId());scaleInputs.forEach(function(input,index){if(document.activeElement!==input)input.value=format(values[index]);});}
  function rebuild(){window.JiangnanAuthoringScales=scales;preview.rebuild();syncInputs();}
  function setMode(value){mode=value==='scale'?'scale':'move';moveButton.classList.toggle('active',mode==='move');scaleButton.classList.toggle('active',mode==='scale');gizmo.classList.toggle('scale-mode',mode==='scale');caption.hidden=mode!=='scale';if(snapReadout&&mode==='scale')snapReadout.textContent='缩放 5% · Alt 1% · Shift 25%';else if(snapReadout&&window.JiangnanSnapGrid&&window.JiangnanSnapGrid.isEnabled())snapReadout.textContent='X/Z 5cm · Y 2.5cm';return mode;}
  function sub(a,b){return a.map(function(value,index){return value-b[index];});}
  function dot(a,b){return a.reduce(function(sum,value,index){return sum+value*b[index];},0);}
  function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function norm(a){const length=Math.hypot.apply(null,a)||1;return a.map(function(value){return value/length;});}
  function mul(a,b){const result=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)result[j*4+i]+=a[k*4+i]*b[j*4+k];return result;}
  function matrix(aspect){const camera=preview.getCamera(),target=camera.target,eye=[target[0]+Math.sin(camera.yaw)*Math.cos(camera.pitch)*camera.distance,target[1]+Math.sin(camera.pitch)*camera.distance,target[2]+Math.cos(camera.yaw)*Math.cos(camera.pitch)*camera.distance],z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x),view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1],near=.1,far=100,f=1/Math.tan(.47),projection=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];return mul(projection,view);}
  function project(point){const width=innerWidth,height=innerHeight,m=matrix(width/height),x=point[0],y=point[1],z=point[2],cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13],cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<=0)return null;return{x:(cx/cw*.5+.5)*width,y:(1-(cy/cw*.5+.5))*height};}
  function selectedPart(){const state=preview.getState(),report=preview.getReport(),meta=(report.metrics&&report.metrics.metadata||[]).find(function(value){return value.type==='sideGate'&&Array.isArray(value.authoringParts);});return meta&&meta.authoringParts.find(function(value){return state.authoring&&value.id===state.authoring.selected;})||null;}
  function stepFor(event){if(event.altKey)return .01;if(event.shiftKey)return .25;return .05;}
  function snapScale(value,event){const step=stepFor(event);return clamp(Math.round(value/step)*step);}

  moveButton.addEventListener('click',function(){setMode('move');});scaleButton.addEventListener('click',function(){setMode('scale');});
  if(partSelect)partSelect.addEventListener('change',syncInputs);
  scaleInputs.forEach(function(input,index){input.addEventListener('change',function(){const number=Number(input.value);if(!Number.isFinite(number)){syncInputs();return;}ensureScale(selectedId())[index]=clamp(number);rebuild();});});
  if(resetPart)resetPart.addEventListener('click',function(){delete scales[selectedId()];rebuild();});
  if(resetAll)resetAll.addEventListener('click',function(){scales={};window.JiangnanAuthoringScales=scales;rebuild();});

  gizmoAxes.forEach(function(handle){
    const axis=handle.dataset.axis,index=axisIndex[axis],vector=axis==='x'?[1,0,0]:axis==='y'?[0,1,0]:[0,0,1];
    handle.addEventListener('pointerdown',function(event){
      if(mode!=='scale')return;const state=preview.getState();if(!state.authoring||!state.authoring.enabled)return;const part=selectedPart();if(!part)return;const origin=project(part.position),end=project([part.position[0]+vector[0],part.position[1]+vector[1],part.position[2]+vector[2]]);if(!origin||!end)return;const dx=end.x-origin.x,dy=end.y-origin.y,length=Math.hypot(dx,dy);if(length<8)return;
      event.preventDefault();event.stopImmediatePropagation();handle.setPointerCapture(event.pointerId);const current=ensureScale(part.id);scaleDrag={id:event.pointerId,index:index,partId:part.id,startX:event.clientX,startY:event.clientY,startValue:current[index],dirX:dx/length,dirY:dy/length,pixelsPerUnit:length};
    },true);
    handle.addEventListener('pointermove',function(event){if(!scaleDrag||scaleDrag.id!==event.pointerId||mode!=='scale')return;event.preventDefault();event.stopImmediatePropagation();const delta=(event.clientX-scaleDrag.startX)*scaleDrag.dirX+(event.clientY-scaleDrag.startY)*scaleDrag.dirY,value=scaleDrag.startValue+delta/scaleDrag.pixelsPerUnit,next=snapScale(value,event);ensureScale(scaleDrag.partId)[scaleDrag.index]=next;rebuild();},true);
    function end(event){if(!scaleDrag||scaleDrag.id!==event.pointerId)return;event.preventDefault();event.stopImmediatePropagation();scaleDrag=null;syncInputs();}
    handle.addEventListener('pointerup',end,true);handle.addEventListener('pointercancel',end,true);
  });

  syncInputs();setMode('move');
  window.JiangnanScaleGizmo={setMode:setMode,getMode:function(){return mode;},getScales:function(){return JSON.parse(JSON.stringify(scales));},reset:function(id){if(id)delete scales[id];else scales={};window.JiangnanAuthoringScales=scales;rebuild();return JSON.parse(JSON.stringify(scales));}};
})();
