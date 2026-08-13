(() => {
'use strict';
const B=window.BenchData,formatters=new Map();let randomDeck=[],randomIndex=0,currentOffices=[];
function formatter(tz){if(!formatters.has(tz))formatters.set(tz,new Intl.DateTimeFormat('en-AU',{timeZone:tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,hourCycle:'h23'}));return formatters.get(tz)}
function parts(tz,date){const p=Object.fromEntries(formatter(tz).formatToParts(date).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));if(p.hour==='24')p.hour='00';return p}
function fullTime(tz,date){const p=parts(tz,date);return `${p.hour}:${p.minute}:${p.second}`}
function centred(s,w){s=String(s).slice(0,w);const r=w-s.length,l=Math.floor(r/2);return ' '.repeat(l)+s+' '.repeat(r-l)}
function centredOffice(s,w,right){s=String(s).slice(0,w);const r=w-s.length;let l=Math.floor(r/2);if(right&&(s.length===5||s.length===7)&&r>0)l=Math.min(l+1,r);return ' '.repeat(l)+s+' '.repeat(r-l)}
function shuffle(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r}
function resetDeck(avoid=true){const visible=new Set(currentOffices.map(o=>o&&o.id));let candidate=shuffle(B.OFFICES);for(let n=0;n<50;n++){if(!(avoid&&candidate.slice(0,4).some(o=>visible.has(o.id))))break;candidate=shuffle(B.OFFICES)}randomDeck=candidate;randomIndex=0}
function initOffices(){resetDeck(false);currentOffices=randomDeck.slice(0,4);randomIndex=4;return currentOffices}
function nextOffices(){if(randomIndex>=randomDeck.length)resetDeck(true);const count=Math.min(4,randomDeck.length-randomIndex),batch=randomDeck.slice(randomIndex,randomIndex+count);batch.forEach((o,i)=>currentOffices[i]=o);randomIndex+=count;return batch}
window.BenchState={parts,fullTime,centred,centredOffice,initOffices,nextOffices,getCurrentOffices:()=>currentOffices.slice()};
})();