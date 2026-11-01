'use strict';
document.getElementById('year').textContent=new Date().getFullYear();
const services=document.querySelectorAll('.services details');
services.forEach(item=>item.addEventListener('toggle',()=>{if(item.open)services.forEach(other=>{if(other!==item)other.open=false;});}));
const dialog=document.getElementById('quote-dialog');let quoteOpener=null;
document.querySelectorAll('.quote-trigger').forEach(button=>button.addEventListener('click',()=>{quoteOpener=button;dialog.showModal();document.documentElement.classList.add('dialog-open');}));
dialog.querySelector('.quote-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.documentElement.classList.remove('dialog-open');if(quoteOpener)quoteOpener.focus({preventScroll:true});});
document.getElementById('quote-form').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const values=new FormData(form);const body=`Hello MUON VISUALS,\n\nI would like to request a quote.\n\nName: ${String(values.get('name')).trim()}\nPhone: ${String(values.get('phone')).trim()}\nEmail: ${String(values.get('email')).trim()}\n\nProject details:\n`;const href='mailto:hello.muonvisuals@outlook.com?subject='+encodeURIComponent('Quote enquiry — MUON VISUALS')+'&body='+encodeURIComponent(body);form.querySelector('.form-status').textContent='Your email draft is ready. Please send it from your email app to complete your enquiry.';window.location.href=href;});
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const world=document.querySelector('.world-section'),track=document.querySelector('.world-track'),pin=document.querySelector('.world-pin'),bridge=document.querySelector('.bridge'),moon=document.querySelector('.moon-world'),meter=document.querySelector('.world-progress i'),counter=document.querySelector('.world-counter');
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
let smoothY=window.scrollY,lastTime=0,raf=0,worldTop=0,worldRange=1,travel=0,bridgeTop=0,bridgeRange=1;
function measure(){worldTop=world.offsetTop;worldRange=Math.max(1,world.offsetHeight-pin.clientHeight);travel=Math.max(0,track.scrollWidth-pin.clientWidth+innerWidth*.07);bridgeTop=bridge.offsetTop;bridgeRange=Math.max(1,bridge.offsetHeight-innerHeight);wake();}
function wake(){if(!raf)raf=requestAnimationFrame(frame);}
function frame(time){raf=0;const dt=Math.min(64,time-(lastTime||time-16));lastTime=time;const actual=window.scrollY;const factor=reducedMotion.matches?1:1-Math.exp(-dt/85);smoothY+=(actual-smoothY)*factor;if(Math.abs(actual-smoothY)<.15)smoothY=actual;const progress=clamp((smoothY-worldTop)/worldRange),bp=clamp((smoothY-bridgeTop)/bridgeRange);if(!reducedMotion.matches)track.style.transform=`translate3d(${-travel*progress}px,0,0)`;else track.style.transform='';meter.style.transform=`scaleX(${Math.max(.03,progress)})`;counter.textContent=`0${Math.min(3,Math.floor(progress*3)+1)} / 03`;document.documentElement.style.setProperty('--scroll',smoothY);document.documentElement.style.setProperty('--page-progress',actual/Math.max(1,document.documentElement.scrollHeight-innerHeight));document.documentElement.style.setProperty('--hero-progress',clamp(smoothY/innerHeight));bridge.style.setProperty('--bridge',bp);moon.style.opacity=String(1-clamp(smoothY/(innerHeight*.95))*.52);window.dispatchEvent(new CustomEvent('muon:motion',{detail:{scroll:reducedMotion.matches?0:smoothY}}));if(Math.abs(actual-smoothY)>.15)wake();}
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
