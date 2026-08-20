import {chromium} from 'playwright';
import {fileURLToPath} from 'url';
import path from 'path';
const dir=path.dirname(fileURLToPath(import.meta.url));
const url='file://'+path.join(dir,'index.html');
const shots=path.join(dir,'shots');
import fs from 'fs'; fs.mkdirSync(shots,{recursive:true});

const errors=[];
/* ⚠️ this used to hardcode executablePath:'/opt/pw-browsers/chromium', which exists
 * only in the Linux container the suite was first written in — so `npm i playwright
 * && node test.mjs` (what the README tells you to run) could never pass on Kyle's
 * Windows box. Portable now: honour PW_CHROMIUM, else that container path if it is
 * really there, else PW_CHANNEL (e.g. 'chrome'), else playwright's own browser. */
const pwExe=process.env.PW_CHROMIUM||'/opt/pw-browsers/chromium';
const launchOpts={args:['--no-sandbox']};
if(fs.existsSync(pwExe))launchOpts.executablePath=pwExe;
else if(process.env.PW_CHANNEL)launchOpts.channel=process.env.PW_CHANNEL;
const browser=await chromium.launch(launchOpts);
const page=await browser.newPage({viewport:{width:980,height:560}});
page.on('pageerror',e=>errors.push('PAGEERROR: '+e.message));
page.on('console',m=>{if(m.type()==='error')errors.push('CONSOLE: '+m.text())});
const ev=(fn,...a)=>page.evaluate(fn,...a);
let pass=0,fail=0;
function ok(cond,label){ if(cond){pass++;console.log('  ok  '+label)} else {fail++;console.log('  FAIL '+label)} }
async function shot(name){ await page.screenshot({path:path.join(shots,name+'.png')}); }
async function step(s){ await ev(s2=>window.__bite.step(s2),s); }

console.log('== boot ==');
await page.goto(url+'?debug=1');
await page.waitForTimeout(600);
ok(await ev(()=>!!window.__bite),'QA hooks present');
ok(await ev(()=>window.__bite.save().pop.length>100),'population built ('+await ev(()=>window.__bite.save().pop.length)+' fish)');
await ev(()=>{__bite.DBG.month=7;__bite.DBG.hour=7;}); // July, 7am — stable test conditions
await step(1);
await shot('01-title');

console.log('== enter the lake ==');
await ev(()=>__bite.enter());
await step(1);
ok(await ev(()=>__bite.G.mode==='lake'),'lake mode');
await shot('02-lake-dawn');

console.log('== cast & wait (real path) ==');
await ev(()=>__bite.cast('dock'));
await step(1);
ok(await ev(()=>!!__bite.G.line),'line in the water');
ok(await ev(()=>__bite.save().casts>=1),'cast counted');

console.log('== bobber grammar: forced bluegill bite ==');
const fb=await ev(()=>__bite.forceBite('bluegill'));
console.log('   forced:',fb);
// wait until cue stage (skip the fake taps — set during taps should fail first:)
await step(0.2);
let cue=await ev(()=>__bite.cue());
if(cue&&cue.stage==='taps'){ await ev(()=>__bite.set()); await step(0.2);
  ok(await ev(()=>!__bite.G.line.ev),'set on the taps = miss (taps are lies)');
}
// force again and ride to the cue
await ev(()=>__bite.forceBite('bluegill'));
for(let i=0;i<400;i++){ cue=await ev(()=>__bite.cue()); if(cue&&cue.stage==='cue')break; await step(0.3); }
ok(cue&&cue.stage==='cue','cue reached ('+(cue&&cue.cue)+')');
await ev(()=>__bite.set());
await step(0.3);
ok(await ev(()=>__bite.G.mode==='fight'),'hooked → fight');
await shot('03-fight');

console.log('== the fight: hold to reel, land it ==');
await ev(()=>__bite.hold(true));
for(let i=0;i<240;i++){ const s=await ev(()=>({m:__bite.G.mode,surf:__bite.G.fight&&__bite.G.fight.surf,flat:__bite.G.fight&&__bite.G.fight.flat}));
  if(s.m!=='fight')break; if(s.flat){await ev(()=>__bite.net());break}
  if(s.surf){await ev(()=>__bite.hold(false))} await step(0.4); }
let m=await ev(()=>__bite.G.mode);
if(m!=='look'){ // maybe lost — hook again and use the deterministic path
  await ev(()=>{__bite.hookNow('bluegill');__bite.surface();__bite.net()});
  await step(0.2); m=await ev(()=>__bite.G.mode);
}
ok(m==='look','catch card shown');
await shot('04-card-bluegill');
ok(await ev(()=>__bite.save().journal.bluegill&&__bite.save().journal.bluegill.caught>=1),'journal inked');
ok(await ev(()=>__bite.save().released>=1),'released counted');
await ev(()=>__bite.dismiss());
await step(0.2);

console.log('== species sweep (deterministic land of every catchable) ==');
await ev(()=>__bite.rig('spinner'));
const species=await ev(()=>Object.keys(__bite.SP).filter(s=>!__bite.SP[s].unhookable&&s!=='mayor'));
for(const sp of species){
  const r=await ev(s=>{ if(__bite.G.line)__bite.G.line=null;
    const h=__bite.hookNow(s); if(!h)return 'nofish';
    __bite.surface(); __bite.net(); return __bite.G.mode; },sp);
  await step(0.15);
  const landed=await ev(s=>__bite.save().journal[s]&&__bite.save().journal[s].caught>0,sp);
  ok(landed,'landed + journaled: '+sp+' ('+r+')');
  await ev(()=>__bite.dismiss()); await step(0.1);
}
ok(await ev(()=>Object.keys(__bite.save().journal).length>=13),'journal has all 13 regular catchables (mayor later = 14)');
await shot('05-journal-p0-pending');

console.log('== sore-mouth: fish remembers ==');
ok(await ev(()=>{const f=__bite.save().pop.find(q=>q.sp==='bluegill'&&q.c>0);return f&&f.sU>Date.now()}),'caught fish is sore-mouthed');

console.log('== lure archaeology: snag the rowboat ==');
const found=await ev(()=>{ // simulate resolved boat snags via the real resolver
  let finds=0;
  for(let i=0;i<60;i++){ if(__bite.G.line)__bite.G.line=null;
    __bite.rig('spinner');
    __bite.cast('boat'); const L=__bite.G.line; if(!L)break;
    L.st='ret'; L.retrieve=true; L.lx=.5; L.snag={t:0,work:1.25}; // mid work
    __bite.hold(true); __bite.step(.3); __bite.hold(false);
    if(__bite.G.find){finds++; __bite.dismiss()}
  }
  return {finds:finds,owned:Object.keys(__bite.save().lures).filter(k=>__bite.save().lures[k].found).length};
});
console.log('   finds:',JSON.stringify(found));
ok(found.owned>=3,'lures recovered from the bottom ('+found.owned+')');

console.log('== the mayor: follow → figure-8 → first break-off ==');
await ev(()=>{__bite.DBG.mayor=true});
let hooked=0;
for(let att=0;att<8&&!hooked;att++){
  await ev(()=>{ if(__bite.G.line)__bite.G.line=null; __bite.follow(); });
  await ev(()=>__bite.hold(true));
  for(let i=0;i<80;i++){ const st=await ev(()=>({lx:__bite.G.line?__bite.G.line.lx:null,f:!!__bite.G.follow,m:__bite.G.mode}));
    if(st.m==='fight'){hooked=1;break}
    if(st.lx==null)break;
    if(st.lx<.15)await ev(()=>__bite.fig8());
    await step(0.3); }
  await ev(()=>__bite.hold(false));
}
ok(hooked===1,'figure-8 converted a follow into a strike');
await shot('06-mayor-fight');
// ride the scripted heartbreak
for(let i=0;i<200;i++){ const s=await ev(()=>__bite.G.mode); if(s!=='fight')break; await ev(()=>__bite.hold(true)); await step(0.4); }
const my=await ev(()=>__bite.save().mayor);
ok(my.hooked===1&&my.landed===0,'first hookup = scripted break-off (hooked=1, landed=0)');
ok(!!my.spoon,'she kept the lure: '+my.spoon);

console.log('== the mayor: the landing ==');
hooked=0;
for(let att=0;att<8&&!hooked;att++){
  await ev(()=>{ if(__bite.G.line)__bite.G.line=null; __bite.rig('bucktail'); __bite.follow(); });
  await ev(()=>__bite.hold(true));
  for(let i=0;i<80;i++){ const st=await ev(()=>({lx:__bite.G.line?__bite.G.line.lx:null,m:__bite.G.mode}));
    if(st.m==='fight'){hooked=1;break}
    if(st.lx==null)break;
    if(st.lx<.15)await ev(()=>__bite.fig8());
    await step(0.3); }
  await ev(()=>__bite.hold(false));
}
ok(hooked===1,'hooked her again');
await ev(()=>{__bite.surface();__bite.net()});
await step(0.2);
ok(await ev(()=>__bite.save().mayor.landed===1),'THE MAYOR LANDED (once per save)');
ok(await ev(()=>__bite.G.mode==='look'&&__bite.G.card&&__bite.G.card.mayor),'mayor card with dad line');
await shot('07-card-mayor');
await ev(()=>__bite.dismiss());

console.log('== journal pages ==');
await ev(()=>{__bite.G.overlay='journal';__bite.G.jPage=0}); await step(0.2); await shot('08-journal-species');
await ev(()=>{__bite.G.jPage=1}); await step(0.2); await shot('09-journal-mayor');
await ev(()=>{__bite.G.overlay=null});

console.log('== box overlay ==');
await ev(()=>{__bite.G.overlay='box'}); await step(0.2); await shot('10-tacklebox');
await ev(()=>{__bite.G.overlay=null});

console.log('== light & weather passes ==');
await ev(()=>{__bite.DBG.hour=13}); await step(0.5); await shot('11-lake-noon');
await ev(()=>{__bite.DBG.hour=20.0}); await step(0.5); await shot('12-lake-dusk');
await ev(()=>{__bite.DBG.hour=23.5}); await step(0.5); await shot('13-lake-night');
await ev(()=>{__bite.DBG.hour=9;__bite.DBG.wx={press:'falling',sky:'drizzle',rain:true,wind:{dir:1,str:.6}}});
await step(1.2); await shot('14-lake-rain');
await ev(()=>{__bite.DBG.wx=null});

console.log('== winter: two acts ==');
// ACT ONE — the absence. The bible makes the freeze the house's retention law, so
// ice fishing must NOT delete it: at freeze-up the door is still shut.
await ev(()=>{__bite.DBG.month=12;__bite.DBG.day=10;__bite.DBG.ice=null;
  __bite.G.iceOut=false;__bite.G.ice=null;__bite.G.line=null;__bite.enter()}); await step(0.3);
ok(await ev(()=>__bite.G.mode==='frozen'),'locked out at freeze-up (the absence survives)');
await shot('15-frozen');
// ACT TWO — the ice goes hard around the solstice and you can walk out on it.
await ev(()=>{__bite.DBG.month=1;__bite.DBG.day=15;
  __bite.G.iceOut=false;__bite.G.ice=null;__bite.G.line=null;__bite.G.mode='title';__bite.enterLake()});
await step(0.3);
ok(await ev(()=>__bite.G.mode==='ice'&&__bite.G.iceOut===true),'hard water in January');
// the winter roster: the warm-water fish are torpid, the perch kings are not
const rost=await ev(()=>{const w={},s={};
  __bite.DBG.month=1; for(const c of __bite.candidates('drop',{type:'worm'},1))w[c.f.sp]=1;
  __bite.DBG.month=6; for(const c of __bite.candidates('drop',{type:'worm'}))s[c.f.sp]=1;
  __bite.DBG.month=1; return {w:Object.keys(w),s:Object.keys(s)}});
ok(rost.w.includes('perch')&&!rost.w.includes('largemouth')&&!rost.w.includes('carp')
   &&rost.s.includes('largemouth'),'winter roster: perch in, bass and carp torpid ('+rost.w.length+' of '+rost.s.length+')');
// drill, jig, and the whole summer pipeline through a hole
const iceRun=await ev(()=>{const h=__bite.drill(880,330); __bite.jig(h);
  let g=0; while(__bite.G.line&&!__bite.G.line.script&&g++<200)__bite.step(.05);
  return {holes:__bite.G.ice.holes.length,ice:__bite.G.line&&__bite.G.line.ice,
          evs:__bite.G.line&&__bite.G.line.script?__bite.G.line.script.length:0}});
ok(iceRun.holes===1&&iceRun.ice===1&&iceRun.evs>0,'drilled a hole and jigged it ('+iceRun.evs+' events)');
const iceLand=await ev(()=>{__bite.hookNow('perch');__bite.surface();__bite.net();
  const card=__bite.G.card&&__bite.G.card.sp; __bite.dismiss();
  return {card:card,back:__bite.G.mode}});
// ⚠️ the release must return you to the ICE, not to open summer water
ok(iceLand.card==='perch'&&iceLand.back==='ice','landed through the ice and released back onto it');
const tip=await ev(()=>{const h=__bite.G.ice.holes[0]; __bite.tipup(h);
  const p=__bite.popFlag(h); return {p:p,mode:__bite.runTip(h),sp:__bite.G.fight&&__bite.G.fight.sp}});
ok(/flagged/.test(tip.p)&&tip.mode==='fight','the tip-up flags and hands you the fish ('+tip.sp+')');
await shot('15b-ice');
await ev(()=>{__bite.DBG.month=7;__bite.DBG.day=null;__bite.G.iceOut=false;__bite.G.ice=null;
  __bite.G.fight=null;__bite.G.line=null;__bite.enter()});
// ⚠️ markSave() only flags dirty; the real write is on a 2s timer (saveTimer), so a
// short settle silently loses the last cast and the reload test blames the save code.
for(let i=0;i<8;i++)await step(0.4);

console.log('== save round-trip ==');
const before=await ev(()=>({casts:__bite.save().casts,j:Object.keys(__bite.save().journal).length,
  released:__bite.save().released,pop0:__bite.save().pop[0].b,mayor:__bite.save().mayor.landed,seed:__bite.save().lakeSeed}));
await page.reload(); await page.waitForTimeout(500);
const after=await ev(()=>({casts:__bite.save().casts,j:Object.keys(__bite.save().journal).length,
  released:__bite.save().released,pop0:__bite.save().pop[0].b,mayor:__bite.save().mayor.landed,seed:__bite.save().lakeSeed}));
const drift=Object.keys(before).filter(k=>before[k]!==after[k])
  .map(k=>k+': '+before[k]+'→'+after[k]).join(', ');
ok(!drift,'save survives reload ('+after.casts+' casts, '+after.j+' species, mayor='+after.mayor+')'
  +(drift?' — DRIFT '+drift:''));

console.log('== real-pointer smoke test ==');
await page.goto(url); await page.waitForTimeout(600);
const geo=await ev(()=>{const r=document.getElementById('c').getBoundingClientRect();return {l:r.left,t:r.top,vs:r.width/960}});
const P=(x,y)=>({x:geo.l+x*geo.vs,y:geo.t+y*geo.vs});
let pt=P(480,297); await page.mouse.click(pt.x,pt.y); // "open the box"
await page.waitForTimeout(300);
ok(await ev(()=>__bite.G.mode==='lake'),'title button works with a real mouse');
const c0=await ev(()=>__bite.save().casts);
// ⚠️ AIM LOW ON PURPOSE. The bobber's y used to be a HASH OF ITS X (`(wx%37)/37`),
// so it ignored the aim entirely and every cast at a given x landed at the same
// depth — aiming at the near bank missed by ~160px. Assert it lands where we aimed.
const AIMY=430;
pt=P(300,AIMY); await page.mouse.move(pt.x,pt.y); await page.mouse.down();
await page.waitForTimeout(140); await page.mouse.up(); await page.waitForTimeout(800);
const castRes=await ev(a=>({casts:__bite.save().casts,by:__bite.G.line?__bite.G.line.by:null,aim:a}),AIMY);
ok(castRes.casts===c0+1,'a real mouse cast lands in the water');
ok(castRes.by!==null&&Math.abs(castRes.by-AIMY)<=6,
   'the bobber lands where you aimed (aim '+AIMY+' → '+castRes.by+')');
pt=P(856,26); await page.mouse.click(pt.x,pt.y); // the box button
await page.waitForTimeout(250);
ok(await ev(()=>__bite.G.overlay==='box'),'tackle box opens via real click');
pt=P(872,311); await page.mouse.click(pt.x,pt.y); // close
await page.waitForTimeout(250);
ok(await ev(()=>!__bite.G.overlay),'and closes');

console.log('== probe ==');
await page.goto(url+'?probe=1'); await page.waitForTimeout(700);
const probe=await ev(()=>document.getElementById('probe').textContent);
ok(probe.includes('heat by spot'),'probe runs');
fs.writeFileSync(path.join(dir,'probe.txt'),probe);

console.log('== console errors ==');
const gameErrs=await ev(()=>window.__bite?__bite.errors:['no qa']);
ok(errors.length===0&&gameErrs.length===0,'zero console errors'+(errors.length?' — '+errors.slice(0,4).join(' | '):''));
if(errors.length)console.log(errors.slice(0,10).join('\n'));

await browser.close();
console.log('\nRESULT: '+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
