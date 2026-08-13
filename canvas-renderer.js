(() => {
const B=window.BenchData,R=window.BenchRuntime,C=window.CanvasBench,ctx=C.ctx;
const state=Array.from({length:B.ROWS},()=>Array.from({length:B.COLS},()=>({char:' ',macro:false}))),anims=new Map();
let raf=0,lastDraw=0,colonDimUntil=0;const interval=1000/(R.config.targetFps||30);
function animateCell(x,y,a,p){if(p<.5){C.drawHalf(x,y,a.from,false);const s=Math.max(.001,1-p*2);ctx.save();ctx.translate(x,y+45);ctx.scale(1,s);ctx.translate(-x,-y-45);C.drawHalf(x,y,a.from,true);ctx.restore();}else{C.drawHalf(x,y,a.to,true);const s=Math.max(.001,(p-.5)*2);ctx.save();ctx.beginPath();ctx.rect(x,y+45,72,45);ctx.clip();ctx.translate(x,y+45);ctx.scale(1,s);ctx.translate(-x,-y-45);C.drawHalf(x,y,a.to,false);ctx.restore();}ctx.fillStyle='#080808';ctx.fillRect(x,y+44,72,2);}
function draw(t){ctx.fillStyle='#373A36';ctx.fillRect(0,0,B.W,B.H);ctx.fillStyle='#1C1B1C';ctx.fillRect(30,66,3780,672);for(let r=0;r<B.ROWS;r++)for(let c=0;c<B.COLS;c++){const key=r*B.COLS+c,x=B.cellX(c),y=B.cellY(r),a=anims.get(key);if(a&&t>=a.start){const p=Math.min(1,(t-a.start)/a.duration);animateCell(x,y,a,p);if(p>=1){state[r][c]={...a.to};anims.delete(key);}}else C.drawStatic(x,y,state[r][c]);}C.drawDividers();C.drawColons(t<colonDimUntil);}
function frame(t){raf=0;if(t-lastDraw>=interval-1){draw(t);lastDraw=t;}if(anims.size||t<colonDimUntil)raf=requestAnimationFrame(frame);}
function wake(){if(!raf)raf=requestAnimationFrame(frame);}
function setCell(r,c,next,opt={}){const key=r*B.COLS+c,cur=state[r][c];if(cur.char===next.char&&cur.macro===next.macro&&!anims.has(key))return;anims.set(key,{from:{...cur},to:{...next},start:performance.now()+(opt.delay||0),duration:opt.duration||300});wake();}
function pulse(){colonDimUntil=performance.now()+150;wake();}
R.register({init(){draw(performance.now());},setCell,pulseColons:pulse,activeCount:()=>anims.size,canvas:C.canvas});
})();