(() => {
const C=window.CanvasBench,ctx=C.ctx;
C.drawHalf=(x,y,s,top)=>{
  ctx.fillStyle=s.macro?(top?'#f7f7f5':'#d7d7d3'):(top?'#3f3f3c':'#232322');
  ctx.fillRect(x,y+(top?0:45),72,45);
  if(!s.macro&&s.char.trim()){
    ctx.save();ctx.beginPath();ctx.rect(x,y+(top?0:45),72,45);ctx.clip();
    ctx.fillStyle='#fff';ctx.font='700 34px "Open Sans"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s.char,x+36,y+47);ctx.restore();
  }
};
C.drawStatic=(x,y,s)=>{C.drawHalf(x,y,s,true);C.drawHalf(x,y,s,false);ctx.fillStyle='#080808';ctx.fillRect(x,y+44,72,2);};
})();