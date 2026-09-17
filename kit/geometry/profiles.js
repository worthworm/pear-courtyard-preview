'use strict';

(function(){
  function gableRoof(options){
    const halfWidth=options.width/2+options.eaveOverhang,halfDepth=options.depth/2+options.eaveOverhang,rise=options.roofHeight||halfDepth*Math.tan(options.pitch),baseY=options.baseY||0;
    return{
      width:halfWidth*2,depth:halfDepth*2,halfWidth:halfWidth,halfDepth:halfDepth,
      baseY:baseY,ridgeY:baseY+rise,pitch:Math.atan2(rise,halfDepth),
      point:function(side,x,t){return[x,baseY+rise*(1-t),side*halfDepth*t];},
      normal:function(side){const length=Math.hypot(rise,halfDepth);return[0,halfDepth/length,side*rise/length];}
    };
  }
  window.JiangnanProfiles={gableRoof:gableRoof};
})();
