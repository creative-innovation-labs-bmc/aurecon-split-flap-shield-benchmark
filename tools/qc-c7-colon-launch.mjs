import { chromium } from 'playwright';
import fs from 'node:fs';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:3840,height:804}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

await page.goto('http://127.0.0.1:8000/c-canvas-2560.html?build=c7-qc',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.CanvasBench?.colonLaunchState&&window.__c5SideClockHealth&&window.__canvasCHealth,{timeout:10000});

const inspect=()=>page.evaluate(()=>{
  const C=window.CanvasBench,B=window.BenchData;
  const ctx=C.ctx;
  const greenCount=(lx,ly,r=10)=>{
    const px=Math.round(lx*C.sx),py=Math.round(ly*C.sy),rr=Math.max(2,Math.round(r*Math.min(C.sx,C.sy)));
    const d=ctx.getImageData(Math.max(0,px-rr),Math.max(0,py-rr),rr*2+1,rr*2+1).data;
    let n=0;
    for(let i=0;i<d.length;i+=4){if(d[i]>100&&d[i+1]>150&&d[i+1]>d[i]*1.25&&d[i+2]<90&&d[i+3]>150)n++;}
    return n;
  };
  const firstGap=B.COLON_GAPS[0],leftGlobal=B.CENTRE_START+firstGap[0];
  const melX=B.cellX(leftGlobal)+68,melY=B.cellY(2)+45;
  const sideX=B.cellX(2)+36,sideY=B.cellY(2)+28;
  return {
    state:C.colonLaunchState(),
    pixels:{melbourne:greenCount(melX,melY,12),sideTopLeft:greenCount(sideX,sideY,7)},
    side:{...window.__c5SideClockHealth},
    canvas:{...window.__canvasCHealth},
    active:window.BenchRuntime.getRenderer().activeCount()
  };
});

const initial=await inspect();
await page.screenshot({path:'qc/c7-colons-initial.png'});
await page.waitForTimeout(2500);
const early=await inspect();
await page.screenshot({path:'qc/c7-colons-early.png'});
await page.waitForTimeout(1200);
const middle=await inspect();
await page.screenshot({path:'qc/c7-colons-middle.png'});
await page.waitForTimeout(4700);
const final=await inspect();
await page.screenshot({path:'qc/c7-colons-final.png'});
await page.waitForTimeout(1200);
const after=await inspect();

const zero=v=>v<=0.001;
const one=v=>v>=0.999;
const initialAllHidden=Object.entries(initial.state).filter(([k])=>k!=='age').every(([,v])=>zero(v));
const finalAllVisible=Object.entries(final.state).filter(([k])=>k!=='age').every(([,v])=>one(v));
const report={
  passed:false,
  checks:{
    initialAllColonProgressZero:initialAllHidden,
    initialMelbournePixelsHidden:initial.pixels.melbourne===0,
    initialSidePixelsHidden:initial.pixels.sideTopLeft===0,
    stagedRevealBegins:early.state.sideTopLeft>0&&early.state.sideBottomLeft===0,
    laterGroupsRemainDelayed:middle.state.sideTopRight>0&&middle.state.sideBottomRight===0,
    finalAllColonProgressComplete:finalAllVisible,
    finalMelbournePixelsVisible:final.pixels.melbourne>0,
    finalSidePixelsVisible:final.pixels.sideTopLeft>0,
    sideSecondsStillTick:after.side.ticks>final.side.ticks,
    queueDrains:after.active===0,
    noWatchdogRecovery:after.canvas.watchdogRecoveries===0,
    noErrors:errors.length===0
  },
  details:{initial,early,middle,final,after,errors}
};
report.passed=Object.values(report.checks).every(Boolean);
fs.mkdirSync('qc',{recursive:true});
fs.writeFileSync('qc/c7-colon-launch-report.json',JSON.stringify(report,null,2)+'\n');
await browser.close();
if(!report.passed)process.exitCode=1;
