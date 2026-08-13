(() => {
'use strict';
const R=window.BenchRuntime;let frames=[],last=0,recent=[],raf=0,done=false,started=0;
function q95(a){if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);return s[Math.floor((s.length-1)*.95)]}
function stats(){const avg=frames.length?frames.reduce((a,b)=>a+b,0)/frames.length:0;return{fps:recent.length,avgFrameMs:avg,p95FrameMs:q95(frames),worstFrameMs:frames.length?Math.max(...frames):0,over33:frames.filter(x=>x>33.34).length,over50:frames.filter(x=>x>50).length,frames:frames.length}}
R.startMonitor=()=>{started=performance.now();last=started;const tick=t=>{const dt=t-last;last=t;if(dt>0&&dt<500){frames.push(dt);recent.push(t);while(recent.length&&recent[0]<t-1000)recent.shift()}R.updateDiagnostics&&R.updateDiagnostics(t,stats(),started,done);if(!done)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)};
R.finishBenchmark=()=>{if(done)return;done=true;cancelAnimationFrame(raf);const s=stats();window.__benchmarkResult={renderer:R.config.name,type:R.config.type,internalWidth:R.config.internal[0],internalHeight:R.config.internal[1],targetFps:R.config.targetFps,elapsedMs:performance.now()-started,...s,activeAnimations:R.getRenderer()?.activeCount?.()||0};R.updateDiagnostics&&R.updateDiagnostics(performance.now(),s,started,done)};
})();