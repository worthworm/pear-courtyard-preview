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
    const value=Object.assign({type:'sideGate',openingWidth:1.42,gateHeight:1.90,gateDepth:.42,eaveOverhang:.15,doorLeafCount:1,doorOpenAngle:Math.PI*.44,doorOpenMode:'open',roofComplexity:'LITE'},spec||{});value.id=value.id||'sideGate';value.doorLeafCount=1;
    const position=value.position||[0,0,0],openingWidth=value.openingWidth||1.42,gateHeight=value.gateHeight||1.90,gateDepth=value.gateDepth||.42,joinThickness=value.postThickness||style.columnRadius*2.2,postRadius=Math.min(joinThickness*.32,style.columnRadius*.74),baseHeight=.15,columnTop=gateHeight-.13,columnHeight=columnTop-baseHeight,postX=openingWidth/2+postRadius*.78,roofWidth=openingWidth+joinThickness*2+.30,roofDepth=Math.max(.72,gateDepth*1.65),roofBaseY=gateHeight-.02,roofHeight=.44,doorBottom=.10,doorWidth=openingWidth*.92,doorHeight=gateHeight-.30,doorDepth=Math.min(.095,gateDepth*.24),doorOpenAngle=Math.max(Math.PI*.44,Number.isFinite(value.doorOpenAngle)?value.doorOpenAngle:0),doorOpenMode=value.doorOpenMode||'open',seed=value.seed||71002,authoring=value.authoringOffsets||window.JiangnanAuthoringOffsets||{},authoringScales=value.authoringScales||window.JiangnanAuthoringScales||{};
    function off(id){const raw=authoring[id];return Array.isArray(raw)?[Number(raw[0])||0,Number(raw[1])||0,Number(raw[2])||0]:[0,0,0];}
    function scl(id){const raw=authoringScales[id];return Array.isArray(raw)?raw.map(function(v){const n=Number(v);return Number.isFinite(n)?Math.max(.1,Math.min(4,n)):1;}):[1,1,1];}
    function withPart(id,pivot,action){sink.withTransform({position:off(id),scale:scl(id),pivot:pivot},action);}
    function world(local,id){const o=off(id);return[position[0]+local[0]+o[0],position[1]+local[1]+o[1],position[2]+local[2]+o[2]];}
    const wingWidth=Math.max(.30,(roofWidth-openingWidth)*.5),wingHeight=gateHeight-.04,wingDepth=gateDepth*.84,wingOffset=openingWidth/2+wingWidth/2-.02,wingZ=-gateDepth*.05,jambWidth=joinThickness*.92,jambDepth=gateDepth*.82,jambOffset=openingWidth/2+jambWidth/2;
    const pivots={platform:[0,.08,gateDepth*.46+.14],leftWall:[-wingOffset,wingHeight*.56,wingZ],rightWall:[wingOffset,wingHeight*.56,wingZ],door:[0,doorBottom+doorHeight*.55,gateDepth*.035],roof:[0,roofBaseY+roofHeight*.40,0],leftColumn:[-postX,columnTop*.56,.015],rightColumn:[postX,columnTop*.56,.015],frame:[0,roofBaseY+.08,roofDepth*.24]};
    sink.withTransform({position:position},function(){
      withPart('platform',pivots.platform,function(){sink.scope('side-gate/entry-platform','stone',function(){sink.box(0,.045,gateDepth*.46+.14,openingWidth+.34,.09,.52,'stone');});});
      withPart('leftWall',pivots.leftWall,function(){sink.scope('side-gate/wing-wall-left','wall',function(){sink.box(-wingOffset,wingHeight/2,wingZ,wingWidth,wingHeight,wingDepth,'wall');sink.box(-jambOffset,(gateHeight-.05)/2,-gateDepth*.05,jambWidth,gateHeight-.05,jambDepth,'wall');});});
      withPart('rightWall',pivots.rightWall,function(){sink.scope('side-gate/wing-wall-right','wall',function(){sink.box(wingOffset,wingHeight/2,wingZ,wingWidth,wingHeight,wingDepth,'wall');sink.box(jambOffset,(gateHeight-.05)/2,-gateDepth*.05,jambWidth,gateHeight-.05,jambDepth,'wall');});});
      withPart('leftColumn',pivots.leftColumn,function(){sink.scope('side-gate/stone-base-left','stone',function(){sink.box(-postX,baseHeight/2,.015,postRadius*2.55,baseHeight,postRadius*2.85,'stone');});sink.scope('side-gate/column-left','wood',function(){octagonalColumn(sink,-postX,.015,postRadius,baseHeight,columnHeight,'wood',JiangnanRandom.signed(seed,'side-gate-post-left')*style.woodVariation*.14);});});
      withPart('rightColumn',pivots.rightColumn,function(){sink.scope('side-gate/stone-base-right','stone',function(){sink.box(postX,baseHeight/2,.015,postRadius*2.55,baseHeight,postRadius*2.85,'stone');});sink.scope('side-gate/column-right','wood',function(){octagonalColumn(sink,postX,.015,postRadius,baseHeight,columnHeight,'wood',JiangnanRandom.signed(seed,'side-gate-post-right')*style.woodVariation*.14);});});
      withPart('frame',pivots.frame,function(){sink.scope('side-gate/lintel','wood',function(){sink.box(0,gateHeight-.11,-.005,openingWidth+postRadius*3.2,.11,gateDepth*.48,'wood',JiangnanRandom.signed(seed,'lintel')*style.woodVariation*.12);});sink.scope('side-gate/gable-frame','wood',function(){const frontZ=roofDepth*.34,left=[-roofWidth*.34,roofBaseY-.015,frontZ],right=[roofWidth*.34,roofBaseY-.015,frontZ],ridge=[0,roofBaseY+roofHeight*.72,frontZ];sink.beam3(left,ridge,.058,.058,'wood',-.012);sink.beam3(ridge,right,.058,.058,'wood',-.012);sink.beam3([0,roofBaseY-.015,frontZ],[0,roofBaseY+roofHeight*.48,frontZ],.046,.046,'wood',-.018);});});
      withPart('roof',pivots.roof,function(){JiangnanRoof.build(sink,{id:value.id,width:roofWidth,depth:roofDepth,baseY:roofBaseY,roofHeight:roofHeight,eaveOverhang:value.eaveOverhang||.15,mode:(value.roofComplexity||'LITE').toUpperCase(),seed:seed+31,showRafters:true,eaveThicknessScale:.72,ridgeScale:.84},style);});
      withPart('door',pivots.door,function(){JiangnanPlankDoorLeaf.build(sink,{id:value.id+'/door/leaf-single',position:[0,doorBottom,gateDepth*.035],width:doorWidth,height:doorHeight,depth:doorDepth,frameThickness:style.beamThickness*.40,innerInset:style.beamThickness*.40,kind:'leaf',openMode:doorOpenMode,hingeSide:'right',openAngle:doorOpenAngle,seed:seed+7,boardCount:5,seamGap:.014,braceCount:0,boardColor:[.46,.44,.40],hasRing:true},style);});
    });
    const lanternZ=position[2]+roofDepth/2+(value.eaveOverhang||.15),lanternY=position[1]+gateHeight-.18;
    sink.anchor({id:value.id+'/front/eave/lantern-left',position:[position[0]-openingWidth*.46,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/front/eave/lantern-right',position:[position[0]+openingWidth*.46,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/doorstep/center',position:[position[0],position[1],position[2]+gateDepth*.56],normal:[0,0,1],tags:['doorstep','prop']});
    const authoringParts=[{id:'leftWall',label:'左侧墙',position:world(pivots.leftWall,'leftWall')},{id:'rightWall',label:'右侧墙',position:world(pivots.rightWall,'rightWall')},{id:'door',label:'门扇',position:world(pivots.door,'door')},{id:'roof',label:'门楼屋顶',position:world(pivots.roof,'roof')},{id:'leftColumn',label:'左柱',position:world(pivots.leftColumn,'leftColumn')},{id:'rightColumn',label:'右柱',position:world(pivots.rightColumn,'rightColumn')},{id:'frame',label:'门楼木构',position:world(pivots.frame,'frame')},{id:'platform',label:'门前石台',position:world(pivots.platform,'platform')}];
    sink.metadata({id:value.id,type:'sideGate',openingWidth:openingWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:1,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,doorConstruction:'single-vertical-plank',roofType:'small-gable',columnStyle:'slender-octagonal',embeddedWallReveal:true,entryPlatform:true,doorRing:true,openingClear:true,interiorBacking:false,authoringParts:authoringParts,authoringOffsets:authoring,authoringScales:authoringScales,visualBounds:{position:position,width:roofWidth,height:roofBaseY+roofHeight,depth:roofDepth+(value.eaveOverhang||.15)*2},gameplayFootprint:null});
    return{openingWidth:openingWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:1,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,postThickness:joinThickness,roofComplexity:(value.roofComplexity||'LITE').toUpperCase()};
  }
  window.JiangnanSideGate={build:build};
})();
