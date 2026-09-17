'use strict';

(function(){
  function octagonalColumn(sink,x,z,radius,baseY,height,color,variation){
    const sides=8,bottom=baseY,top=baseY+height,lower=[],upper=[];
    for(let i=0;i<sides;i++){
      const angle=Math.PI*2*i/sides,cs=Math.cos(angle),sn=Math.sin(angle);
      lower.push([x+cs*radius,bottom,z+sn*radius]);
      upper.push([x+cs*radius,top,z+sn*radius]);
    }
    for(let i=0;i<sides;i++){
      const next=(i+1)%sides;
      sink.tri(lower[i],lower[next],upper[next],color);sink.tri(lower[i],upper[next],upper[i],color);
      sink.tri([x,bottom,z],lower[next],lower[i],color);sink.tri([x,top,z],upper[i],upper[next],color);
    }
  }
  function build(sink,spec,style){
    const value=Object.assign({type:'sideGate',openingWidth:1.42,gateHeight:1.90,gateDepth:.42,eaveOverhang:.15,doorLeafCount:1,doorOpenAngle:Math.PI*.24,doorOpenMode:'open',roofComplexity:'LITE'},spec||{});value.id=value.id||'sideGate';value.doorLeafCount=1;
    const position=value.position||[0,0,0],openingWidth=value.openingWidth||1.42,gateHeight=value.gateHeight||1.90,gateDepth=value.gateDepth||.42,joinThickness=value.postThickness||style.columnRadius*2.2,postRadius=Math.min(joinThickness*.32,style.columnRadius*.74),baseHeight=.15,columnTop=gateHeight-.13,columnHeight=columnTop-baseHeight,postX=openingWidth/2+postRadius*.78,roofWidth=openingWidth+joinThickness*2+.30,roofDepth=Math.max(.72,gateDepth*1.65),roofBaseY=gateHeight-.02,roofHeight=.44,doorBottom=.10,doorWidth=openingWidth*.92,doorHeight=gateHeight-.30,doorDepth=Math.min(.095,gateDepth*.24),doorOpenAngle=Math.max(Math.PI*.24,Number.isFinite(value.doorOpenAngle)?value.doorOpenAngle:0),doorOpenMode=value.doorOpenMode||'open',seed=value.seed||71002;
    sink.withTransform({position:position},function(){
      sink.scope('side-gate/entry-platform','stone',function(){sink.box(0,.045,gateDepth*.46+.14,openingWidth+.34,.09,.52,'stone');});
      sink.scope('side-gate/wall-reveals','wall',function(){
        const revealWidth=joinThickness*.92,revealX=openingWidth/2+revealWidth/2,revealDepth=gateDepth*.82;
        sink.box(-revealX,(gateHeight-.05)/2,-gateDepth*.05,revealWidth,gateHeight-.05,revealDepth,'wall');
        sink.box(revealX,(gateHeight-.05)/2,-gateDepth*.05,revealWidth,gateHeight-.05,revealDepth,'wall');
      });
      sink.scope('side-gate/interior-recess','interior',function(){sink.box(0,doorBottom+doorHeight/2,-gateDepth*.23,openingWidth*.95,doorHeight+.08,.05,'interior');});
      sink.scope('side-gate/stone-bases','stone',function(){
        const baseWidth=postRadius*2.55,baseDepth=postRadius*2.85;
        sink.box(-postX,baseHeight/2,.015,baseWidth,baseHeight,baseDepth,'stone');sink.box(postX,baseHeight/2,.015,baseWidth,baseHeight,baseDepth,'stone');
      });
      sink.scope('side-gate/slender-columns','wood',function(){
        const band=JiangnanRandom.signed(seed,'side-gate-posts')*style.woodVariation*.14;
        octagonalColumn(sink,-postX,.015,postRadius,baseHeight,columnHeight,'wood',band);octagonalColumn(sink,postX,.015,postRadius,baseHeight,columnHeight,'wood',band);
      });
      sink.scope('side-gate/lintel','wood',function(){sink.box(0,gateHeight-.11,-.005,openingWidth+postRadius*3.2,.11,gateDepth*.48,'wood',JiangnanRandom.signed(seed,'lintel')*style.woodVariation*.12);});
      sink.scope('side-gate/gable-frame','wood',function(){
        const frontZ=roofDepth*.34,left=[-roofWidth*.34,roofBaseY-.015,frontZ],right=[roofWidth*.34,roofBaseY-.015,frontZ],ridge=[0,roofBaseY+roofHeight*.72,frontZ];
        sink.beam3(left,ridge,.058,.058,'wood',-.012);sink.beam3(ridge,right,.058,.058,'wood',-.012);sink.beam3([0,roofBaseY-.015,frontZ],[0,roofBaseY+roofHeight*.48,frontZ],.046,.046,'wood',-.018);
      });
    });
    JiangnanPlankDoorLeaf.build(sink,{id:value.id+'/door/leaf-single',position:[position[0],position[1]+doorBottom,position[2]+gateDepth*.035],width:doorWidth,height:doorHeight,depth:doorDepth,frameThickness:style.beamThickness*.40,innerInset:style.beamThickness*.40,kind:'door',openMode:doorOpenMode,hingeSide:'right',openAngle:doorOpenAngle,seed:seed+7,boardCount:5,seamGap:.014,braceCount:0,boardColor:[.46,.44,.40],hasRing:true},style);
    sink.withTransform({position:position},function(){JiangnanRoof.build(sink,{id:value.id,width:roofWidth,depth:roofDepth,baseY:roofBaseY,roofHeight:roofHeight,eaveOverhang:value.eaveOverhang||.15,mode:(value.roofComplexity||'LITE').toUpperCase(),seed:seed+31,showRafters:true,eaveThicknessScale:.72,ridgeScale:.84},style);});
    const lanternZ=position[2]+roofDepth/2+(value.eaveOverhang||.15),lanternY=position[1]+gateHeight-.18;
    sink.anchor({id:value.id+'/front/eave/lantern-left',position:[position[0]-openingWidth*.46,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/front/eave/lantern-right',position:[position[0]+openingWidth*.46,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/doorstep/center',position:[position[0],position[1],position[2]+gateDepth*.56],normal:[0,0,1],tags:['doorstep','prop']});
    sink.metadata({id:value.id,type:'sideGate',openingWidth:openingWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:1,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,doorConstruction:'single-vertical-plank',roofType:'small-gable',columnStyle:'slender-octagonal',embeddedWallReveal:true,entryPlatform:true,doorRing:true,visualBounds:{position:position,width:roofWidth,height:roofBaseY+roofHeight,depth:roofDepth+(value.eaveOverhang||.15)*2},gameplayFootprint:null});
    return{openingWidth:openingWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:1,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,postThickness:joinThickness,roofComplexity:(value.roofComplexity||'LITE').toUpperCase()};
  }
  window.JiangnanSideGate={build:build};
})();
