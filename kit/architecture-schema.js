'use strict';

(function(){
  function copy(value){return JSON.parse(JSON.stringify(value));}
  function normalize(value){
    const data=copy(value||{});data.version=1;data.style=data.style||{id:'jiangnan-v1',overrides:{}};data.style.id='jiangnan-v1';data.style.overrides=data.style.overrides||{};data.instances=Array.isArray(data.instances)?data.instances:[];return data;
  }
  function validate(data){
    if(!data||data.version!==1||!data.style||data.style.id!=='jiangnan-v1'||!Array.isArray(data.instances))throw Error('Invalid Jiangnan Architecture schema');
    data.instances.forEach(function(instance){if(!instance.id||!instance.type||!Number.isFinite(instance.seed))throw Error('Architecture instance is incomplete');});return true;
  }
  window.JiangnanArchitectureSchema={normalize:normalize,validate:validate};
})();
