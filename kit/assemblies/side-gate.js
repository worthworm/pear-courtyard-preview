'use strict';

(function(){
  function build(sink,spec,style){
    const value=Object.assign({type:'sideGate',openingWidth:1.48,gateHeight:1.86,gateDepth:.38,roofScale:.80,eaveOverhang:.12,doorLeafCount:2,doorOpenAngle:Math.PI*.18,roofComplexity:'LITE'},spec||{});value.id=value.id||'sideGate';
    const result=JiangnanCourtyardGate.build(sink,value,style);
    return result;
  }
  window.JiangnanSideGate={build:build};
})();
