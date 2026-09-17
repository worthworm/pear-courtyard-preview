'use strict';

(function(){
  const preview=window.JiangnanPreview,panel=document.querySelector('#authoring-panel');
  if(!preview||!panel)return;
  const row=document.createElement('div');row.className='authoring-export';
  const copyButton=document.createElement('button');copyButton.type='button';copyButton.textContent='复制当前修改';
  const status=document.createElement('span');status.className='authoring-export-status';status.textContent='拖完后点这里，直接粘贴到聊天';
  const fallback=document.createElement('textarea');fallback.className='authoring-export-text';fallback.readOnly=true;fallback.hidden=true;fallback.setAttribute('aria-label','当前修改数据');
  row.appendChild(copyButton);row.appendChild(status);panel.appendChild(row);panel.appendChild(fallback);

  const style=document.createElement('style');
  style.textContent='.authoring-export{display:grid;gap:6px;margin-top:10px}.authoring-export button{width:100%;padding:8px 9px;font-size:12px;background:#e8e4d2;color:#26302c}.authoring-export-status{font-size:10px;line-height:1.35;opacity:.72}.authoring-export-text{width:100%;min-height:100px;margin-top:7px;resize:vertical;border:1px solid #f3efe055;background:#f4f1e9;color:#26302c;padding:7px;font:10px/1.4 Consolas,monospace}';
  document.head.appendChild(style);

  function bundle(){return{offsets:preview.getAuthoringOffsets?preview.getAuthoringOffsets():{},scales:window.JiangnanScaleGizmo&&window.JiangnanScaleGizmo.getScales?window.JiangnanScaleGizmo.getScales():{}};}
  function message(){return'应用这些更改：\n'+JSON.stringify(bundle(),null,2);}
  function copied(){copyButton.textContent='已复制 ✓';status.textContent='现在回到聊天直接粘贴即可，不需要保存或上传文件。';fallback.hidden=true;setTimeout(function(){copyButton.textContent='复制当前修改';},1800);}
  function fallbackCopy(text){fallback.value=text;fallback.hidden=false;fallback.focus();fallback.select();try{if(document.execCommand&&document.execCommand('copy')){copied();return true;}}catch(error){}status.textContent='自动复制被浏览器拦截。下方内容已选中，按 Ctrl+C 后直接粘贴到聊天。';return false;}
  copyButton.addEventListener('click',function(){const text=message();if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(copied).catch(function(){fallbackCopy(text);});}else fallbackCopy(text);});

  window.JiangnanAuthoringExport={getBundle:bundle,getMessage:message};
})();
