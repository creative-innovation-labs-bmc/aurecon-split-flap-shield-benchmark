(() => {
'use strict';
const B=window.BenchData,S=window.BenchState,params=new URLSearchParams(location.search),bench=params.get('bench')==='1';
if(bench)document.body.classList.add('benchmark');
const config=window.RENDERER_CONFIG||{name:'UNKNOWN',type:'unknown',internal:[3840,804],targetFps:60},root=document.getElementById('renderer-root');
let renderer=null,events=[],schedulerRAF=0,startPerf=0,benchmarkStart=0,syntheticMs=0,launchStarted=0;
function schedule(at,fn){events.push({at,fn});events.sort((a,b)=>a.at-b.at);wake()}
function wake(){if(!schedulerRAF)schedulerRAF=requestAnimationFrame(run)}
function run(now){schedulerRAF=0;const elapsed=now-(bench?benchmarkStart:startPerf);while(events.length&&events[0].at<=elapsed+1)events.shift().fn();if(events.length)schedulerRAF=requestAnimationFrame(run)}
function transitionGrid(next,duration=300,stagger=false){for(let r=0;r<B.ROWS;r++)for(let c=0;c<B.COLS;c++)renderer.setCell(r,c,next[r][c],{duration,delay:stagger?r*1120+c*20:0})}
function launch(date){launchStarted=performance.now();transitionGrid(S.makeGrid(date),300,true)}
function renderTime(date,duration=220){const next=S.makeGrid(date),age=performance.now()-launchStarted,launching=age<7800;for(let r=1;r<=5;r++)for(let c=B.CENTRE_START;c<B.CENTRE_START+B.CENTRE_COLS;c++){if(launching&&age<r*1120+c*20)continue;renderer.setCell(r,c,next[r][c],{duration})}renderer.pulseColons&&renderer.pulseColons()}
function renderOffices(date,duration=300){const next=S.makeGrid(date),rows=[0,1,2,4,5,6];for(const r of rows){for(let c=0;c<B.SIDE_COLS;c++)renderer.setCell(r,c,next[r][c],{duration});for(let c=B.COLS-B.SIDE_COLS;c<B.COLS;c++)renderer.setCell(r,c,next[r][c],{duration})}}
function stressBurst(){const current=S.makeGrid(new Date(syntheticMs));for(let r=0;r<B.ROWS;r++)for(let c=0;c<B.COLS;c++){if((r+c)%2===0||(r*B.COLS+c)%5===0){const v=current[r][c];renderer.setCell(r,c,{char:v.macro?' ':'#',macro:!v.macro&&r>=1&&r<=5&&c>=B.CENTRE_START&&c<B.CENTRE_START+B.CENTRE_COLS},{duration:180})}}schedule(900,()=>transitionGrid(S.makeGrid(new Date(syntheticMs)),240,false))}
function startBenchmark(){benchmarkStart=performance.now();startPerf=benchmarkStart;syntheticMs=new Date('2026-08-04T02:34:57Z').getTime();S.initOffices();launch(new Date(syntheticMs));for(let s=1;s<=8;s++)schedule(s*1000,()=>{syntheticMs+=1000;renderTime(new Date(syntheticMs),180)});schedule(9000,()=>{S.nextOffices();renderOffices(new Date(syntheticMs),240)});schedule(14000,stressBurst);for(let s=16;s<=25;s++)schedule(s*1000,()=>{syntheticMs+=1000;renderTime(new Date(syntheticMs),180)});schedule(27000,()=>{S.nextOffices();renderOffices(new Date(syntheticMs),180)});schedule(30000,()=>window.BenchRuntime.finishBenchmark())}
function startLive(){startPerf=performance.now();S.initOffices();launch(new Date());const tick=()=>{renderTime(new Date(),220);setTimeout(tick,1000-(Date.now()%1000)+8)};setTimeout(tick,1000);setInterval(()=>{S.nextOffices();renderOffices(new Date(),300)},14000)}
function fit(){const stage=document.getElementById('stage'),scale=Math.min(innerWidth/B.W,innerHeight/B.H);stage.style.left=`${Math.round((innerWidth-B.W*scale)/2)}px`;stage.style.top=`${Math.round((innerHeight-B.H*scale)/2)}px`;stage.style.transform=`scale(${scale})`}
window.addEventListener('resize',fit,{passive:true});
window.BenchRuntime={bench,config,root,getRenderer:()=>renderer,register(r){renderer=r;fit();Promise.resolve(document.fonts&&document.fonts.ready).finally(()=>{renderer.init();bench?startBenchmark():startLive();if(bench)window.BenchRuntime.startMonitor()})}};
})();