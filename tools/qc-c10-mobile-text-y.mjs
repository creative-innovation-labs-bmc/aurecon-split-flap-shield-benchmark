import { chromium } from 'playwright';
import fs from 'node:fs';

async function run(offset){
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(`http://127.0.0.1:8000/c-canvas-2560.html?build=c10-mobile-qc&texty=${offset}`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.CanvasBench?.glyphGeometry&&window.BenchRuntime?.getRenderer(),{timeout:10000});
  await page.waitForTimeout(9300);
  await page.evaluate(()=>{
    const r=window.BenchRuntime.getRenderer();
    r.setCell(0,0,{char:'E',macro:false},{duration:120,officeClock:true,force:true});
    r.setCell(0,1,{char:'3',macro:false},{duration:120,officeClock:true,force:true});
  });
  await page.waitForTimeout(350);
  const result=await page.evaluate(()=>{
    const B=window.BenchData,C=window.CanvasBench,canvas=C.canvas;
    const raw=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
    function scan(row,col,char){
      const x0=Math.floor(B.cellX(col)*C.sx),y0=Math.floor(B.cellY(row)*C.sy);
      const w=Math.ceil(72*C.sx),h=Math.ceil(90*C.sy);
      let minY=Infinity,maxY=-Infinity,count=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const i=((y0+y)*raw.width+(x0+x))*4;
        const r=raw.data[i],g=raw.data[i+1],b=raw.data[i+2];
        if(r>215&&g>215&&b>215){minY=Math.min(minY,y);maxY=Math.max(maxY,y);count++;}
      }
      const pixelCentre=(minY+maxY)/2;
      const hingeDevice=45*C.sy;
      return {char,minY,maxY,count,pixelCentre,hingeDevice,errorDevicePx:pixelCentre-hingeDevice,errorLogicalPx:(pixelCentre-hingeDevice)/C.sy,geometry:C.glyphGeometry(char)};
    }
    return {
      viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      cssValue:getComputedStyle(document.documentElement).getPropertyValue('--small-flap-text-y').trim(),
      textGeometry:C.textGeometry,
      E:scan(0,0,'E'),three:scan(0,1,'3')
    };
  });
  result.errors=errors;
  await page.screenshot({path:`qc/c10-mobile-texty-${String(offset).replace('-','m')}.png`,fullPage:false});
  await browser.close();
  return result;
}

const zero=await run(0);
const down3=await run(3);
const movedE=down3.E.errorLogicalPx-zero.E.errorLogicalPx;
const moved3=down3.three.errorLogicalPx-zero.three.errorLogicalPx;
const report={
  passed:false,
  checks:{
    mobileViewport:zero.viewport.width===393&&zero.viewport.height===852&&zero.viewport.dpr===3,
    cssControlLoaded:zero.cssValue==='0px',
    zeroOverrideApplied:zero.textGeometry.opticalOffset===0,
    threeOverrideApplied:down3.textGeometry.opticalOffset===3,
    zeroEOnHinge:Math.abs(zero.E.errorLogicalPx)<=0.8,
    zeroThreeOnHinge:Math.abs(zero.three.errorLogicalPx)<=0.8,
    EActuallyMovesDown:movedE>=2.0,
    threeActuallyMovesDown:moved3>=2.0,
    noErrors:zero.errors.length===0&&down3.errors.length===0
  },
  details:{zero,down3,movementLogicalPx:{E:movedE,three:moved3}}
};
report.passed=Object.values(report.checks).every(Boolean);
fs.mkdirSync('qc',{recursive:true});
fs.writeFileSync('qc/c10-mobile-text-y-report.json',JSON.stringify(report,null,2)+'\n');
if(!report.passed)process.exitCode=1;
