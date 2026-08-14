(() => {
'use strict';
const C=window.CanvasBench,B=window.BenchData;
const ctx=C.ctx;

// The first overlay draw happens inside renderer.init(), immediately before
// the staggered wall launch begins. Use that moment as the colon launch epoch
// so no green dots are visible on the initial frame.
let launchEpoch=null;
const REVEAL_MS=260;
const clamp01=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp01(v);return 1-Math.pow(1-v,3);};

function elapsed(){
  const now=performance.now();
  if(launchEpoch===null)launchEpoch=now;
  return now-launchEpoch;
}

function cellReveal(row,col,age){
  // Match the launch delay used by transitionGrid(): row*1120 + col*20.
  return ease((age-(row*1120+col*20))/REVEAL_MS);
}

function drawScaledCircle(x,y,r,progress){
  if(progress<=0)return;
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(1,Math.max(0.02,progress));
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawScaledHalf(x,y,r,start,end,progress){
  if(progress<=0)return;
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(1,Math.max(0.02,progress));
  ctx.beginPath();ctx.arc(0,0,r,start,end);ctx.fill();
  ctx.restore();
}

C.drawColons=dim=>{
  const age=elapsed();
  ctx.save();
  ctx.globalAlpha=dim?.12:1;
  ctx.fillStyle='#89C925';

  // Melbourne macro colons. Each dot enters with the corresponding macro row
  // and uses the later of the two gap cells so it never appears ahead of them.
  B.COLON_GAPS.forEach(g=>B.COLON_ROWS.forEach(row=>{
    const globalLeft=B.CENTRE_START+g[0];
    const globalRight=B.CENTRE_START+g[1];
    const p=cellReveal(row,Math.max(globalLeft,globalRight),age);
    const y=B.cellY(row)+45;
    drawScaledHalf(B.cellX(globalLeft)+72,y,10,Math.PI/2,Math.PI*1.5,p);
    drawScaledHalf(B.cellX(globalRight),y,10,-Math.PI/2,Math.PI/2,p);
  }));

  // Side HH:MM:SS mini-colons. They enter only when their own clock row and
  // separator flap position reach the launch front.
  const leftCols=[2,5];
  const rightStart=B.COLS-B.SIDE_COLS;
  const rightCols=[rightStart+2,rightStart+5];
  for(const row of [2,6]){
    for(const col of [...leftCols,...rightCols]){
      const p=cellReveal(row,col,age);
      const x=B.cellX(col)+36,y=B.cellY(row);
      drawScaledCircle(x,y+28,4,p);
      drawScaledCircle(x,y+60,4,p);
    }
  }
  ctx.restore();
};

// Tiny QC hook. No animation loop or rendering cost.
C.colonLaunchState=()=>{
  const age=launchEpoch===null?0:performance.now()-launchEpoch;
  return {
    age,
    melbourneFirst:cellReveal(2,B.CENTRE_START+B.COLON_GAPS[0][1],age),
    melbourneLast:cellReveal(4,B.CENTRE_START+B.COLON_GAPS[1][1],age),
    sideTopLeft:cellReveal(2,2,age),
    sideTopRight:cellReveal(2,B.COLS-B.SIDE_COLS+5,age),
    sideBottomLeft:cellReveal(6,2,age),
    sideBottomRight:cellReveal(6,B.COLS-B.SIDE_COLS+5,age)
  };
};
})();
