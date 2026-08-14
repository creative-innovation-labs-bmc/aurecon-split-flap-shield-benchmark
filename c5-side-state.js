(() => {
'use strict';
const B=window.BenchData,S=window.BenchState;
const originalMakeGrid=S.makeGrid;
function writeText(grid,row,col,width,text){
  const v=String(text).slice(0,width).padEnd(width,' ');
  for(let i=0;i<width;i++)grid[row][col+i]={char:v[i],macro:false};
}
S.makeGrid=date=>{
  const grid=originalMakeGrid(date);
  const offices=S.getCurrentOffices();
  const right=B.COLS-B.SIDE_COLS;
  const cards=[
    {office:offices[0],col:0,row:0},
    {office:offices[1],col:0,row:4},
    {office:offices[2],col:right,row:0},
    {office:offices[3],col:right,row:4}
  ];
  for(const card of cards){
    if(!card.office)continue;
    const p=S.parts(card.office.tz,date);
    writeText(grid,card.row+2,card.col,8,`${p.hour} ${p.minute} ${p.second}`);
  }
  return grid;
};
})();
