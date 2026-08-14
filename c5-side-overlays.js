(() => {
'use strict';
const C=window.CanvasBench,B=window.BenchData;
const ctx=C.ctx;
C.drawColons=dim=>{
  ctx.save();
  ctx.globalAlpha=dim?.12:1;
  ctx.fillStyle='#89C925';

  B.COLON_GAPS.forEach(g=>B.COLON_ROWS.forEach(row=>{
    const y=B.cellY(row)+45;
    ctx.beginPath();ctx.arc(B.cellX(B.CENTRE_START+g[0])+72,y,10,Math.PI/2,Math.PI*1.5);ctx.fill();
    ctx.beginPath();ctx.arc(B.cellX(B.CENTRE_START+g[1]),y,10,-Math.PI/2,Math.PI/2);ctx.fill();
  }));

  const leftCols=[2,5];
  const rightStart=B.COLS-B.SIDE_COLS;
  const rightCols=[rightStart+2,rightStart+5];
  for(const row of [2,6]){
    for(const col of [...leftCols,...rightCols]){
      const x=B.cellX(col)+36,y=B.cellY(row);
      ctx.beginPath();ctx.arc(x,y+28,4,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(x,y+60,4,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
};
})();
