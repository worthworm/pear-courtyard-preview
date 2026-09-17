'use strict';

(function(){
  function build(sink,spec,style){
    const width=spec.width,height=spec.height,depth=spec.depth||.055,frame=spec.frameThickness||style.beamThickness*.7,innerInset=Number.isFinite(spec.innerInset)?spec.innerInset:frame,bar=spec.barThickness||frame*.22,barDepthScale=Number.isFinite(spec.barDepthScale)?spec.barDepthScale:.72,gridX=spec.gridX||style.latticeDensity.gridX,gridY=spec.gridY||style.latticeDensity.gridY,showBacking=spec.backing!==false;
    const hingeSide=spec.hingeSide==='right'?'right':'left',hingeX=hingeSide==='left'?-width/2:width/2,closedAngle=0,openAngle=Number.isFinite(spec.openAngle)?spec.openAngle:Math.PI*.46,currentAngle=spec.openMode==='open'?openAngle:spec.openMode==='half-open'?openAngle*.5:0;
    const metadata={id:spec.id,type:'latticeFacadeUnit',hingePivot:[hingeX,height/2,0],closedTransform:{position:spec.position||[0,0,0],rotationY:closedAngle},openTransform:{position:spec.position||[0,0,0],rotationY:(hingeSide==='left'?1:-1)*openAngle},currentState:spec.openMode||'closed',gridX:gridX,gridY:gridY,frameThickness:frame,barThickness:bar,innerInset:innerInset,barDepthScale:barDepthScale,leafDepth:depth,barDepth:depth*barDepthScale,backing:showBacking};
    sink.metadata(metadata);
    sink.withTransform({position:spec.position||[0,0,0],pivot:[hingeX,0,0],yaw:(hingeSide==='left'?1:-1)*currentAngle},function(){
      if(showBacking)sink.scope('lattice/backing','interior',function(){sink.box(0,height/2,-depth*.72,width-innerInset*1.25,height-innerInset*1.25,depth*.28,'interior');});
      sink.scope('lattice/frame','wood',function(){
        const band=JiangnanRandom.signed(spec.seed||1,'frame')*style.woodVariation*.22;
        sink.box(-width/2+frame/2,height/2,0,frame,height,depth,'wood',band);sink.box(width/2-frame/2,height/2,0,frame,height,depth,'wood',band);
        sink.box(0,frame/2,0,width,frame,depth,'wood',band);sink.box(0,height-frame/2,0,width,frame,depth,'wood',band);
      });
      sink.scope('lattice/grid','wood',function(){
        for(let x=1;x<gridX;x++){const px=-width/2+innerInset+(width-2*innerInset)*x/gridX,band=JiangnanRandom.signed(spec.seed||1,'vertical-band-'+Math.floor(x/2))*style.woodVariation*.16;sink.box(px,height/2,depth*.16,bar,height-2*innerInset,depth*barDepthScale,'wood',band);}
        for(let y=1;y<gridY;y++){const py=innerInset+(height-2*innerInset)*y/gridY,band=JiangnanRandom.signed(spec.seed||1,'horizontal-band-'+Math.floor(y/2))*style.woodVariation*.16;sink.box(0,py,depth*.16,width-2*innerInset,bar,depth*barDepthScale,'wood',band);}
      });
      if(spec.kind==='door')sink.scope('lattice/threshold','stone',function(){sink.box(0,-.025,0,width+.14,.05,depth*2.4,'stone');});
    });
    const prefix=spec.id;
    sink.anchor({id:prefix+'/hinge',position:[(spec.position||[0,0,0])[0]+hingeX,(spec.position||[0,0,0])[1]+height/2,(spec.position||[0,0,0])[2]],normal:[0,0,1],tags:['hinge','runtime-animation']});
    return metadata;
  }
  window.JiangnanLatticeFacadeUnit={build:build};
})();
