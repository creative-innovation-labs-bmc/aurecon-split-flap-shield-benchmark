(() => {
'use strict';
const R=window.BenchRuntime,diag=document.getElementById('diagnostics');
R.updateDiagnostics=(t,m,started,done)=>{if(!diag)return;const active=R.getRenderer()?.activeCount?.()||0;const elapsed=Math.max(0,(t-started)/1000);diag.textContent=R.config.name+'\nINTERNAL '+R.config.internal[0]+' × '+R.config.internal[1]+'\nFPS '+m.fps+'   ACTIVE '+active+'\nAVG '+m.avgFrameMs.toFixed(1)+'ms   P95 '+m.p95FrameMs.toFixed(1)+'ms\nWORST '+m.worstFrameMs.toFixed(1)+'ms\n>33ms '+m.over33+'   >50ms '+m.over50+'\nELAPSED '+elapsed.toFixed(1)+' / 30.0s'+(done?'\nCOMPLETE':'');};
})();