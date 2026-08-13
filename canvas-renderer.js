(() => {
'use strict';
const B=window.BenchData,R=window.BenchRuntime,C=window.CanvasBench,ctx=C.ctx;

if(!C.isC){
  const state=Array.from({length:B.ROWS},()=>Array.from({length:B.COLS},()=>({char:' ',macro:false}))),anims=new Map();
  let raf=0,lastDraw=0,colonDimUntil=0;const interval=1000/(R.config.targetFps||30);
  function animateCell(x,y,a,p){if(p<.5){C.drawHalf(x,y,a.from,false);const s=Math.max(.001,1-p*2);ctx.save();ctx.translate(x,y+45);ctx.scale(1,s);ctx.translate(-x,-y-45);C.drawHalf(x,y,a.from,true);ctx.restore();}else{C.drawHalf(x,y,a.to,true);const s=Math.max(.001,(p-.5)*2);ctx.save();ctx.beginPath();ctx.rect(x,y+45,72,45);ctx.clip();ctx.translate(x,y+45);ctx.scale(1,s);ctx.translate(-x,-y-45);C.drawHalf(x,y,a.to,false);ctx.restore();}ctx.fillStyle='#080808';ctx.fillRect(x,y+44,72,2);}
  function draw(t){ctx.fillStyle='#373A36';ctx.fillRect(0,0,B.W,B.H);ctx.fillStyle='#1C1B1C';ctx.fillRect(30,66,3780,672);for(let r=0;r<B.ROWS;r++)for(let c=0;c<B.COLS;c++){const key=r*B.COLS+c,x=B.cellX(c),y=B.cellY(r),a=anims.get(key);if(a&&t>=a.start){const p=Math.min(1,(t-a.start)/a.duration);animateCell(x,y,a,p);if(p>=1){state[r][c]={...a.to};anims.delete(key);}}else C.drawStatic(x,y,state[r][c]);}C.drawDividers();C.drawColons(t<colonDimUntil);}
  function frame(t){raf=0;if(t-lastDraw>=interval-1){draw(t);lastDraw=t;}if(anims.size||t<colonDimUntil)raf=requestAnimationFrame(frame);}
  function wake(){if(!raf)raf=requestAnimationFrame(frame);}
  function setCell(r,c,next,opt={}){const key=r*B.COLS+c,cur=state[r][c];if(cur.char===next.char&&cur.macro===next.macro&&!anims.has(key))return;anims.set(key,{from:{...cur},to:{...next},start:performance.now()+(opt.delay||0),duration:opt.duration||300});wake();}
  function pulse(){colonDimUntil=performance.now()+150;wake();}
  R.register({init(){draw(performance.now());},setCell,pulseColons:pulse,activeCount:()=>anims.size,canvas:C.canvas});
  return;
}

const baseCtx=C.baseCtx;
const state=Array.from({length:B.ROWS},()=>Array.from({length:B.COLS},()=>({char:' ',macro:false})));
const anims=new Map();
const interval=1000/(R.config.targetFps||30);
let raf=0,wakeTimer=0,watchdog=0,lastDraw=0,lastFrame=performance.now(),colonTimer=0;
const health={draws:0,animatedCellDraws:0,watchdogRecoveries:0,visibilityResumes:0,maxQueued:0,lastFrameAt:lastFrame};

function pixelRect(r,c){
  const x=B.cellX(c),y=B.cellY(r);
  const px=Math.max(0,Math.floor(x*C.sx));
  const py=Math.max(0,Math.floor(y*C.sy));
  const pw=Math.min(C.canvas.width-px,Math.ceil(72*C.sx)+1);
  const ph=Math.min(C.canvas.height-py,Math.ceil(90*C.sy)+1);
  return [px,py,pw,ph];
}

function restoreCell(r,c){
  const [x,y,w,h]=pixelRect(r,c);
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(C.base,x,y,w,h,x,y,w,h);
  ctx.restore();
}

function commitCell(r,c,value){
  state[r][c]={...value};
  C.drawStatic(baseCtx,B.cellX(c),B.cellY(r),state[r][c]);
  restoreCell(r,c);
}

function animateCell(r,c,a,p){
  const x=B.cellX(c),y=B.cellY(r);
  restoreCell(r,c);
  if(p<.5){
    C.drawHalf(ctx,x,y,a.from,false);
    const scale=Math.max(.001,1-p*2);
    ctx.save();
    ctx.translate(x,y+45);
    ctx.scale(1,scale);
    ctx.translate(-x,-y-45);
    C.drawHalf(ctx,x,y,a.from,true);
    ctx.restore();
  }else{
    C.drawHalf(ctx,x,y,a.to,true);
    const scale=Math.max(.001,(p-.5)*2);
    ctx.save();
    ctx.beginPath();ctx.rect(x,y+45,72,45);ctx.clip();
    ctx.translate(x,y+45);
    ctx.scale(1,scale);
    ctx.translate(-x,-y-45);
    C.drawHalf(ctx,x,y,a.to,false);
    ctx.restore();
  }
  ctx.fillStyle='#080808';
  ctx.fillRect(x,y+44,72,2);
  health.animatedCellDraws++;
}

function redrawOverlays(dim=false){
  C.drawDividers();
  C.drawColons(dim);
}

function drawInitial(){
  baseCtx.fillStyle='#373A36';baseCtx.fillRect(0,0,B.W,B.H);
  baseCtx.fillStyle='#1C1B1C';baseCtx.fillRect(30,66,3780,672);
  for(let r=0;r<B.ROWS;r++)for(let c=0;c<B.COLS;c++)C.drawStatic(baseCtx,B.cellX(c),B.cellY(r),state[r][c]);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(C.base,0,0);ctx.restore();
  redrawOverlays(false);
}

function drawActive(t){
  let touched=false;
  for(const [key,a] of [...anims]){
    if(t<a.start)continue;
    const r=Math.floor(key/B.COLS),c=key%B.COLS;
    const p=Math.min(1,(t-a.start)/Math.max(1,a.duration));
    if(p>=1){commitCell(r,c,a.to);anims.delete(key);}
    else animateCell(r,c,a,p);
    touched=true;
  }
  if(touched){redrawOverlays(false);health.draws++;}
  health.maxQueued=Math.max(health.maxQueued,anims.size);
  if(!anims.size)stopWatchdog();
}

function nextStatus(now){
  let due=false,nextStart=Infinity;
  for(const a of anims.values()){
    if(now>=a.start)due=true;
    else if(a.start<nextStart)nextStart=a.start;
  }
  return {due,nextStart};
}

function clearWake(){
  if(raf){cancelAnimationFrame(raf);raf=0;}
  if(wakeTimer){clearTimeout(wakeTimer);wakeTimer=0;}
}

function schedule(){
  if(document.hidden||raf||wakeTimer||!anims.size)return;
  const now=performance.now();
  const {due,nextStart}=nextStatus(now);
  if(due){
    const wait=Math.max(0,interval-(now-lastDraw));
    wakeTimer=setTimeout(()=>{wakeTimer=0;raf=requestAnimationFrame(frame);},Math.max(0,wait-2));
  }else if(Number.isFinite(nextStart)){
    wakeTimer=setTimeout(()=>{wakeTimer=0;raf=requestAnimationFrame(frame);},Math.max(0,nextStart-now-2));
  }
}

function frame(t){
  raf=0;
  lastFrame=t;health.lastFrameAt=t;
  if(t-lastDraw>=interval-2){drawActive(t);lastDraw=t;}
  schedule();
}

function ensureWatchdog(){
  if(watchdog)return;
  watchdog=setInterval(()=>{
    if(document.hidden||!anims.size)return;
    const now=performance.now();
    const {due}=nextStatus(now);
    if(due&&now-lastFrame>250){
      health.watchdogRecoveries++;
      clearWake();
      drawActive(now);
      lastDraw=now;lastFrame=now;health.lastFrameAt=now;
      schedule();
    }
  },250);
}

function stopWatchdog(){
  if(watchdog){clearInterval(watchdog);watchdog=0;}
}

function setCell(r,c,next,opt={}){
  const key=r*B.COLS+c;
  const existing=anims.get(key);
  if(existing&&existing.to.char===next.char&&existing.to.macro===next.macro)return;
  if(!existing&&state[r][c].char===next.char&&state[r][c].macro===next.macro)return;
  const now=performance.now();
  let from={...state[r][c]};
  if(existing&&now>=existing.start){
    const p=Math.min(1,(now-existing.start)/Math.max(1,existing.duration));
    from={...(p>=.5?existing.to:existing.from)};
  }
  anims.set(key,{from,to:{char:next.char,macro:Boolean(next.macro)},start:now+(opt.delay||0),duration:opt.duration||300});
  health.maxQueued=Math.max(health.maxQueued,anims.size);
  ensureWatchdog();
  schedule();
}

function pulse(){
  if(colonTimer)clearTimeout(colonTimer);
  redrawOverlays(true);
  colonTimer=setTimeout(()=>{colonTimer=0;redrawOverlays(false);},150);
}

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){clearWake();return;}
  health.visibilityResumes++;
  lastFrame=performance.now();
  schedule();
});

window.__canvasCHealth=health;
R.register({
  init(){drawInitial();lastDraw=performance.now();lastFrame=lastDraw;},
  setCell,
  pulseColons:pulse,
  activeCount:()=>anims.size,
  canvas:C.canvas,
  health:()=>({...health,textGeometry:C.textGeometry,spriteCount:C.spriteCache?.size||0})
});
})();