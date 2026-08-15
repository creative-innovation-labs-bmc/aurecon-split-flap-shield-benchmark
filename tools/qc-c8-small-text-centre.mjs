import { chromium } from 'playwright';
import fs from 'node:fs';

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:3840,height:804}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

await page.goto('http://127.0.0.1:8000/c-canvas-2560.html?build=c8-qc',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.CanvasBench?.glyphGeometry&&window.BenchRuntime?.getRenderer(),{timeout:10000});
await page.waitForTimeout(9300);

await page.evaluate(()=>{
  const r=window.BenchRuntime.getRenderer();
  r.setCell(0,0,{char:'E',macro:false},{duration:260,officeClock:true,force:true});
  r.setCell(0,1,{char:'3',macro:false},{duration:260,officeClock:true,force:true});
});
await page.waitForTimeout(500);

const result=await page.evaluate(()=>{
  const B=window.BenchData,C=window.CanvasBench,canvas=C.canvas;
  const raw=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height);
  function scan(row,col,char){
    const x0=Math.floor(B.cellX(col)*C.sx),y0=Math.floor(B.cellY(row)*C.sy);
    const w=Math.ceil(72*C.sx),h=Math.ceil(90*C.sy);
    let minY=Infinity,maxY=-Infinity,minX=Infinity,maxX=-Infinity,count=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=((y0+y)*raw.width+(x0+x))*4;
      const r=raw.data[i],g=raw.data[i+1],b=raw.data[i+2];
      if(r>215&&g>215&&b>215){
        minY=Math.min(minY,y);maxY=Math.max(maxY,y);minX=Math.min(minX,x);maxX=Math.max(maxX,x);count++;
      }
    }
    const pixelCentre=(minY+maxY)/2;
    const hingeDevice=45*C.sy;
    return {char,minY,maxY,minX,maxX,count,pixelCentre,hingeDevice,errorDevicePx:pixelCentre-hingeDevice,errorLogicalPx:(pixelCentre-hingeDevice)/C.sy,geometry:C.glyphGeometry(char)};
  }
  return {E:scan(0,0,'E'),three:scan(0,1,'3'),sx:C.sx,sy:C.sy,textGeometry:C.textGeometry,errors:[]};
});
result.errors=errors;
const toleranceLogical=0.01;
const report={passed:false,checks:{EVisible:result.E.count>0,threeVisible:result.three.count>0,ECentredOnHinge:Math.abs(result.E.errorLogicalPx)<=toleranceLogical,threeCentredOnHinge:Math.abs(result.three.errorLogicalPx)<=toleranceLogical,usesPerGlyphRasterCentre:result.textGeometry.mode==='per-glyph-raster-centred',rasterCorrectionApplied:Math.abs(result.textGeometry.rasterCorrection-2.25)<0.001,noErrors:errors.length===0},details:result};
report.passed=Object.values(report.checks).every(Boolean);
fs.mkdirSync('qc',{recursive:true});
fs.writeFileSync('qc/c8-small-text-centre-report.json',JSON.stringify(report,null,2)+'\n');
await page.screenshot({path:'qc/c8-small-text-centre-3840x804.png'});
await browser.close();
if(!report.passed)process.exitCode=1;
