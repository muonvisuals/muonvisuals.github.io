/* Analytic 3D sphere, terrain bump lighting and scroll-driven axial rotation.
   No engine or third-party runtime. The fallback remains visible without WebGL. */
(() => {
  'use strict';
  const canvas = document.getElementById('moon-canvas');
  const gl = canvas.getContext('webgl', {alpha:true, antialias:false, powerPreference:'low-power'});
  if (!gl) { softwareMoon(); return; }

  // A software sphere projection keeps the same scroll-driven moon available
  // on browsers without WebGL. It renders only when scroll or size changes.
  function softwareMoon(){
    const view=document.createElement('canvas');canvas.replaceWith(view);view.id='moon-canvas';
    const ctx=view.getContext('2d');if(!ctx)return;
    const sphere=document.createElement('canvas');const side=640;sphere.width=sphere.height=side;
    const out=sphere.getContext('2d');const frame=out.createImageData(side,side);
    const us=new Float32Array(side*side),vs=new Uint16Array(side*side),lights=new Float32Array(side*side),edges=new Uint8Array(side*side),nx=new Float32Array(side*side);
    for(let y=0;y<side;y++)for(let x=0;x<side;x++){
      const i=y*side+x,qx=(x+.5)/side*2-1,qy=1-(y+.5)/side*2,rr=qx*qx+qy*qy;
      if(rr>=1)continue;const z=Math.sqrt(1-rr);
      us[i]=Math.atan2(z,qx)/(2*Math.PI)+.5;vs[i]=Math.round((Math.asin(qy)/Math.PI+.5)*1023);nx[i]=qx;
      lights[i]=Math.max(0,(qx*1.5+qy*.8+z*.85)/1.9);
      edges[i]=Math.round(Math.min(1,(1-rr)*side/2)*255);
    }
    let pixels=null,lastDraw=0,pending=0,requested=0;
    function draw(scroll){requested=scroll;const now=performance.now();if(now-lastDraw<40){if(!pending)pending=setTimeout(()=>{pending=0;draw(requested);},40);return;}lastDraw=now;if(!pixels)return;
      const rot=.4+scroll*.0012,shift=rot/(2*Math.PI)*2048,d=frame.data;
      for(let i=0;i<us.length;i++){if(!edges[i])continue;const tx=((Math.floor(us[i]*2048+shift)%2048)+2048)%2048,ty=vs[i],idx=(ty*2048+tx)*4,h=pixels[idx]/255;
        const left=pixels[(ty*2048+(tx+2047)%2048)*4]/255,right=pixels[(ty*2048+(tx+1)%2048)*4]/255;
        const relief=(left-right)*.65;const diffuse=Math.max(0,lights[i]+relief);
        const light=.035+diffuse*.98,base=(.38+h*.62)*light;const k=i*4;
        d[k]=Math.min(255,(.46+.42*h)*base*255);d[k+1]=Math.min(255,(.49+.42*h)*base*255);d[k+2]=Math.min(255,(.54+.42*h)*base*255);d[k+3]=edges[i];
      }
      out.putImageData(frame,0,0);const ratio=Math.min(devicePixelRatio||1,1.25),w=Math.round(innerWidth*ratio),h=Math.round(innerHeight*ratio);
      if(view.width!==w||view.height!==h){view.width=w;view.height=h;}ctx.clearRect(0,0,w,h);
      const mobile=innerWidth/innerHeight<.85,p=Math.min(1,scroll/innerHeight),radius=(mobile?.72:.83)*(1-p*.1)*h/2;
      const cx=mobile?w/2+.025*h-p*.03*h:w*.70-p*.075*h,cy=mobile?h*.75:h*.515;
      ctx.drawImage(sphere,cx-radius,cy-radius,radius*2,radius*2);
    }
    const texture=new Image();texture.onload=()=>{const t=document.createElement('canvas');t.width=2048;t.height=1024;const tc=t.getContext('2d');tc.drawImage(texture,0,0,2048,1024);pixels=tc.getImageData(0,0,2048,1024).data;draw(scrollY);view.parentElement.classList.add('moon-ready');};texture.src='assets/lunar-surface.jpg';
    window.addEventListener('muon:motion',e=>draw(e.detail.scroll));window.addEventListener('resize',()=>draw(requested),{passive:true});
  }

  const vertex = `attribute vec2 position;varying vec2 screen;void main(){screen=position;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision highp float;
  varying vec2 screen;uniform vec2 resolution;uniform float rotation;uniform float progress;uniform sampler2D surface;
  const float PI=3.14159265359;
  vec2 uvAt(vec3 p){return vec2(atan(p.z,p.x)/(2.*PI)+.5,asin(clamp(p.y,-1.,1.))/PI+.5);}
  mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
  float heightAt(vec3 p){return texture2D(surface,uvAt(normalize(p))).r;}
  void main(){
    float aspect=resolution.x/resolution.y;
    bool mobile=aspect<.85;
    vec2 p=screen; p.x*=aspect;
    vec2 center=mobile?vec2(.05,-.50):vec2(aspect*.40,-.03);
    center.x-=min(progress,1.)*(mobile?.06:.15);
    float radius=mobile?.72:.83;
    radius*=1.-min(progress,1.)*.10;
    vec2 q=(p-center)/radius;float rr=dot(q,q);
    if(rr>1.){gl_FragColor=vec4(0.);return;}
    vec3 n=vec3(q,sqrt(max(0.,1.-rr)));mat3 r=rotY(rotation);
    vec3 local=r*n;float h=heightAt(local);
    vec3 tangent=normalize(cross(local,vec3(0.,1.,.01)));vec3 bitangent=cross(local,tangent);
    float a=heightAt(local+tangent*.0025)-heightAt(local-tangent*.0025);
    float b=heightAt(local+bitangent*.0025)-heightAt(local-bitangent*.0025);
    vec3 bump=normalize(local-tangent*a*.8-bitangent*b*.8);
    vec3 light=r*normalize(vec3(1.5,.8,.85));
    float diffuse=max(0.,dot(bump,light));
    float terminator=smoothstep(-.09,.22,dot(local,light));
    float albedo=.38+h*.62;
    vec3 stone=mix(vec3(.46,.49,.54),vec3(.88,.91,.96),h);
    vec3 color=stone*albedo*(.035+diffuse*.98)*terminator;
    color+=stone*.006;
    float fresnel=pow(1.-n.z,5.);color+=vec3(.28,.37,.50)*fresnel*.18;
    float edge=1.-smoothstep(.994,1.,rr);
    gl_FragColor=vec4(color,edge);
  }`;
  function compile(type, source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Moon shader could not compile');return s;}
  let program;
  try {program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){softwareMoon();return;}} catch (_) {softwareMoon();return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const uResolution=gl.getUniformLocation(program,'resolution'),uRotation=gl.getUniformLocation(program,'rotation'),uProgress=gl.getUniformLocation(program,'progress');
  let ready=false,last=-1;const image=new Image();image.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true;canvas.parentElement.classList.add('moon-ready');draw(matchMedia('(prefers-reduced-motion: reduce)').matches?0:window.scrollY);};image.src='assets/lunar-surface.jpg';
  function size(){const dpr=Math.min(window.devicePixelRatio||1,1.5),w=Math.round(innerWidth*dpr),h=Math.round(innerHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);last=-1;}}
  function draw(scroll){if(!ready)return;size();if(Math.abs(scroll-last)<.05)return;last=scroll;gl.uniform2f(uResolution,canvas.width,canvas.height);gl.uniform1f(uRotation,.4+scroll*.0012);gl.uniform1f(uProgress,scroll/innerHeight);gl.drawArrays(gl.TRIANGLES,0,6);}
  window.addEventListener('muon:motion',event=>draw(event.detail.scroll));
  window.addEventListener('resize',()=>{last=-1;draw(window.scrollY);},{passive:true});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;canvas.parentElement.classList.remove('moon-ready');});
})();
