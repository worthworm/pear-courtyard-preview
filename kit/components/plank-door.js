'use strict';

(function(){
  function build(sink,spec,style){
    const width=spec.width,height=spec.height,depth=spec.depth||.16,frame=spec.frameThickness||style.beamThickness*.52,innerInset=Number.isFinite(spec.innerInset)?spec.innerInset:frame,boardCount=Math.max(5,Math.min(8,spec.boardCount||6)),seamGap=Number.isFinite(spec.seamGap)?spec.seamGap:.012,braceThickness=Number.isFinite(spec.braceThickness)?spec.braceThickness:.055,braceDepth=Number.isFinite(spec.braceDepth)?spec.braceDepth:Math.min(depth*.28,.06),hingeSide=spec.hingeSide==='right'?'right':'left',hingeX=hingeSide==='left'?-width/2:width/2,hingeZ=depth/2,openAngle=Number.isFinite(spec.openAngle)?spec.openAngle:Math.PI*.20,currentAngle=spec.openMode==='open'?openAngle:spec.openMode==='half-open'?openAngle*.5:0;
    const boardWidth=(width-2*innerInset-seamGap*(boardCount-1))/boardCount,boardHeight=Math.max(.08,height-frame*2),boardY=frame+boardHeight/2;
    const boardColor=spec.boardColor||style.doorBoardColor||sink.tone(sink.color('wood'),.11),metadata={id:spec.id,type:'plankDoorLeaf',hingePivot:[hingeX,height/2,hingeZ],closedTransform:{position:spec.position||[0,0,0],rotationY:0},openTransform:{position:spec.position||[0,0,0],rotationY:(hingeSide==='left'?1:-1)*openAngle},currentState:spec.openMode||'closed',boardCount:boardCount,boardWidth:boardWidth,boardHeight:boardHeight,seamGap:seamGap,frameThickness:frame,leafDepth:depth,braceCount:spec.braceCount===0?0:1,braceThickness:braceThickness,braceDepth:braceDepth,boardColor:boardColor,construction:'vertical-plank'};
    sink.metadata(metadata);
    sink.withTransform({position:spec.position||[0,0,0],pivot:[hingeX,0,hingeZ],yaw:(hingeSide==='left'?1:-1)*currentAngle},function(){
      sink.scope('plank-door/frame','wood',function(){
        const band=JiangnanRandom.signed(spec.seed||1,'frame')*style.woodVariation*.18;
        sink.box(-width/2+frame/2,height/2,0,frame,height,depth,'wood',band);
        sink.box(width/2-frame/2,height/2,0,frame,height,depth,'wood',band);
        sink.box(0,frame/2,0,width,frame,depth,'wood',band);
        sink.box(0,height-frame/2,0,width,frame,depth,'wood',band);
      });
      sink.scope('plank-door/boards','wood',function(){
        for(let i=0;i<boardCount;i++){
          const x=-width/2+innerInset+boardWidth/2+i*(boardWidth+seamGap),band=JiangnanRandom.signed(spec.seed||1,'board-'+i)*style.woodVariation*.10;
          sink.box(x,boardY,depth*.035,boardWidth,boardHeight,depth*.86,boardColor,band);
        }
      });
      if(spec.braceCount!==0)sink.scope('plank-door/brace','wood',function(){
        const y=height*.56,z=-depth*.20;
        sink.box(0,y,z,width-2*innerInset+frame*.35,braceThickness,braceDepth,'wood',JiangnanRandom.signed(spec.seed||1,'brace')*style.woodVariation*.12);
      });
      if(spec.kind==='door')sink.scope('plank-door/threshold','stone',function(){sink.box(0,-.025,0,width+.14,.05,depth*1.35,'stone');});
    });
    sink.anchor({id:spec.id+'/hinge',position:[(spec.position||[0,0,0])[0]+hingeX,(spec.position||[0,0,0])[1]+height/2,(spec.position||[0,0,0])[2]+hingeZ],normal:[0,0,1],tags:['hinge','runtime-animation']});
    return metadata;
  }
  window.JiangnanPlankDoorLeaf={build:build};
})();
