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
    const value=Object.assign({type:'sideGate',openingWidth:1.42,gateHeight:1.90,gateDepth:.42,eaveOverhang:.18,doorLeafCount:1,doorOpenAngle:Math.PI*.43,doorOpenMode:'open',roofComplexity:'LITE'},spec||{});value.id=value.id||'sideGate';value.doorLeafCount=1;
    const position=value.position||[0,0,0],openingWidth=value.openingWidth||1.42,gateHeight=value.gateHeight||1.90,gateDepth=value.gateDepth||.42,joinThickness=value.postThickness||style.columnRadius*2.2,doorOpeningWidth=openingWidth*.72,postRadius=Math.min(joinThickness*.30,style.columnRadius*.70),baseHeight=.14,columnTop=gateHeight-.05,columnHeight=columnTop-baseHeight,postX=doorOpeningWidth/2+postRadius*.95,roofWidth=openingWidth+joinThickness*2+.48,roofDepth=Math.max(1.02,gateDepth*2.45),roofBaseY=gateHeight-.015,roofHeight=.54,doorBottom=.08,doorWidth=doorOpeningWidth*.94,doorHeight=gateHeight-.20,doorDepth=Math.min(.082,gateDepth*.20),doorZ=-gateDepth*.25,doorOpenAngle=Math.max(Math.PI*.43,Number.isFinite(value.doorOpenAngle)?value.doorOpenAngle:0),doorOpenMode=value.doorOpenMode||'open',seed=value.seed||71002,authoring=value.authoringOffsets||window.JiangnanAuthoringOffsets||{},authoringScales=value.authoringScales||window.JiangnanAuthoringScales||{};
    function off(id){const raw=authoring[id];return Array.isArray(raw)?[Number(raw[0])||0,Number(raw[1])||0,Number(raw[2])||0]:[0,0,0];}
    function scl(id){const raw=authoringScales[id];return Array.isArray(raw)?raw.map(function(v){const n=Number(v);return Number.isFinite(n)?Math.max(.1,Math.min(4,n)):1;}):[1,1,1];}
    function withPart(id,pivot,action){sink.withTransform({position:off(id),scale:scl(id),pivot:pivot},action);}
    function world(local,id){const o=off(id);return[position[0]+local[0]+o[0],position[1]+local[1]+o[1],position[2]+local[2]+o[2]];}

    const outerJoin=openingWidth/2+joinThickness*.92,wingInner=postX+postRadius*.70,wingWidth=Math.max(.28,outerJoin-wingInner),wingCenter=(outerJoin+wingInner)/2,wingHeight=gateHeight-.11,wingDepth=Math.max(.34,gateDepth*.90),wingZ=-gateDepth*.08;
    const jambWidth=Math.max(.075,postRadius*.95),jambDepth=gateDepth*.92,jambOffset=doorOpeningWidth/2+jambWidth/2;
    const platformDepth=.72,platformWidth=doorOpeningWidth+postRadius*4.6,platformZ=.18;
    const pivots={platform:[0,.05,platformZ],leftWall:[-wingCenter,wingHeight*.55,wingZ],rightWall:[wingCenter,wingHeight*.55,wingZ],door:[0,doorBottom+doorHeight*.52,doorZ],roof:[0,roofBaseY+roofHeight*.42,0],leftColumn:[-postX,columnTop*.54,.04],rightColumn:[postX,columnTop*.54,.04],frame:[0,roofBaseY+.10,roofDepth*.30]};

    sink.withTransform({position:position},function(){
      withPart('platform',pivots.platform,function(){
        sink.scope('side-gate/entry-platform','stone',function(){
          sink.box(0,.04,platformZ,platformWidth,.08,platformDepth,'stone');
          const cols=3,rows=3,tileW=platformWidth/cols*.94,tileD=platformDepth/rows*.90;
          for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
            const x=-platformWidth/2+(col+.5)*platformWidth/cols,z=platformZ-platformDepth/2+(row+.5)*platformDepth/rows,band=JiangnanRandom.signed(seed,'step-'+row+'-'+col)*.025;
            sink.box(x,.086,z,tileW,.018,tileD,'stone',band);
          }
        });
      });
      withPart('leftWall',pivots.leftWall,function(){
        sink.scope('side-gate/wing-wall-left','wall',function(){
          sink.box(-wingCenter,wingHeight/2,wingZ,wingWidth,wingHeight,wingDepth,'wall');
          sink.box(-jambOffset,(gateHeight-.13)/2,doorZ,jambWidth,gateHeight-.13,jambDepth,'wall');
        });
      });
      withPart('rightWall',pivots.rightWall,function(){
        sink.scope('side-gate/wing-wall-right','wall',function(){
          sink.box(wingCenter,wingHeight/2,wingZ,wingWidth,wingHeight,wingDepth,'wall');
          sink.box(jambOffset,(gateHeight-.13)/2,doorZ,jambWidth,gateHeight-.13,jambDepth,'wall');
        });
      });
      withPart('leftColumn',pivots.leftColumn,function(){
        sink.scope('side-gate/stone-base-left','stone',function(){
          sink.box(-postX,.035,.04,postRadius*2.75,.07,postRadius*3.15,'stone');
          sink.box(-postX,.095,.04,postRadius*2.35,.05,postRadius*2.70,'stone');
        });
        sink.scope('side-gate/column-left','wood',function(){octagonalColumn(sink,-postX,.04,postRadius,baseHeight,columnHeight,'wood',JiangnanRandom.signed(seed,'side-gate-post-left')*style.woodVariation*.14);});
      });
      withPart('rightColumn',pivots.rightColumn,function(){
        sink.scope('side-gate/stone-base-right','stone',function(){
          sink.box(postX,.035,.04,postRadius*2.75,.07,postRadius*3.15,'stone');
          sink.box(postX,.095,.04,postRadius*2.35,.05,postRadius*2.70,'stone');
        });
        sink.scope('side-gate/column-right','wood',function(){octagonalColumn(sink,postX,.04,postRadius,baseHeight,columnHeight,'wood',JiangnanRandom.signed(seed,'side-gate-post-right')*style.woodVariation*.14);});
      });
      withPart('frame',pivots.frame,function(){
        const frontZ=roofDepth*.50+(value.eaveOverhang||.18)*.30,innerFrontZ=roofDepth*.36,bargeLeft=[-roofWidth*.44,roofBaseY+.01,frontZ],bargeRight=[roofWidth*.44,roofBaseY+.01,frontZ],ridge=[0,roofBaseY+roofHeight*.84,frontZ],tieY=roofBaseY+.02;
        sink.scope('side-gate/lintel','wood',function(){
          sink.box(0,gateHeight-.07,.015,doorOpeningWidth+postRadius*3.4,.12,gateDepth*.42,'wood',JiangnanRandom.signed(seed,'lintel')*style.woodVariation*.12);
          sink.box(0,gateHeight-.16,innerFrontZ,doorOpeningWidth+postRadius*3.8,.075,.075,'wood',-.018);
        });
        sink.scope('side-gate/gable-frame','wood',function(){
          sink.beam3(bargeLeft,ridge,.066,.070,'wood',-.018);sink.beam3(ridge,bargeRight,.066,.070,'wood',-.018);
          sink.beam3([-roofWidth*.34,tieY,frontZ],[roofWidth*.34,tieY,frontZ],.058,.058,'wood',-.02);
          sink.beam3([0,tieY,frontZ],[0,roofBaseY+roofHeight*.58,frontZ],.050,.050,'wood',-.025);
          sink.beam3([-postX,gateHeight-.10,innerFrontZ],[-roofWidth*.34,roofBaseY+.10,frontZ],.052,.052,'wood',-.015);
          sink.beam3([postX,gateHeight-.10,innerFrontZ],[roofWidth*.34,roofBaseY+.10,frontZ],.052,.052,'wood',-.015);
        });
        sink.scope('side-gate/brackets','wood',function(){
          [-1,1].forEach(function(side){
            const x=side*postX;
            sink.box(x,gateHeight-.18,innerFrontZ,.10,.20,.10,'wood',-.02);
            sink.beam3([x,gateHeight-.14,innerFrontZ],[x+side*.18,roofBaseY+.02,frontZ*.91],.045,.045,'wood',-.018);
          });
        });
      });
      withPart('roof',pivots.roof,function(){
        JiangnanRoof.build(sink,{id:value.id,width:roofWidth,depth:roofDepth,baseY:roofBaseY,roofHeight:roofHeight,eaveOverhang:value.eaveOverhang||.18,mode:(value.roofComplexity||'LITE').toUpperCase(),seed:seed+31,showRafters:true,eaveThicknessScale:.70,ridgeScale:.90},style);
      });
      withPart('door',pivots.door,function(){
        JiangnanPlankDoorLeaf.build(sink,{id:value.id+'/door/leaf-single',position:[0,doorBottom,doorZ],width:doorWidth,height:doorHeight,depth:doorDepth,frameThickness:style.beamThickness*.34,innerInset:style.beamThickness*.34,kind:'leaf',openMode:doorOpenMode,hingeSide:'right',openAngle:doorOpenAngle,seed:seed+7,boardCount:6,seamGap:.010,braceCount:0,boardColor:[.41,.40,.37],hasRing:true},style);
      });
    });

    const lanternZ=position[2]+roofDepth/2+(value.eaveOverhang||.18),lanternY=position[1]+gateHeight-.20;
    sink.anchor({id:value.id+'/front/eave/lantern-left',position:[position[0]-postX,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/front/eave/lantern-right',position:[position[0]+postX,lanternY,lanternZ],normal:[0,0,1],tags:['eave-hang','lantern']});
    sink.anchor({id:value.id+'/doorstep/center',position:[position[0],position[1],position[2]+platformZ],normal:[0,0,1],tags:['doorstep','prop']});
    const authoringParts=[{id:'leftWall',label:'左侧墙',position:world(pivots.leftWall,'leftWall')},{id:'rightWall',label:'右侧墙',position:world(pivots.rightWall,'rightWall')},{id:'door',label:'门扇',position:world(pivots.door,'door')},{id:'roof',label:'门楼屋顶',position:world(pivots.roof,'roof')},{id:'leftColumn',label:'左柱',position:world(pivots.leftColumn,'leftColumn')},{id:'rightColumn',label:'右柱',position:world(pivots.rightColumn,'rightColumn')},{id:'frame',label:'门楼木构',position:world(pivots.frame,'frame')},{id:'platform',label:'门前石台',position:world(pivots.platform,'platform')}];
    sink.metadata({id:value.id,type:'sideGate',openingWidth:openingWidth,visualDoorOpeningWidth:doorOpeningWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:1,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,doorConstruction:'single-vertical-plank',roofType:'deep-layered-gable',columnStyle:'slender-octagonal',embeddedWallReveal:true,entryPlatform:true,pavedThreshold:true,doorRing:true,openingClear:true,interiorBacking:false,authoringParts:authoringParts,authoringOffsets:authoring,authoringScales:authoringScales,visualBounds:{position:position,width:roofWidth,height:roofBaseY+roofHeight,depth:roofDepth+(value.eaveOverhang||.18)*2},gameplayFootprint:null});
    return{openingWidth:openingWidth,gateHeight:gateHeight,gateDepth:gateDepth,doorLeafCount:1,doorOpenAngle:doorOpenAngle,doorOpenMode:doorOpenMode,postThickness:joinThickness,roofComplexity:(value.roofComplexity||'LITE').toUpperCase()};
  }
  window.JiangnanSideGate={build:build};
})();
