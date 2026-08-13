(() => {
'use strict';
const cfg=window.RENDERER_CONFIG;
const root=document.getElementById('renderer-root');
const isC=cfg.internal[0]===2560&&cfg.internal[1]===536;
const makeCanvas=(className,append=true)=>{
  const c=document.createElement('canvas');
  c.className=className;
  c.width=cfg.internal[0];
  c.height=cfg.internal[1];
  if(append)root.appendChild(c);
  return c;
};
const canvas=makeCanvas('wall-canvas');
const sx=canvas.width/3840;
const sy=canvas.height/804;
const prep=(c,alpha=false)=>{
  const ctx=c.getContext('2d',{alpha,desynchronized:true});
  ctx.setTransform(sx,0,0,sy,0,0);
  ctx.imageSmoothingEnabled=true;
  return ctx;
};
const ctx=prep(canvas,false);
if(isC){
  const overlay=makeCanvas('wall-canvas wall-overlay');
  overlay.style.pointerEvents='none';
  const base=makeCanvas('',false);
  const baseCtx=prep(base,false);
  const overlayCtx=prep(overlay,true);
  window.CanvasBench={canvas,ctx,base,baseCtx,overlay,overlayCtx,sx,sy,isC:true};
}else{
  window.CanvasBench={canvas,ctx,sx,sy,isC:false};
}
})();