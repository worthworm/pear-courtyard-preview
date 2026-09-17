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
    const value=Object.assign({type:'sideGate',openingWidth:1.42,gateHeight:1.90,gateDepth:.42,eaveOverhang:.15,doorLeafCount:2,doorOpenAngle:Math.PI*.30,doorOpenMode:'open',roofComplexity:'LITE'},spec||{});value.id=value.id||'sideGate';value.doorLeafCount=2;
    const position=value.position||[0,0,0],openingWidth=value.openingWidth||1.42,gateHeight=value.gateHeight||1.90,gateDepth=value.gateDepth||.42,joinThickness=value.postThickness||style.columnRadius*2.2,postRadius=Math.min(joinThickness*.32,style.columnRadius*.74),baseHeight=.15,columnTop=gateHeight-.13,columnHeight=columnTop-baseHeight,doorOpeningWidth=openingWidth*.92,postX=doorOpeningWidth/2+postRadius*.92,roofWidth=openingWidth+joinThickness*2+.20,roofDepth=Math.max(.82,gateDepth*1.95),roofBaseY=gateHeight-.02,roofHeight=.46,doorBottom=.10,doorHeight=gateHeight-.30,doorDepth=Math.min(.088,gateDepth*.22),doorZ=-gateDepth*.14,doorGap=.018,leafWidth=(doorOpeningWidth-doorGap)/2,doorOpenAngle=Math.max(Math.PI*.30,Number.isFinite(value.doorOpenAngle)?value.doorOpenAngle:0),doorOpenMode=value.doorOpenMode||'open',seed=value.seed||71002,authoring=value.authoringOffsets||window.JiangnanAuthoringOffsets||{},authoringScales=value.authoringScales||window.JiangnanAuthoringScales||{};
    function off(id){const raw=authoring[id];return Array.isArray(raw)?[Number(raw[0])||0,Number(raw[1])||0,Number(raw[2])||0]:[0,0,0];}
    function scl(id){const raw=authoringScales[id];return Array.isArray(raw)?raw.map(function(v){const n=Number(v);return Number.isFinite(n)?Math.max(.1,Math.min(4,n)):1;}):[1,1,1];}
    function withPart(id,pivot,action){sink.withTransform({position:off(id),scale:scl(id),pivot:pivot},action);}
    function world(local,id){const o=off(id);return[position[0]+local[0]+o[0],position[1]+local[1]+o[1],position[2]+local[2]+o[2]];}

    const eaveOverhang=value.eaveOverhang||.15,
      eaveDepth=roofDepth+eaveOverhang*2,
      roofSideEdge=roofWidth/2+eaveOverhang,
      jambWidth=Math.max(.07,joinThickness*.68),
      innerJoin=doorOpeningWidth/2+jambWidth*.30,
      outerJoin=roofSideEdge-.035,
      wingWidth=Math.max(.18,outerJoin-innerJoin),
      wingOffset=(outerJoin+innerJoin)/2,
      wingHeight=gateHeight-.04,
      wingDepth=.25,
      wingZ=0,
      wallFront=wingDepth/2,
      wallBack=-wingDepth/2,
      jambFront=wallFront-.005,
      jambBack=doorZ-doorDepth*.52,
      jambDepth=jambFront-jambBack,
      jambZ=(jambFront+jambBack)/2,
      jambOffset=doorOpeningWidth/2+jambWidth/2,
      postZ=wallFront+postRadius*.38,
      platformWidth=doorOpeningWidth+.20,
      platformBack=doorZ-gateDepth*.12,
      platformFront=postZ+.30,
      platformDepth=platformFront-platformBack,
      platformZ=(platformFront+platformBack)/2;
    const pivots={platform:[0,.055,platformZ],leftWall:[-wingOffset,wingHeight*.56,wingZ],rightWall:[wingOffset,wingHeight*.56,wingZ],door:[0,doorBottom+doorHeight*.55,doorZ],roof:[0,roofBaseY+roofHeight*.40,0],leftColumn:[-postX,columnTop*.56,postZ],rightColumn:[postX,columnTop*.56,postZ],frame:[0,roofBaseY+.08,postZ+.04]};
    sink.withTransform({position:position},function(){
      withPart('platform',pivots.platform,function(){sink.scope('side-gate/entry-platform','stone',function(){sink.box(0,.028,platformZ,platformWidth,.056,platformDepth,'stone');});});
      withPart('leftWall',pivots.leftWall,function(){sink.scope('side-gate/wing-wall-left','wall',function(){sink.box(-wingOffset,wingHeight/2,wingZ,wingWidth,wingHeight,wingDepth,'wall');sink.box(-jambOffset,(gateHeight-.08)/2,jambZ,jambWidth,gateHeight-.08,jambDepth,'wall');});});
      withPart('rightWall',pivots.rightWall,function(){sink.scope('side-gate/wing-wall-right','wall',function(){sink.box(wingOffset,wingHeight/2,wingZ,wingWidth,wingHeight,wingDepth,'wall');sink.box(jambOffset,(gateHeight-.08)/2,jambZ,jambWidth,gateHeight-.08,jambDepth,'wall');});});
      withPart('leftColumn',pivots.leftColumn,function(){sink.scope('side-gate/stone-base-left','stone',function(){sink.box(-postX,baseHeight/2,postZ,postRadius*2.55,baseHeight,postRadius*2.85,'stone');});sink.scope('side-gate/column-left','wood',function(){octagonalColumn(sink,-postX,postZ,postRadius,baseHeight,columnHeight,'wood',JiangnanRandom.signed(seed,'side-gate-post-left')*style.woodVariation*.14);});});
      withPart('rightColumn',pivots.rightColumn,function(){sink.scope('side-gate/stone-base-right','stone',function(){sink.box(postX,baseHeight/2,postZ,postRadius*2.55,baseHeight,postRadius*2.85,'stone');});sink.scope('side-gate/column-right','wood',function(){octagonalColumn(sink,postX,postZ,postRadius,baseHeight,columnHeight,'wood',JiangnanRandom.signed(seed,'side-gate-post-right')*style.woodVariation*.14);});});
      withPart('frame',pivots.frame,function(){
        sink.scope('side-gate/lintel','wood',function(){sink.box(0,gateHeight-.11,postZ-.02,doorOpeningWidth+postRadius*3.2,.11,.13,'wood',JiangnanRandom.signed(seed,'lintel')*style.woodVariation*.12);sink.box(0,gateHeight-.18,postZ+.02,doorOpeningWidth+postRadius*2.8,.055,.08,'wood',-.018);});
        sink.scope('side-gate/gable-frame','wood',function(){
          const frontZ=postZ+.045,left=[-roofWidth*.33,roofBaseY-.015,frontZ],right=[roofWidth*.33,roofBaseY-.015,frontZ],ridge=[0,roofBaseY+roofHeight*.74,frontZ];
          sink.beam3(left,ridge,.056,.056,'wood',-.012);sink.beam3(ridge,right,.056,.056,'wood',-.012);sink.beam3([0,roofBaseY-.015,frontZ],[0,roofBaseY+roofHeight*.50,frontZ],.044,.044,'wood',-.018);
          sink.box(0,roofBaseY+roofHeight*.43,frontZ,.075,.16,.05,'wood',-.02);
          sink.beam3([-postX,gateHeight-.15,postZ],[-roofWidth*.27,roofBaseY+.07,frontZ],.042,.042,'wood',-.015);sink.beam3([postX,gateHeight-.15,postZ],[roofWidth*.27,roofBaseY+.07,frontZ],.042,.042,'wood',-.015);
        });
        sink.scope('side-gate/brackets','wood',function(){[-1,1].forEach(function(side){const x=side*postX;sink.box(x,gateHeight-.20,postZ,.10,.18,.10,'wood',-.02);sink.beam3([x,gateHeight-.16,postZ],[x+side*.15,roofBaseY+.025,postZ+.03],.038,.038,'wood',-.018);});});
      });
      withPart('roof',pivots.roof,function(){JiangnanRoof.build(sink,{id:value.id,width:roofWidth,depth:roofDepth,baseY:roofBaseY,roofHeight:roofHeight,eaveOverhang:eaveOverhang,mode:(value.roofComplexity||'LITE').toUpperCase(),seed:seed+31,showRafters:true,eaveThicknessScale:.70,ridgeScale:.84},style);});
      withPart('door',pivots.door,function(){
        const halfOffset=(leafWidth+doorGap)/2,frameThickness=style.beamThickness*.34,innerInset=style.beamThickness*.34;
        JiangnanPlankDoorLeaf.build(sink,{id:value.id+'/door/leaf-left',position:[-halfOffset,doorBottom,doorZ],width:leafWidth,height:doorHeight,depth:doorDepth,frameThickness:frameThickness,innerInset:innerInset,kind:'leaf',openMode:doorOpenMode,hingeSide:'left',openAngle:doorOpenAngle,seed:seed+7,boardCount:5,seamGap:.010,braceCount:0,boardColor:[.46,.44,.40],hasRing:true},style);
        JiangnanPlankDoorLeaf.build(sink,{id:value.id+'/door/leaf-right',position:[halfOffset,doorBottom,doorZ],width:leafWidth,height:doorHeight,depth:doorDepth,frameThickness:frameThickness,innerInset:innerInset,kind:'leaf',openMode:doorOpenMode,hingeSide:'right',openAngle:doorOpenAngle,seed:seed+8,boardCount:5,seamGap:.010,braceCount:0,boardColor:[.46,.44,.40],hasRing:true},style);
      });
    });
    const lanternZ=position[2]+roofDepth/2+eaveOverhang,lanternY=position[1]+gateHeight-.18;
    sink.anchor({id:value.id+'/front/eave/lantern-left',position:[position[0]-doorOpeningWidth*.46,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/front/eave/lantern-right',position:[position[0]+doorOpeningWidth*.46,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/doorstep/center',position:[position[0],position[1],position[2]+platformZ],normal:[0,0,1],tags:['doorstep','prop']});
    const authoringParts=[{id:'leftWall',label:'左侧墙',position:world(pivots.leftWall,'leftWall')},{id:'rightWall',label:'右侧墙',position:world(pivots.rightWall,'rightWall')},{id:'door',label:'双扇门',position:world(pivots.door,'door')},{id:'roof',label:'门楼屋顶',position:world(pivots.roof,'roof')},{id:'leftColumn',label:'左柱',position:world(pivots.leftColumn,'leftColumn')},{id:'rightColumn',label:'右柱',position:world(pivots.rightColumn,'rightColumn')},{id:'frame',label:'门楼木构',position:world(pivots.frame,'frame')},{id:'platform',label:'门前石台',position:world(pivots.platform,'platform')}];
    sink.metadata({id:value.id,type:'sideGate',openingWidth:openingWidth,visualDoorOpeningWidth:doorOpeningWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:2,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,equalLeafOpenAngle:true,doorConstruction:'double-vertical-plank',roofType:'small-gable',columnStyle:'slender-octagonal',embeddedWallReveal:true,entryPlatform:true,doorRing:true,openingClear:true,interiorBacking:false,sideWallsAlignedToLateralEaves:true,sideWallOuterEdge:outerJoin,roofSideEdge:roofSideEdge,sideWallDepth:wingDepth,sideWallWidth:wingWidth,postZ:postZ,authoringParts:authoringParts,authoringOffsets:authoring,authoringScales:authoringScales,visualBounds:{position:position,width:roofWidth+eaveOverhang*2,height:roofBaseY+roofHeight,depth:Math.max(eaveDepth,platformDepth)},gameplayFootprint:null});
    return{openingWidth:openingWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:2,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,postThickness:joinThickness,roofComplexity:(value.roofComplexity||'LITE').toUpperCase()};
  }
  window.JiangnanSideGate={build:build};
})();
