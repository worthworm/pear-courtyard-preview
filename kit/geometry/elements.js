'use strict';

(function(){
  function roofPlane(sink,profile,side,color){
    const a=profile.point(side,-profile.halfWidth,0),b=profile.point(side,profile.halfWidth,0),c=profile.point(side,profile.halfWidth,1),d=profile.point(side,-profile.halfWidth,1);
    sink.tri(a,b,c,color);sink.tri(a,c,d,color);
  }
  function curvedTile(sink,profile,side,x,t0,t1,radius,segments,color,cap,normalOffset){
    const normal=profile.normal(side),liftBase=Number(normalOffset)||0,rings=[];
    [profile.point(side,x,t0),profile.point(side,x,t1)].forEach(function(source){
      const center=[source[0],source[1]+normal[1]*liftBase,source[2]+normal[2]*liftBase],ring=[];
      for(let i=0;i<=segments;i++){
        const angle=i*Math.PI/segments,offset=Math.cos(angle)*radius,lift=Math.sin(angle)*radius*.88;
        ring.push([center[0]+offset,center[1]+normal[1]*lift,center[2]+normal[2]*lift]);
      }
      rings.push({center:center,points:ring});
    });
    for(let i=0;i<segments;i++){
      sink.tri(rings[0].points[i],rings[1].points[i],rings[1].points[i+1],color);
      sink.tri(rings[0].points[i],rings[1].points[i+1],rings[0].points[i+1],color);
    }
    if(cap)for(let i=0;i<segments;i++)sink.tri(rings[1].center,rings[1].points[i],rings[1].points[i+1],color);
  }
  function ridgeTile(sink,x0,x1,baseY,radius,segments,color,capStart,capEnd){
    const rings=[];
    [x0,x1].forEach(function(x){
      const center=[x,baseY,0],ring=[];
      for(let i=0;i<=segments;i++){
        const angle=i*Math.PI/segments;
        ring.push([x,baseY+Math.sin(angle)*radius,Math.cos(angle)*radius]);
      }
      rings.push({center:center,points:ring});
    });
    for(let i=0;i<segments;i++){
      sink.tri(rings[0].points[i],rings[1].points[i],rings[1].points[i+1],color);
      sink.tri(rings[0].points[i],rings[1].points[i+1],rings[0].points[i+1],color);
    }
    if(capStart)for(let i=0;i<segments;i++)sink.tri(rings[0].center,rings[0].points[i+1],rings[0].points[i],color);
    if(capEnd)for(let i=0;i<segments;i++)sink.tri(rings[1].center,rings[1].points[i],rings[1].points[i+1],color);
  }
  function ridge(sink,profile,style,scale,color){
    const factor=scale||1,radius=Math.max(style.tileScale*.66,style.ridgeThickness*.78)*factor,
      targetLength=Math.max(style.tileScale*1.35*factor,radius*1.6),count=Math.max(3,Math.ceil(profile.width/targetLength)),
      step=profile.width/count,overlap=Math.min(step*.04,style.tileScale*.035),baseY=profile.ridgeY-radius*.18,
      base=typeof color==='string'?sink.color(color):color||sink.color('tile');
    for(let i=0;i<count;i++){
      const x0=-profile.width/2+i*step-(i?overlap:0),x1=-profile.width/2+(i+1)*step+(i<count-1?overlap:0),
        variation=Math.sin((i+1)*1.73)*style.tileVariation*.13,tone=sink.tone(base,variation);
      ridgeTile(sink,x0,x1,baseY,radius,7,tone,i===0,i===count-1);
    }
  }
  window.JiangnanElements={roofPlane:roofPlane,curvedTile:curvedTile,ridgeTile:ridgeTile,ridge:ridge};
})();
