(() => {
const C=window.CanvasBench,B=window.BenchData,ctx=C.ctx;
C.drawDividers=()=>{ctx.fillStyle='#080808';[B.CENTRE_START,B.CENTRE_START+B.CENTRE_COLS].forEach(c=>ctx.fillRect(B.cellX(c)-2,66,4,672));};
C.drawColons=dim=>{ctx.save();ctx.globalAlpha=dim?.12:1;ctx.fillStyle='#89C925';B.COLON_GAPS.forEach(g=>B.COLON_ROWS.forEach(row=>{const y=B.cellY(row)+45;ctx.beginPath();ctx.arc(B.cellX(B.CENTRE_START+g[0])+72,y,10,Math.PI/2,Math.PI*1.5);ctx.fill();ctx.beginPath();ctx.arc(B.cellX(B.CENTRE_START+g[1]),y,10,-Math.PI/2,Math.PI/2);ctx.fill();}));[[2,3],[6,3],[2,45],[6,45]].forEach(p=>{const x=B.cellX(p[1])+36,y=B.cellY(p[0]);ctx.beginPath();ctx.arc(x,y+28,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x,y+60,4,0,Math.PI*2);ctx.fill();});ctx.restore();};
})();