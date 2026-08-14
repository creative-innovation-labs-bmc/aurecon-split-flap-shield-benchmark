(() => {
'use strict';
const B=window.BenchData,S=window.BenchState,R=window.BenchRuntime;
if(R.bench)return;
let timer=0,started=performance.now();
function render(){
  const renderer=R.getRenderer();
  if(!renderer)return;
  const age=performance.now()-started;
  const next=S.makeGrid(new Date());
  for(const row of [2,6]){
    if(row===2&&age<3000)continue;
    if(row===6&&age<7200)continue;
    for(let c=0;c<B.SIDE_COLS;c++)renderer.setCell(row,c,next[row][c],{duration:260,officeClock:true});
    for(let c=B.COLS-B.SIDE_COLS;c<B.COLS;c++)renderer.setCell(row,c,next[row][c],{duration:260,officeClock:true});
  }
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
