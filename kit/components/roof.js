'use strict';

(function(){
  function tileColorValue(sink,value){return typeof value==='string'?sink.color(value):value;}
  function buildSlopeTiles(sink,profile,mode,seed,style,tileColor){
    const detail=mode==='DETAIL',tile=style.tileScale,segments=detail?7:5,
      targetColumnSpacing=tile*(detail?.74:.86),usableWidth=Math.max(tile*1.8,profile.width-tile*.58),
      columns=Math.max(detail?7:6,Math.round(usableWidth/targetColumnSpacing)),columnStep=columns>1?usableWidth/(columns-1):usableWidth,
      radius=Math.min(tile*.56,columnStep*.53),slopeLength=Math.hypot(profile.halfDepth,profile.ridgeY-profile.baseY),
      targetRowLength=tile*(detail?1.16:1.34),rows=Math.max(detail?4:3,Math.ceil(slopeLength/targetRowLength)),
      ridgeInset=Math.min(.075,Math.max(.018,radius*.34/Math.max(slopeLength,.001))),rowStep=(1-ridgeInset)/rows,
      overlap=rowStep*(detail?.045:.035),xStart=-usableWidth/2,base=tileColorValue(sink,tileColor);
    for(let column=0;column<columns;column++){
      const x=xStart+column*columnStep;
      for(let row=0;row<rows;row++){
        const t0=Math.max(ridgeInset,ridgeInset+row*rowStep-(row?overlap:0)),
          t1=Math.min(1,ridgeInset+(row+1)*rowStep+(row<rows-1?overlap:0)),
          band=Math.floor(column/3)+Math.floor(row/2),variation=JiangnanRandom.signed(seed,'roof-tile-'+band+'-'+column+'-'+row)*style.tileVariation*(detail?.22:.16),
          tone=sink.tone(base,variation),normalLift=(rows-1-row)*radius*.012;
        [-1,1].forEach(function(side){
          JiangnanElements.curvedTile(sink,profile,side,x,t0,t1,radius,segments,tone,row===rows-1,normalLift);
        });
      }
    }
    return{columns:columns,rows:rows,radius:radius,segments:segments};
  }
  function build(sink,spec,style){
    const profile=JiangnanProfiles.gableRoof({width:spec.width,depth:spec.depth,baseY:spec.baseY,roofHeight:spec.roofHeight,pitch:spec.pitch||style.roofBasePitch,eaveOverhang:spec.eaveOverhang});
    const mode=(spec.mode||'LITE').toUpperCase(),seed=spec.seed||1,tile=style.tileScale,tileColor=spec.tileColor||'tile',baseTile=tileColorValue(sink,tileColor);
    sink.scope('roof/base','tile',function(){
      const under=sink.tone(baseTile,-.035);
      JiangnanElements.roofPlane(sink,profile,-1,under);JiangnanElements.roofPlane(sink,profile,1,under);
      const fasciaHeight=style.eaveThickness*(spec.eaveThicknessScale||1);
      [-1,1].forEach(function(side){const left=profile.point(side,-profile.halfWidth,1),right=profile.point(side,profile.halfWidth,1);sink.beam3(left,right,fasciaHeight*1.08,fasciaHeight,tileColor,-.018);});
    });
    if(spec.showRafters!==false)sink.scope('roof/rafters','wood',function(){
      const count=Math.max(3,Math.floor(profile.width/(tile*.95)));
      for(let i=0;i<=count;i++){
        const x=-profile.halfWidth+profile.width*i/count,variation=JiangnanRandom.signed(seed,'rafter-band-'+Math.floor(i/3))*style.woodVariation*.18;
        [-1,1].forEach(function(side){const eave=profile.point(side,x,1),inner=profile.point(side,x,.76);eave[1]-=style.eaveThickness*.62;inner[1]-=style.eaveThickness*.62;sink.beam3(inner,eave,style.rafterThickness,style.rafterThickness,'wood',variation);});
      }
    });
    let tileStats=null;
    sink.scope('roof/overlapping-half-cylinder-tiles','tile',function(){tileStats=buildSlopeTiles(sink,profile,mode,seed,style,tileColor);});
    sink.scope('roof/ridge-tiles','tile',function(){JiangnanElements.ridge(sink,profile,style,spec.ridgeScale||1,spec.ridgeColor||tileColor);});
    sink.metadata({id:spec.id+'/roof',type:'roof',detailLevel:mode,tileConstruction:'overlapping-half-cylinder',tileColumns:tileStats.columns,tileRows:tileStats.rows,tileRadius:tileStats.radius,visualEnvelope:{width:profile.width,depth:profile.depth,baseY:profile.baseY,ridgeY:profile.ridgeY}});
    return profile;
  }
  window.JiangnanRoof={build:build};
})();
