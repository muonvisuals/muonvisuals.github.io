'use strict';
document.getElementById('year').textContent=new Date().getFullYear();
const services=document.querySelectorAll('.services details');
services.forEach(item=>item.addEventListener('toggle',()=>{if(item.open)services.forEach(other=>{if(other!==item)other.open=false;});}));
const quoteForm=document.getElementById('quote-form'),emailField=document.getElementById('quote-email'),projectFields=document.querySelector('.project-fields'),projectFieldset=document.getElementById('project-fields');
document.querySelectorAll('.quote-trigger').forEach(button=>button.addEventListener('click',()=>{document.getElementById('contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
let revealTimer=0;
function revealProject(){if(!emailField.value.trim()||!emailField.validity.valid||!projectFields.hidden)return;projectFields.hidden=false;projectFieldset.disabled=false;document.getElementById('quote-hint').textContent='Now, tell us about your idea.';if(!matchMedia('(prefers-reduced-motion: reduce)').matches){projectFields.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});projectFields.querySelectorAll('.question-block,.submit-row').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:i*90,fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'}));}measure();}
emailField.addEventListener('input',()=>{clearTimeout(revealTimer);revealTimer=setTimeout(revealProject,350);});emailField.addEventListener('change',revealProject);emailField.addEventListener('blur',revealProject);window.addEventListener('pageshow',revealProject);
quoteForm.addEventListener('change',()=>{if(quoteForm.querySelector('[name="services"]:checked'))document.getElementById('service-error').textContent='';});
quoteForm.addEventListener('submit',event=>{event.preventDefault();revealProject();if(!quoteForm.reportValidity())return;const values=new FormData(quoteForm),selected=values.getAll('services');if(!selected.length){document.getElementById('service-error').textContent='Please choose at least one service.';quoteForm.querySelector('[name="services"]').focus();return;}const body=`Hello MUON VISUALS,\n\nI would like to request a quote.\n\nName: ${String(values.get('name')).trim()}\nPhone: ${String(values.get('phone')).trim()}\nEmail: ${String(values.get('email')).trim()}\n\nBrief: ${String(values.get('brief')).trim()}\n\nServices: ${selected.join(', ')}\nBudget: ${values.get('budget')}\nHeard about you: ${values.get('source')}\n`;const href='mailto:hello.muonvisuals@outlook.com?subject='+encodeURIComponent('Quote enquiry — MUON VISUALS')+'&body='+encodeURIComponent(body);quoteForm.querySelector('.form-status').textContent='Your enquiry is ready in your email app. Please send it there to complete your submission.';window.location.href=href;});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const world=document.querySelector('.world-section'),track=document.querySelector('.world-track'),pin=document.querySelector('.world-pin'),bridge=document.querySelector('.bridge'),moon=document.querySelector('.moon-world'),meter=document.querySelector('.world-progress i'),counter=document.querySelector('.world-counter');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
let smoothY=window.scrollY,lastTime=0,raf=0,worldTop=0,worldRange=1,travel=0,bridgeTop=0,bridgeRange=1;
function measure(){worldTop=world.offsetTop;worldRange=Math.max(1,world.offsetHeight-pin.clientHeight);travel=Math.max(0,track.scrollWidth-pin.clientWidth+innerWidth*.07);bridgeTop=bridge.offsetTop;bridgeRange=Math.max(1,bridge.offsetHeight-innerHeight);wake();}
function wake(){if(!raf)raf=requestAnimationFrame(frame);}
function frame(time){raf=0;const dt=Math.min(64,time-(lastTime||time-16));lastTime=time;const actual=window.scrollY;const contact=document.getElementById('contact');document.querySelector('.nav').classList.toggle('on-light',actual>=contact.offsetTop-85&&actual<contact.offsetTop+contact.offsetHeight-75);const factor=reducedMotion.matches?1:1-Math.exp(-dt/85);smoothY+=(actual-smoothY)*factor;if(Math.abs(actual-smoothY)<.15)smoothY=actual;const progress=clamp((smoothY-worldTop)/worldRange),bp=clamp((smoothY-bridgeTop)/bridgeRange);if(!reducedMotion.matches)track.style.transform=`translate3d(${-travel*progress}px,0,0)`;else track.style.transform='';meter.style.transform=`scaleX(${Math.max(.03,progress)})`;counter.textContent=`0${Math.min(3,Math.floor(progress*3)+1)} / 03`;document.documentElement.style.setProperty('--scroll',smoothY);document.documentElement.style.setProperty('--page-progress',actual/Math.max(1,document.documentElement.scrollHeight-innerHeight));document.documentElement.style.setProperty('--hero-progress',clamp(smoothY/innerHeight));bridge.style.setProperty('--bridge',bp);moon.style.opacity=String(1-clamp(smoothY/(innerHeight*.95))*.52);window.dispatchEvent(new CustomEvent('muon:motion',{detail:{scroll:reducedMotion.matches?0:smoothY}}));if(Math.abs(actual-smoothY)>.15)wake();}
window.addEventListener('scroll',wake,{passive:true});window.addEventListener('resize',measure,{passive:true});window.addEventListener('load',measure);reducedMotion.addEventListener('change',()=>{smoothY=scrollY;measure();});measure();
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
      sculpture.querySelectorAll('span').forEach((ring,i)=>ring.style.transform=`translateZ(${i*35+Math.sin(angle-i*.5)*7}px)`);
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
