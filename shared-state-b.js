(() => {
'use strict';
const B=window.BenchData,S=window.BenchState;
function blankGrid(){return Array.from({length:B.ROWS},()=>Array.from({length:B.COLS},()=>({char:' ',macro:false})))}
function writeText(grid,row,col,width,text){const v=String(text).slice(0,width).padEnd(width,' ');for(let i=0;i<width;i++)grid[row][col+i]={char:v[i],macro:false}}
function applyOffices(grid,date){const offices=S.getCurrentOffices(),right=B.COLS-B.SIDE_COLS,cards=[{office:offices[0],c:0,r:0,right:false},{office:offices[1],c:0,r:4,right:false},{office:offices[2],c:right,r:0,right:true},{office:offices[3],c:right,r:4,right:true}];cards.forEach(card=>{if(!card.office)return;const dc=card.right?card.c+1:card.c,dw=card.right?7:8,p=S.parts(card.office.tz,date),time=dw===7?` ${p.hour} ${p.minute} `:` ${p.hour} ${p.minute}  `;writeText(grid,card.r,card.c,8,S.centredOffice(card.office.display,8,card.right));writeText(grid,card.r+1,dc,dw,S.centred(card.office.country,dw));writeText(grid,card.r+2,dc,dw,time)})}
function applyMeta(grid){writeText(grid,0,B.CENTRE_START,B.CENTRE_COLS,S.centred('MELBOURNE AUSTRALIA 17.4° CLEAR',B.CENTRE_COLS));writeText(grid,6,B.CENTRE_START,B.CENTRE_COLS,S.centred('WIND WNW 15KMH HUM 58% RAIN 0.2MM',B.CENTRE_COLS))}
function applyClock(grid,date){const t=S.fullTime('Australia/Melbourne',date),d=[t[0],t[1],t[3],t[4],t[6],t[7]];d.forEach((digit,di)=>B.DIGITS[digit].forEach((line,r)=>[...line].forEach((v,c)=>{grid[1+r][B.CENTRE_START+B.DIGIT_STARTS[di]+c]={char:' ',macro:v==='1'}})))}
S.makeGrid=date=>{const g=blankGrid();applyMeta(g);applyOffices(g,date);applyClock(g,date);return g};
})();