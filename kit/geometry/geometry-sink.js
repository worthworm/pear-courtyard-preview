'use strict';

(function(){
  function rgb(hex){return[parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255];}
  function clamp(value){return Math.max(0,Math.min(1,value));}
  function tone(color,amount){return color.map(function(value){return clamp(value+amount);});}
  function sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
  function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
  function normal(a,b,c){const value=cross(sub(b,a),sub(c,a)),length=Math.hypot(value[0],value[1],value[2])||1;return[value[0]/length,value[1]/length,value[2]/length];}
  function create(options){
    options=options||{};
    const vertices=[],style=options.style,metrics={triangles:0,vertices:0,drawCalls:1,gpuMaterials:1,paletteRoles:{},components:{},anchors:[],metadata:[]};
    const transforms=[];let component='unassigned',role='wall',silhouette=!!options.silhouette;
    const colors={wall:rgb(style.wallColor),wallDamp:rgb(style.dampColor),wallShade:tone(rgb(style.wallColor),-.075),wood:rgb(style.woodColor),tile:rgb(style.tileColor),stone:rgb(style.baseStoneColor),moss:rgb(style.mossColor),interior:rgb(style.interiorColor)};
    function transformPoint(point){let result=point.slice();transforms.slice().reverse().forEach(function(t){const pivot=t.pivot||[0,0,0],yaw=t.yaw||0,cs=Math.cos(yaw),sn=Math.sin(yaw),x=result[0]-pivot[0],z=result[2]-pivot[2];result=[pivot[0]+x*cs-z*sn+(t.position?t.position[0]:0),result[1]+(t.position?t.position[1]:0),pivot[2]+x*sn+z*cs+(t.position?t.position[2]:0)];});return result;}
    function resolveColor(value){return typeof value==='string'?(colors[value]||rgb(value)):value;}
    function tri(a,b,c,color,vertexColors){const points=[transformPoint(a),transformPoint(b),transformPoint(c)],n=normal(points[0],points[1],points[2]),light=.68+.32*Math.max(0,n[1]*.82+n[0]*-.36+n[2]*.28),base=resolveColor(color||role);points.forEach(function(point,index){const chosen=silhouette?[.075,.085,.08]:resolveColor(vertexColors?vertexColors[index]:base).map(function(v){return clamp(v*light);});vertices.push(point[0],point[1],point[2],chosen[0],chosen[1],chosen[2]);});metrics.triangles++;metrics.vertices+=3;metrics.paletteRoles[role]=true;metrics.components[component]=(metrics.components[component]||0)+1;}
    function box(x,y,z,w,h,d,color,variation){const c=variation?resolveColor(color||role).map(function(v){return clamp(v+variation);}):color||role,p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(function(v){return[x+v[0]*w/2,y+v[1]*h/2,z+v[2]*d/2];});[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].forEach(function(f){tri(p[f[0]],p[f[1]],p[f[2]],c);tri(p[f[0]],p[f[2]],p[f[3]],c);});}
    function gradientBox(x,y,z,w,h,d,bottom,top){const p=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(function(v){return[x+v[0]*w/2,y+v[1]*h/2,z+v[2]*d/2];}),bc=resolveColor(bottom),tc=resolveColor(top),vc=function(index){return p[index][1]<y?bc:tc;};[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].forEach(function(f){tri(p[f[0]],p[f[1]],p[f[2]],top,[vc(f[0]),vc(f[1]),vc(f[2])]);tri(p[f[0]],p[f[2]],p[f[3]],top,[vc(f[0]),vc(f[2]),vc(f[3])]);});}
    function beam3(a,b,width,height,color,variation){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],length=Math.hypot(dx,dy,dz)||1,axis=[dx/length,dy/length,dz/length],lateral=Math.abs(axis[1])>.95?[1,0,0]:[axis[2],0,-axis[0]],ll=Math.hypot(lateral[0],lateral[2])||1,u=[lateral[0]/ll,lateral[1],lateral[2]/ll],v=cross(axis,u),center=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],points=[];[-1,1].forEach(function(sa){[-1,1].forEach(function(su){[-1,1].forEach(function(sv){points.push([center[0]+axis[0]*length*.5*sa+u[0]*width*.5*su+v[0]*height*.5*sv,center[1]+axis[1]*length*.5*sa+u[1]*width*.5*su+v[1]*height*.5*sv,center[2]+axis[2]*length*.5*sa+u[2]*width*.5*su+v[2]*height*.5*sv]);});});});const c=variation?resolveColor(color||role).map(function(value){return clamp(value+variation);}):color||role;[[0,2,3,1],[4,5,7,6],[0,1,5,4],[2,6,7,3],[0,4,6,2],[1,3,7,5]].forEach(function(f){tri(points[f[0]],points[f[1]],points[f[2]],c);tri(points[f[0]],points[f[2]],points[f[3]],c);});}
    function withTransform(value,action){transforms.push(value||{});try{return action();}finally{transforms.pop();}}
    function scope(name,paletteRole,action){const beforeComponent=component,beforeRole=role;component=name;role=paletteRole||role;try{return action();}finally{component=beforeComponent;role=beforeRole;}}
    function anchor(value){metrics.anchors.push(JSON.parse(JSON.stringify(value)));}
    function metadata(value){metrics.metadata.push(JSON.parse(JSON.stringify(value)));}
    function finish(){return{vertices:new Float32Array(vertices),metrics:{triangles:metrics.triangles,vertices:metrics.vertices,drawCalls:metrics.drawCalls,gpuMaterials:metrics.gpuMaterials,paletteRoles:Object.keys(metrics.paletteRoles).sort(),materialRoleCount:Object.keys(metrics.paletteRoles).length,components:metrics.components,anchors:metrics.anchors,metadata:metrics.metadata}};}
    return{tri:tri,box:box,gradientBox:gradientBox,beam3:beam3,withTransform:withTransform,scope:scope,anchor:anchor,metadata:metadata,finish:finish,color:function(name){return colors[name];},tone:tone};
  }
  window.JiangnanGeometrySink={create:create,rgb:rgb,tone:tone};
})();
