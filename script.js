'use strict';
document.getElementById('year').textContent=new Date().getFullYear();
const services=document.querySelectorAll('.services details');
services.forEach(item=>item.addEventListener('toggle',()=>{if(item.open)services.forEach(other=>{if(other!==item)other.open=false;});}));
const quoteForm=document.getElementById('quote-form'),emailField=document.getElementById('quote-email'),projectFields=document.querySelector('.project-fields'),projectFieldset=document.getElementById('project-fields');
let quoteScroll=0;
document.querySelectorAll('.quote-trigger').forEach(button=>button.addEventListener('click',()=>{
  cancelAnimationFrame(quoteScroll);const target=document.getElementById('quote-start'),start=scrollY,destination=Math.max(0,target.getBoundingClientRect().top+scrollY-125),distance=destination-start;
  const duration=Math.min(1750,Math.max(900,Math.abs(distance)*.18)),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){scrollTo({top:destination,behavior:'instant'});target.focus({preventScroll:true});return;}
  const begin=performance.now();function step(now){const t=Math.min(1,(now-begin)/duration),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;scrollTo({top:start+distance*ease,behavior:'instant'});if(t<1)quoteScroll=requestAnimationFrame(step);else target.focus({preventScroll:true});}quoteScroll=requestAnimationFrame(step);
}));
['wheel','touchstart'].forEach(type=>window.addEventListener(type,()=>cancelAnimationFrame(quoteScroll),{passive:true}));
let revealTimer=0;
function revealProject(){if(!emailField.value.trim()||!emailField.validity.valid||!projectFields.hidden)return;projectFields.hidden=false;projectFieldset.disabled=false;document.getElementById('quote-hint').textContent='Now, tell us about your idea.';if(!matchMedia('(prefers-reduced-motion: reduce)').matches){projectFields.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});projectFields.querySelectorAll('.question-block,.submit-row').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:i*90,fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'}));}measure();}
emailField.addEventListener('input',()=>{clearTimeout(revealTimer);revealTimer=setTimeout(revealProject,350);});emailField.addEventListener('change',revealProject);emailField.addEventListener('blur',revealProject);window.addEventListener('pageshow',revealProject);
quoteForm.addEventListener('change',()=>{if(quoteForm.querySelector('[name="services"]:checked'))document.getElementById('service-error').textContent='';});
quoteForm.addEventListener('submit',async event=>{
 event.preventDefault();revealProject();if(!quoteForm.reportValidity())return;
 const values=new FormData(quoteForm),selected=values.getAll('services'),status=quoteForm.querySelector('.form-status'),button=quoteForm.querySelector('[type="submit"]');
 if(!selected.length){document.getElementById('service-error').textContent='Please choose at least one service.';quoteForm.querySelector('[name="services"]').focus();return;}
 const config=window.MUON_ENQUIRY||{};
 if(!config.url||!config.publishableKey){status.textContent='Online enquiries are not available yet. Please contact hello.muonvisuals@outlook.com. Your details have not been submitted.';status.dataset.state='error';return;}
 button.disabled=true;button.querySelector('span').textContent='Submitting';status.textContent='';
 try{
  const response=await fetch(config.url.replace(/\/$/,'')+'/rest/v1/rpc/submit_enquiry',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey},body:JSON.stringify({p_name:String(values.get('name')).trim(),p_phone:String(values.get('phone')).trim(),p_email:String(values.get('email')).trim(),p_brief:String(values.get('brief')).trim(),p_services:selected,p_budget:values.get('budget'),p_source:values.get('source')})});
  if(!response.ok)throw new Error('Enquiry could not be saved');const receipt=await response.json();if(!receipt)throw new Error('No submission receipt');
  status.dataset.state='success';status.textContent='Thank you. Your enquiry has been received. We’ll be in touch.';quoteForm.reset();projectFields.hidden=true;projectFieldset.disabled=true;document.getElementById('quote-hint').textContent='Enter your email to tell us more about your project.';status.scrollIntoView({behavior:'smooth',block:'center'});measure();
 }catch(error){status.dataset.state='error';status.textContent='We couldn’t submit your enquiry. Your details are still here. Please try again or email hello.muonvisuals@outlook.com.';}
 finally{button.disabled=false;button.querySelector('span').textContent='Submit form';}
});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const world=document.querySelector('.world-section'),track=document.querySelector('.world-track'),pin=document.querySelector('.world-pin'),bridge=document.querySelector('.bridge'),moon=document.querySelector('.moon-world'),meter=document.querySelector('.world-progress i'),counter=document.querySelector('.world-counter');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const orbitCards=[...track.querySelectorAll('.world-card')];
let smoothY=window.scrollY,lastTime=0,raf=0,worldTop=0,worldRange=1,travel=0,bridgeTop=0,bridgeRange=1;
let cardOffsets=[];
function measure(){
  worldTop=world.offsetTop;
  worldRange=Math.max(1,world.offsetHeight-pin.clientHeight);
  // Measure the card centres, not the oversized width of the page.
  // The final card lands exactly where the first card began.
  cardOffsets=orbitCards.map(card=>card.offsetLeft-orbitCards[0].offsetLeft);
  travel=cardOffsets.at(-1)||0;
  bridgeTop=bridge.offsetTop;
  bridgeRange=Math.max(1,bridge.offsetHeight-innerHeight);
  wake();
}
function wake(){if(!raf){lastTime=0;raf=requestAnimationFrame(frame);}}
function frame(time){
  raf=0;
  const dt=lastTime?Math.min(64,time-lastTime):16;
  lastTime=time;
  const actual=window.scrollY;
  const factor=reducedMotion.matches?1:1-Math.exp(-dt/110);
  smoothY+=(actual-smoothY)*factor;
  if(Math.abs(actual-smoothY)<.1)smoothY=actual;
  const progress=clamp((smoothY-worldTop)/worldRange);
  const bp=clamp((smoothY-bridgeTop)/bridgeRange);
  const x=travel*progress;
  if(!reducedMotion.matches){
    track.style.transform=`translate3d(${-x}px,0,0)`;
    orbitCards.forEach((card,i)=>{
      const distance=(cardOffsets[i]-x)/Math.max(1,cardOffsets[1]||1);
      const edge=Math.min(1,Math.abs(distance));
      card.style.transform=`translate3d(0,${edge*6}px,0) rotate(${clamp(distance,-1,1)*-1}deg) scale(${1-edge*.02})`;
    });
  }else{
    track.style.transform='';
    orbitCards.forEach(card=>card.style.removeProperty('transform'));
  }
  meter.style.transform=`scaleX(${Math.max(.03,progress)})`;
  counter.textContent=`0${Math.round(progress*2)+1} / 03`;
  document.documentElement.style.setProperty('--scroll',smoothY);
  document.documentElement.style.setProperty('--page-progress',actual/Math.max(1,document.documentElement.scrollHeight-innerHeight));
  document.documentElement.style.setProperty('--hero-progress',clamp(smoothY/innerHeight));
  bridge.style.setProperty('--bridge',bp);
  // Keep the lunar surface bright throughout the gallery.
  moon.style.opacity=String(1-clamp(smoothY/innerHeight)*.1-clamp((smoothY-bridgeTop)/innerHeight)*.42);
  window.dispatchEvent(new CustomEvent('muon:motion',{detail:{scroll:reducedMotion.matches?0:smoothY}}));
  if(Math.abs(actual-smoothY)>.1)raf=requestAnimationFrame(frame);
}
window.addEventListener('scroll',wake,{passive:true});
window.addEventListener('resize',measure,{passive:true});
window.addEventListener('load',measure);
if(document.fonts)document.fonts.ready.then(measure);
reducedMotion.addEventListener('change',()=>{smoothY=scrollY;measure();});
measure();
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});
document.querySelectorAll('.section-heading,.services details,.studio-layout>div:last-child,.steps article,.contact h2,.contact .button,.section-label').forEach((node,i)=>{node.classList.add('reveal');node.style.setProperty('--reveal-delay',`${(i%3)*65}ms`);revealObserver.observe(node);});

// Shared live artwork renderer for desktop and touch browsers. Motion is also
// tied to native scroll, so the artwork responds during a finger gesture.
(() => {
  const cards=[...document.querySelectorAll('.card-art')];
  const live=new Set();let request=0,last=0,clock=0;
  const sculpture=document.querySelector('.sculpture');
  const screen=document.querySelector('.glass-screen');
  const ringA=document.querySelector('.ring-a'),ringB=document.querySelector('.ring-b');
  const core=document.querySelector('.particle-core');
  const animated=[sculpture,screen,ringA,ringB];
  animated.forEach(el=>el.classList.add('live-art'));
  function wakeArt(){if(!request&&!document.hidden&&!reducedMotion.matches&&live.size)request=requestAnimationFrame(render);}
  function render(time){
    request=0;if(document.hidden||reducedMotion.matches||!live.size){last=0;return;}
    clock+=last?Math.min(time-last,50):16;last=time;
    const phase=clock/1000,scroll=window.scrollY;
    if(live.has(cards[0])){
      const angle=phase*.62+scroll*.002;
      sculpture.style.transform=`rotateX(${51+Math.sin(angle)*10}deg) rotateY(${Math.sin(angle*.7)*12}deg) rotateZ(${-22+Math.sin(angle*.8)*32}deg)`;
      sculpture.querySelectorAll('span').forEach((ring,i)=>ring.style.transform=`translateZ(${i*24+Math.sin(angle-i*.5)*5}px)`);
    }
    if(live.has(cards[1])){
      const angle=phase*.75+scroll*.002;
      screen.style.transform=`translate3d(0,${Math.sin(angle)*10}px,0) rotateY(${-17+Math.sin(angle)*11}deg) rotateX(${9+Math.cos(angle*.8)*7}deg) rotateZ(${-5+Math.sin(angle*.7)*4}deg)`;
    }
    if(live.has(cards[2])){
      const turn=phase*24+scroll*.035;
      ringA.style.transform=`rotateX(66deg) rotateZ(${-20+turn}deg)`;
      ringB.style.transform=`rotateY(65deg) rotateZ(${30-turn*.73}deg)`;
      core.style.transform=`scale(${1+Math.sin(phase*1.4)*.045})`;
    }
    wakeArt();
  }
  const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?live.add(e.target):live.delete(e.target));if(!live.size){cancelAnimationFrame(request);request=0;last=0;}wakeArt();},{threshold:.01});
  cards.forEach(card=>observer.observe(card));
  window.addEventListener('scroll',wakeArt,{passive:true});
  document.addEventListener('visibilitychange',()=>{last=0;wakeArt();});
  window.addEventListener('pageshow',wakeArt);
  reducedMotion.addEventListener('change',()=>{animated.forEach(el=>el.style.removeProperty('transform'));core.style.removeProperty('transform');last=0;wakeArt();});
})();
