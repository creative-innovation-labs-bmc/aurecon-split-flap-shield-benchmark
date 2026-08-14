(() => {
'use strict';
const B=window.BenchData,S=window.BenchState,R=window.BenchRuntime;
if(R.bench)return;
let timer=0,started=performance.now();
const health=window.__c5SideClockHealth={ticks:0,requestedCells:0,lastTickMs:0,lastRows:[]};
function render(){
  const renderer=R.getRenderer();
  if(!renderer)return;
  const age=performance.now()-started;
  const next=S.makeGrid(new Date());
  const rows=[];
  for(const row of [2,6]){
    if(row===2&&age<3000)continue;
    if(row===6&&age<7200)continue;
    rows.push(row);
    for(let c=0;c<B.SIDE_COLS;c++){renderer.setCell(row,c,next[row][c],{duration:260,officeClock:true});health.requestedCells++;}
    for(let c=B.COLS-B.SIDE_COLS;c<B.COLS;c++){renderer.setCell(row,c,next[row][c],{duration:260,officeClock:true});health.requestedCells++;}
  }
  if(rows.length){health.ticks++;health.lastTickMs=Date.now();health.lastRows=rows;}
}
function schedule(){
  clearTimeout(timer);
  const wait=1000-(Date.now()%1000)+12;
  timer=setTimeout(()=>{if(!document.hidden)render();schedule();},wait);
}
function resume(){
  if(document.hidden)return;
  render();
  schedule();
}
document.addEventListener('visibilitychange',resume,{passive:true});
setTimeout(resume,1000);
})();
