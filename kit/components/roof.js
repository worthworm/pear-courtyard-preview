'use strict';

(function(){
  function build(sink,spec,style){
    const profile=JiangnanProfiles.gableRoof({width:spec.width,depth:spec.depth,baseY:spec.baseY,roofHeight:spec.roofHeight,pitch:spec.pitch||style.roofBasePitch,eaveOverhang:spec.eaveOverhang});
    const mode=(spec.mode||'LITE').toUpperCase(),seed=spec.seed||1,tile=style.tileScale,tileColor=spec.tileColor||'tile';
    sink.scope('roof/base','tile',function(){
      JiangnanElements.roofPlane(sink,profile,-1,tileColor);JiangnanElements.roofPlane(sink,profile,1,tileColor);
      const fasciaHeight=style.eaveThickness*(spec.eaveThicknessScale||1);
      [-1,1].forEach(function(side){const left=profile.point(side,-profile.halfWidth,1),right=profile.point(side,profile.halfWidth,1);sink.beam3(left,right,fasciaHeight*1.08,fasciaHeight,tileColor,-.018);});
    });
    if(spec.showRafters!==false)sink.scope('roof/rafters','wood',function(){
      const count=Math.max(3,Math.floor(profile.width/(tile*.95)));
      for(let i=0;i<=count;i++){const x=-profile.halfWidth+profile.width*i/count,variation=JiangnanRandom.signed(seed,'rafter-band-'+Math.floor(i/3))*style.woodVariation*.18;[-1,1].forEach(function(side){const eave=profile.point(side,x,1),inner=profile.point(side,x,.76);eave[1]-=style.eaveThickness*.62;inner[1]-=style.eaveThickness*.62;sink.beam3(inner,eave,style.rafterThickness,style.rafterThickness,'wood',variation);});}
    });
    if(mode==='DETAIL'){
      sink.scope('roof/detail-tiles','tile',function(){
        const columns=Math.max(6,Math.floor(profile.width/tile)),rows=Math.max(4,Math.floor(profile.halfDepth/(tile*1.05))),radius=Math.min(tile*.48,profile.width/columns*.46);
        for(let column=0;column<=columns;column++){
          const x=-profile.halfWidth+profile.width*column/columns;
          for(let row=0;row<rows;row++){
            const t0=row/rows,t1=(row+1)/rows,band=Math.floor(column/4)+Math.floor(row/2),variation=JiangnanRandom.signed(seed,'tile-band-'+band)*style.tileVariation*.22;
            [-1,1].forEach(function(side){JiangnanElements.curvedTile(sink,profile,side,x,t0,t1,radius,5,sink.tone(sink.color('tile'),variation),row===rows-1);});
          }
        }
      });
    }else{
      sink.scope('roof/lite-eave-course','tile',function(){
        const columns=Math.max(5,Math.floor(profile.width/(tile*1.05))),radius=Math.min(tile*.46,profile.width/columns*.42);
        for(let column=0;column<=columns;column++){
          const x=-profile.halfWidth+profile.width*column/columns,variation=JiangnanRandom.signed(seed,'lite-eave-'+Math.floor(column/3))*style.tileVariation*.18;
          [-1,1].forEach(function(side){const base=typeof tileColor==='string'?sink.color(tileColor):tileColor;JiangnanElements.curvedTile(sink,profile,side,x,.80,1,radius,3,sink.tone(base,variation),false);});
        }
      });
    }
    sink.scope('roof/ridge','tile',function(){JiangnanElements.ridge(sink,profile,style,spec.ridgeScale||1,spec.ridgeColor||tileColor);});
    sink.metadata({id:spec.id+'/roof',type:'roof',detailLevel:mode,visualEnvelope:{width:profile.width,depth:profile.depth,baseY:profile.baseY,ridgeY:profile.ridgeY}});
    return profile;
  }
  window.JiangnanRoof={build:build};
})();
