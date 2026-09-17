'use strict';

(function(){
  function hash(value){
    const text=String(value),seed=2166136261;
    let result=seed;
    for(let i=0;i<text.length;i++){result^=text.charCodeAt(i);result=Math.imul(result,16777619);}
    return result>>>0;
  }
  function create(seed,salt){
    let state=(hash(String(seed)+'/'+String(salt))>>>0)||1;
    return function(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  }
  function signed(seed,salt){return create(seed,salt)()*2-1;}
  window.JiangnanRandom={hash:hash,create:create,signed:signed};
})();
