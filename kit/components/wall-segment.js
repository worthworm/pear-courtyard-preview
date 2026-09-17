'use strict';

(function(){
  function build(sink,spec,style){
    const dx=spec.end[0]-spec.start[0],dz=spec.end[1]-spec.start[1],length=Math.hypot(dx,dz),yaw=Math.atan2(dz,dx),height=spec.wallHeight,thickness=spec.thickness,base=.16,seed=spec.seed||1;
    sink.withTransform({position:[spec.start[0],spec.baseY||0,spec.start[1]],yaw:yaw},function(){
      sink.scope('wall/base','stone',function(){sink.box(length/2,base/2,0,length+.12,base,thickness+.12,'stone');});
      sink.scope('wall/body','wall',function(){
        const bodyHeight=height-base,wall=sink.color('wall'),damp=sink.tone(wall,-.035),shadow=sink.tone(wall,-.018),front=thickness/2+.001,back=-thickness/2-.001;
        sink.box(length/2,base+bodyHeight/2,0,length,bodyHeight,thickness,'wall');
        function band(z,reverse,y0,y1,bottom,top){const a=[0,y0,z],b=[length,y0,z],c=[length,y1,z],d=[0,y1,z],colors=[bottom,bottom,top];if(reverse){sink.tri(a,c,b,'wall',[bottom,top,bottom]);sink.tri(a,d,c,'wall',[bottom,top,top]);}else{sink.tri(a,b,c,'wall',colors);sink.tri(a,c,d,'wall',[bottom,top,top]);}}
        const dampTop=base+bodyHeight*.14;band(front,false,base,dampTop,damp,wall);band(back,true,base,dampTop,damp,wall);
        const shadowBottom=height-bodyHeight*.045;band(front,false,shadowBottom,height,wall,shadow);band(back,true,shadowBottom,height,wall,shadow);
      });
      sink.scope('wall/press-cap','wall',function(){const press=sink.tone(sink.color('wall'),.025);sink.box(length/2,height+.085,0,length+.18,.20,thickness+.42,press);});
      if(spec.capType!=='plain')sink.withTransform({position:[length/2,0,0]},function(){JiangnanRoof.build(sink,{id:spec.id+'/cap',width:length,depth:thickness+.05,baseY:height+.18,roofHeight:style.wallCapHeight*.72,eaveOverhang:.11,mode:'LITE',seed:seed+31,showRafters:false,eaveThicknessScale:.50,ridgeScale:.78,tileColor:sink.tone(sink.color('tile'),.16),ridgeColor:sink.tone(sink.color('tile'),.28)},style);});
      sink.scope('wall/end-caps','stone',function(){
        if(spec.cornerType==='end-cap'||spec.cornerType==='both'){sink.box(.035,height*.52,0,.07,height+.16,thickness+.16,'stone');sink.box(length-.035,height*.52,0,.07,height+.16,thickness+.16,'stone');}
      });
    });
    const tangent=[dx/length,0,dz/length],normal=[-tangent[2],0,tangent[0]],prefix=spec.id;
    sink.anchor({id:prefix+'/corner-start',position:[spec.start[0],spec.baseY||0,spec.start[1]],normal:normal,tags:['corner','leanable-prop']});
    sink.anchor({id:prefix+'/corner-end',position:[spec.end[0],spec.baseY||0,spec.end[1]],normal:normal,tags:['corner','leanable-prop']});
    sink.anchor({id:prefix+'/wall-prop-mid',position:[(spec.start[0]+spec.end[0])/2,spec.baseY||0,(spec.start[1]+spec.end[1])/2],normal:normal,tags:['wall-prop','jar','wood-stack']});
    return{length:length,height:height,visualThickness:thickness+.24};
  }
  window.JiangnanWallSegment={build:build};
})();
