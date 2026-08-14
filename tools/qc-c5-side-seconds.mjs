import { chromium } from 'playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:3840,height:804}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

await page.goto('http://127.0.0.1:8000/c-canvas-2560.html?build=c5-qc',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__c5SideClockHealth&&window.__canvasCHealth&&window.CanvasBench?.textGeometry,{timeout:10000});
await page.waitForTimeout(8200);

const before=await page.evaluate(()=>({
  side:{...window.__c5SideClockHealth},
  canvas:{...window.__canvasCHealth},
  geom:window.CanvasBench.textGeometry,
  rows:[2,6].map(r=>{
    const g=window.BenchState.makeGrid(new Date());
    return {
      left:g[r].slice(0,8).map(v=>v.char).join(''),
      right:g[r].slice(41,49).map(v=>v.char).join('')
    };
  })
}));

const waitToTick=1000-(Date.now()%1000)+70;
await page.waitForTimeout(waitToTick);
await page.screenshot({path:'qc/c5-side-seconds-mid-a.png',clip:{x:20,y:245,width:620,height:125}});
await page.waitForTimeout(110);
await page.screenshot({path:'qc/c5-side-seconds-mid-b.png',clip:{x:20,y:245,width:620,height:125}});
await page.waitForTimeout(170);
await page.screenshot({path:'qc/c5-side-seconds-after.png',clip:{x:20,y:245,width:620,height:125}});

const after=await page.evaluate(()=>({
  side:{...window.__c5SideClockHealth},
  canvas:{...window.__canvasCHealth},
  active:window.BenchRuntime.getRenderer().activeCount()
}));
await page.screenshot({path:'qc/c5-full-3840x804.png'});

const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const hashes={a:hash('qc/c5-side-seconds-mid-a.png'),b:hash('qc/c5-side-seconds-mid-b.png'),after:hash('qc/c5-side-seconds-after.png')};
const validPattern=s=>/^\d{2} \d{2} \d{2}$/.test(s);
const report={
  passed:false,
  checks:{
    hhmmssLeftTop:validPattern(before.rows[0].left),
    hhmmssRightTop:validPattern(before.rows[0].right),
    hhmmssLeftBottom:validPattern(before.rows[1].left),
    hhmmssRightBottom:validPattern(before.rows[1].right),
    sideTickerAdvanced:after.side.ticks>before.side.ticks,
    sideTickerTargetsBothRows:after.side.lastRows.includes(2)&&after.side.lastRows.includes(6),
    textAnimationAdvanced:after.canvas.textAnimatedCellDraws>before.canvas.textAnimatedCellDraws,
    visibleSidePixelsMove:hashes.a!==hashes.b||hashes.b!==hashes.after,
    smallTextCentred:Math.abs(before.geom.visualCentre-45)<0.01,
    queueDrains:after.active===0,
    noErrors:errors.length===0
  },
  details:{before,after,hashes,errors}
};
report.passed=Object.values(report.checks).every(Boolean);
fs.mkdirSync('qc',{recursive:true});
fs.writeFileSync('qc/c5-side-seconds-report.json',JSON.stringify(report,null,2)+'\n');
await browser.close();
if(!report.passed)process.exitCode=1;
