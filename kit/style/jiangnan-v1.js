'use strict';

(function(){
  const profile={
    id:'jiangnan-v1',version:1,seed:27184,
    wallColor:'#d6d8d3',wallColorCandidates:{A:'#d6d8d3',B:'#c9c2b2'},wallWeathering:.32,
    woodColor:'#403027',woodVariation:.10,
    tileColor:'#465354',tileVariation:.08,tileScale:.26,
    columnRadius:.09,beamThickness:.14,eaveThickness:.12,rafterThickness:.045,
    roofBasePitch:.43,ridgeThickness:.16,wallCapHeight:.14,
    baseStoneColor:'#7f817a',latticeDensity:{gridX:5,gridY:8},
    dampColor:'#858d88',mossColor:'#66715d',interiorColor:'#252a28'
  };
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function resolve(overrides){
    const value=copy(profile),source=overrides||{};
    Object.keys(source).forEach(function(key){
      if(key==='latticeDensity')value.latticeDensity=Object.assign({},value.latticeDensity,source[key]);
      else if(key!=='id'&&key!=='version')value[key]=source[key];
    });
    return value;
  }
  window.JiangnanStyle={profile:profile,resolve:resolve};
})();
