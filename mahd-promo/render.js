// Usage: node render.js <outDir> [fps=30] [duration=15]   or   node render.js <outDir> --times 0.5,2,4 ...
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
(async()=>{
  const out=process.argv[2]; fs.mkdirSync(out,{recursive:true});
  let times=[];
  if(process.argv[3]==='--times') times=process.argv[4].split(',').map(Number);
  else {const fps=+(process.argv[3]||30),dur=+(process.argv[4]||15);for(let i=0;i<Math.round(fps*dur);i++)times.push(i/fps);}
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  await p.goto('file://'+path.resolve(__dirname,'promo.html'));
  await p.evaluate(()=>window.ready);await p.waitForTimeout(500);
  for(let i=0;i<times.length;i++){
    await p.evaluate(t=>window.render(t),times[i]);
    const name=process.argv[3]==='--times'?`t${times[i].toFixed(2)}.jpg`:`f${String(i).padStart(4,'0')}.jpg`;
    await p.screenshot({path:path.join(out,name),type:'jpeg',quality:94});
    if(i%50===0)console.log('frame',i,'/',times.length);
  }
  await b.close();
})();
