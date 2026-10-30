/* The supplied MUON lettering is clipped into pieces, never re-typeset. */
(() => {
  'use strict';
  const root=document.documentElement,scene=document.getElementById('brand-intro'),stage=scene.querySelector('.intro-logo-stage'),visuals=scene.querySelector('.intro-visuals'),letters=[...scene.querySelectorAll('.intro-letter')],dot=scene.querySelector('.intro-dot'),skip=scene.querySelector('.intro-skip'),header=document.querySelector('.nav .wordmark');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let animations=[],token=0,active=false,raf=0,oldFocus=null;
  function moon(progress){window.dispatchEvent(new CustomEvent('muon:intro',{detail:{progress}}));}
  function finish(){token++;active=false;cancelAnimationFrame(raf);animations.forEach(a=>a.cancel());animations=[];root.classList.remove('intro-running','intro-docking');root.classList.add('intro-complete');scene.inert=true;scene.setAttribute('aria-hidden','true');document.querySelector('main').inert=false;document.querySelector('.nav').inert=false;document.querySelector('footer').inert=false;moon(1);document.querySelector("main").setAttribute("tabindex","-1");document.querySelector("main").focus({preventScroll:true});}
  function animate(el,frames,options){const animation=el.animate(frames,{fill:'both',...options});animations.push(animation);return animation;}
  async function play(){
    const mine=++token;active=true;oldFocus=document.activeElement;
    animations.forEach(a=>a.cancel());animations=[];cancelAnimationFrame(raf);
    root.classList.remove('intro-complete','intro-docking');root.classList.add('intro-running');scene.inert=false;scene.removeAttribute('aria-hidden');document.querySelector('main').inert=true;document.querySelector('.nav').inert=true;document.querySelector('footer').inert=true;
    stage.removeAttribute('style');moon(0);window.scrollTo({top:0,left:0,behavior:'instant'});skip.focus({preventScroll:true});
    if(reduced.matches){finish();return;}
    const asset=new Image();asset.src='assets/muon.jpg';await Promise.race([asset.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1200))]);if(mine!==token)return;
    animate(visuals,[{opacity:0,transform:'translateY(15px) scale(.55)'},{opacity:1,transform:'translateY(0) scale(1.025)',offset:.82},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:1050,easing:'cubic-bezier(.16,1,.3,1)'});
    letters.forEach((letter,i)=>{
      const tilt=i%2?3:-3;
      animate(letter,[
        {opacity:0,transform:`translateY(-285px) rotate(${tilt}deg)`,offset:0,easing:'cubic-bezier(.55,.02,.85,.5)'},
        {opacity:1,transform:`translateY(-245px) rotate(${tilt}deg)`,offset:.12,easing:'cubic-bezier(.5,0,.85,.45)'},
        {opacity:1,transform:'translateY(2px) rotate(0deg)',offset:.64,easing:'cubic-bezier(.18,.8,.25,1)'},
        {opacity:1,transform:'translateY(-6px) rotate(0deg)',offset:.79,easing:'cubic-bezier(.5,0,.8,.5)'},
        {opacity:1,transform:'translateY(0) rotate(0deg)',offset:1}
      ],{delay:1150+i*850,duration:800,easing:'linear'});
      animate(scene.querySelector('.intro-floor'),[{opacity:0,transform:'scaleX(.4)'},{opacity:.5,transform:'scaleX(1)',offset:.2},{opacity:0,transform:'scaleX(1.2)'}],{delay:1150+i*850+500,duration:500});
    });
    const dotFall=animate(dot,[
      {opacity:0,transform:'translateY(-190px) scale(.65)',offset:0},
      {opacity:1,transform:'translateY(-150px) scale(.8)',offset:.18},
      {opacity:1,transform:'translateY(-30px) scale(1)',offset:.74},
      {opacity:1,transform:'translateY(1px) scale(.96)',offset:.94},
      {opacity:1,transform:'translateY(0) scale(1)',offset:1}
    ],{delay:4700,duration:1550,easing:'cubic-bezier(.28,.12,.22,1)'});
    try{await dotFall.finished;}catch(_){return;}if(mine!==token)return;
    await new Promise(resolve=>setTimeout(resolve,350));if(mine!==token)return;
    root.classList.add('intro-docking');
    const from=stage.getBoundingClientRect(),to=header.getBoundingClientRect();
    stage.style.left=from.left+'px';stage.style.top=from.top+'px';stage.style.width=from.width+'px';stage.style.height=from.height+'px';stage.style.transform='none';stage.style.transformOrigin='0 0';
    const dock=animate(stage,[{transform:'translate3d(0,0,0) scale(1,1)'},{transform:`translate3d(${to.left-from.left}px,${to.top-from.top}px,0) scale(${to.width/from.width},${to.height/from.height})`}],{duration:1150,easing:'cubic-bezier(.65,0,.2,1)'});
    const start=performance.now();function shift(time){if(mine!==token)return;const p=Math.min(1,(time-start)/1150),e=p*p*(3-2*p);moon(e);if(p<1)raf=requestAnimationFrame(shift);}raf=requestAnimationFrame(shift);
    try{await dock.finished;}catch(_){return;}if(mine===token)finish();
  }
  skip.addEventListener('click',finish);
  document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();finish();}else if(e.key==='Tab'){e.preventDefault();skip.focus();}});
  document.querySelector('.intro-replay').addEventListener('click',play);
  window.addEventListener('resize',()=>{if(active)finish();},{passive:true});
  window.addEventListener('pagehide',()=>{if(active)finish();});
  reduced.addEventListener('change',()=>{if(reduced.matches&&active)finish();});
  // Animation failure can never leave the public site locked.
  setTimeout(()=>{if(active)finish();},11500);
  play().catch(finish);
})();
