(() => {
'use strict';
const C=window.CanvasBench,ctx=C.ctx;

if(!C.isC){
  C.drawHalf=(x,y,s,top)=>{
    ctx.fillStyle=s.macro?(top?'#f7f7f5':'#d7d7d3'):(top?'#3f3f3c':'#232322');
    ctx.fillRect(x,y+(top?0:45),72,45);
    if(!s.macro&&s.char.trim()){
      ctx.save();ctx.beginPath();ctx.rect(x,y+(top?0:45),72,45);ctx.clip();
      ctx.fillStyle='#fff';ctx.font='700 34px "Open Sans"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s.char,x+36,y+47);ctx.restore();
    }
  };
  C.drawStatic=(x,y,s)=>{C.drawHalf(x,y,s,true);C.drawHalf(x,y,s,false);ctx.fillStyle='#080808';ctx.fillRect(x,y+44,72,2);};
  return;
}

const FONT='700 34px "Open Sans"';
const spriteCache=new Map();
ctx.save();
ctx.font=FONT;
ctx.textBaseline='alphabetic';
const metrics=ctx.measureText('Hgj09WM');
ctx.restore();
const ascent=metrics.actualBoundingBoxAscent||25;
const descent=metrics.actualBoundingBoxDescent||7;
const baseline=45+(ascent-descent)/2;
C.textGeometry={font:FONT,ascent,descent,baseline,visualCentre:baseline-(ascent-descent)/2};

function sprite(state,top){
  const char=String(state.char??' ').slice(0,1)||' ';
  const key=`${state.macro?'1':'0'}|${top?'T':'B'}|${char}`;
  if(spriteCache.has(key))return spriteCache.get(key);
  const w=Math.max(1,Math.ceil(72*C.sx));
  const h=Math.max(1,Math.ceil(45*C.sy));
  const out=document.createElement('canvas');
  out.width=w;out.height=h;
  const g=out.getContext('2d',{alpha:false,desynchronized:true});
  g.setTransform(C.sx,0,0,C.sy,0,0);
  g.fillStyle=state.macro?(top?'#f7f7f5':'#d7d7d3'):(top?'#3f3f3c':'#232322');
  g.fillRect(0,0,72,45);
  if(!state.macro&&char.trim()){
    g.fillStyle='#fff';
    g.font=FONT;
    g.textAlign='center';
    g.textBaseline='alphabetic';
    g.fillText(char,36,baseline-(top?0:45));
  }
  spriteCache.set(key,out);
  return out;
}

C.drawHalf=(target,x,y,state,top)=>{
  target.drawImage(sprite(state,top),x,y+(top?0:45),72,45);
};
C.drawStatic=(target,x,y,state)=>{
  C.drawHalf(target,x,y,state,true);
  C.drawHalf(target,x,y,state,false);
  target.fillStyle='#080808';
  target.fillRect(x,y+44,72,2);
};
C.spriteCache=spriteCache;
})();