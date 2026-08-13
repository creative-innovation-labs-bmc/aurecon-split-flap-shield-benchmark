import { chromium } from 'playwright';
import fs from 'node:fs';
const tests=[['A','a-dom-3d.html',3840,804],['B','b-dom-2d.html',3840,804],['C','c-canvas-2560.html',2560,536],['D','d-canvas-1920.html',1920,402]];
const report={passed:true,renderers:{}};
const browser=await chromium.launch({headless:true});
for(const [id,file,iw,ih] of tests){
  const page=await browser.newPage({viewport:{width:3840,height:804}}),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto('http://127.0.0.1:8000/'+file+'?bench=1',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__benchmarkResult,{timeout:45000});
  const data=await page.evaluate(()=>({
    result:window.__benchmarkResult,
    logical:window.BenchData.ROWS*window.BenchData.COLS,
    offices:window.BenchState.getCurrentOffices().map(o=>o.display),
    font:document.fonts.check('700 34px "Open Sans"'),
    canvas:document.querySelector('canvas')?{w:document.querySelector('canvas').width,h:document.querySelector('canvas').height}:null,
    dom:document.querySelectorAll('.d3-flap,.d2-flap').length,
    digit2:window.BenchData.DIGITS['2']
  }));
  const checks={logical343:data.logical===343,fontLoaded:data.font,officeUnique:new Set(data.offices).size===4,benchmarkComplete:Boolean(data.result),noErrors:errors.length===0,internalSize:data.canvas?data.canvas.w===iw&&data.canvas.h===ih:data.dom===343,digitPattern:data.digit2.join('|')==='1110|0001|0110|1000|1111'};
  const passed=Object.values(checks).every(Boolean);report.renderers[id]={file,passed,checks,errors,result:data.result,offices:data.offices};if(!passed)report.passed=false;
  await page.screenshot({path:'qc/'+id.toLowerCase()+'-3840x804.png'});await page.close();
}
await browser.close();
fs.mkdirSync('qc',{recursive:true});fs.writeFileSync('qc/report.json',JSON.stringify(report,null,2)+'\n');
if(!report.passed)process.exitCode=1;
