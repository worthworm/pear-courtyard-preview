'use strict';

(function(){
  function build(sink,spec,style){
    const position=spec.position||[0,0,0],width=spec.openingWidth,height=spec.gateHeight,depth=spec.gateDepth||.45,post=spec.postThickness||style.columnRadius*2.2,beam=spec.beamThickness||style.beamThickness*1.18,variation=JiangnanRandom.signed(spec.seed||1,'gate-frame')*style.woodVariation*.16;
    const left=position[0]-width/2-post/2,right=position[0]+width/2+post/2;
    sink.scope('gate-frame/stone-bases','stone',function(){sink.box(left,.08,position[2],post+.08, .16,depth+.12,'stone');sink.box(right,.08,position[2],post+.08,.16,depth+.12,'stone');});
    sink.scope('gate-frame/columns','wood',function(){sink.box(left,height/2,position[2],post,height,depth,'wood',variation);sink.box(right,height/2,position[2],post,height,depth,'wood',variation);});
    sink.scope('gate-frame/beams','wood',function(){sink.box(position[0],height-beam/2,position[2],width+post*2,beam,depth,'wood',variation);sink.box(position[0],height-beam*1.55,position[2]-depth*.14,width+post*1.4,beam*.42,depth*.62,'wood',variation);});
    return{postThickness:post,beamThickness:beam,leftPost:left,rightPost:right};
  }
  window.JiangnanGateFrame={build:build};
})();
