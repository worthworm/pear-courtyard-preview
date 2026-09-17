'use strict';

(function(){
  function build(sink,spec,style){
    if(!spec.id||spec.id.indexOf('courtyardWall/')!==0)throw Error('courtyardWall requires a stable semantic id');
    const result=JiangnanWallSegment.build(sink,spec,style);
    sink.metadata({id:spec.id,type:'courtyardWall',visualBounds:{start:spec.start,end:spec.end,height:result.height,thickness:result.visualThickness},gameplayFootprint:null});
    return result;
  }
  window.JiangnanCourtyardWall={build:build};
})();
