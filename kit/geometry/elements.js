'use strict';

(function(){
  function roofPlane(sink,profile,side,color){
    const a=profile.point(side,-profile.halfWidth,0),b=profile.point(side,profile.halfWidth,0),c=profile.point(side,profile.halfWidth,1),d=profile.point(side,-profile.halfWidth,1);
    sink.tri(a,b,c,color);sink.tri(a,c,d,color);
  }
  function curvedTile(sink,profile,side,x,t0,t1,radius,segments,color,cap){
    const p0=profile.point(side,x,t0),p1=profile.point(side,x,t1),normal=profile.normal(side),rings=[];
    [p0,p1].forEach(function(center){const ring=[];for(let i=0;i<=segments;i++){const angle=i*Math.PI/segments,offset=Math.cos(angle)*radius,lift=Math.sin(angle)*radius*.82;ring.push([center[0]+offset,center[1]+normal[1]*lift,center[2]+normal[2]*lift]);}rings.push(ring);});
    for(let i=0;i<segments;i++){sink.tri(rings[0][i],rings[1][i],rings[1][i+1],color);sink.tri(rings[0][i],rings[1][i+1],rings[0][i+1],color);}
    if(cap)for(let i=0;i<segments;i++)sink.tri(p1,rings[1][i],rings[1][i+1],color);
  }
  function ridge(sink,profile,style,scale,color){const factor=scale||1,height=style.ridgeThickness*1.28*factor,top=profile.ridgeY+style.ridgeThickness*.62*factor;sink.box(0,top-height/2,0,profile.width+style.tileScale*.35,height,style.ridgeThickness*factor,color||'tile');}
  window.JiangnanElements={roofPlane:roofPlane,curvedTile:curvedTile,ridge:ridge};
})();
