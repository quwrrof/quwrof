
(function () {
  const canvas = document.getElementById("sea");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
 
  // If WebGL is unavailable, the CSS gradient fallback on <body> remains visible.
  if (!gl) { canvas.style.display = "none"; return; }
 
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 
  const vertSrc = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;
 
  const fragSrc = `
    precision highp float;
    uniform vec2  uRes;
    uniform float uTime;
    uniform float uMotion; // 1.0 normal, ~0.12 reduced
 
    float hash(vec2 p){
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      float a = hash(i), b = hash(i + vec2(1.0,0.0));
      float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
      vec2 u = f*f*(3.0 - 2.0*f);
      return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
    }
 
    void main(){
      vec2 uv = gl_FragCoord.xy / uRes.xy;
      float aspect = uRes.x / uRes.y;
      float t = uTime;
 
// --- All-blue palette ---
vec3 deep    = vec3(0.243, 0.573, 0.925); // medium blue
vec3 mid     = vec3(0.478, 0.741, 0.988); // light sky blue
vec3 shallow = vec3(0.741, 0.878, 1.000); // pale blue (horizon)
vec3 skyGlow = vec3(0.850, 0.940, 1.000); // pale blue-white light
vec3 glint   = vec3(1.000, 1.000, 1.000); // white glitter
 
      // --- Base vertical gradient (top = near horizon/lighter) ---
      vec3 water = mix(deep, mid, smoothstep(0.0, 0.72, uv.y));
      water = mix(water, shallow, smoothstep(0.5, 1.0, uv.y) * 0.45);
 
      // --- Gentle swells: layered scrolling waves modulate brightness ---
      float swell = 0.0;
      swell += sin(uv.x*6.0  + t*0.55 + noise(uv*3.0 + t*0.08)*2.2) * 0.5;
      swell += sin(uv.x*11.0 - t*0.40 + uv.y*4.0) * 0.25;
      swell += noise(uv*vec2(9.0, 22.0) + vec2(t*0.12, 0.0)) * 0.55;
      water += swell * 0.05 * vec3(0.55, 0.90, 1.0);
 
      // --- Sun-glitter path: narrow near horizon, widening toward viewer ---
      float dx = uv.x - 0.5;
      float width = mix(0.05, 0.55, 1.0 - uv.y);
      float path = exp(-(dx*dx) / (width*width));
      path *= smoothstep(0.0, 0.28, uv.y);      // fade the streak near bottom edge
      water += skyGlow * path * 0.09 * (0.6 + 0.4*sin(t*0.5));
 
      // --- Twinkling specular sparkles (the glitter itself) ---
      float sparkle = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float scale = 58.0 + fi*46.0;
        vec2 g = uv * vec2(scale*aspect, scale*1.5);
        g += vec2(t*(0.25 + fi*0.09), t*(0.12 + fi*0.04)) * uMotion;
        vec2 cell = floor(g);
        float rnd = hash(cell + fi*13.7);
        if (rnd > 0.855) {
          float phase = hash(cell + fi*7.1) * 6.2831;
          float tw = 0.5 + 0.5*sin(t*(2.6 + rnd*4.0)*uMotion + phase);
          tw = pow(tw, 26.0);                    // sharp, brief flashes
          sparkle += tw * (0.6 + 0.4*rnd);
        }
      }
      water += glint * sparkle * path * 1.5;
 
      // --- Soft vignette to settle the edges ---
      float vig = smoothstep(1.25, 0.35, length(uv - 0.5));
      water *= mix(0.86, 1.0, vig);
 
      gl_FragColor = vec4(water, 1.0);
    }
  `;
 
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
 
  const vs = compile(gl.VERTEX_SHADER, vertSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) { canvas.style.display = "none"; return; }
 
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);
 
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
 
  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uMotion = gl.getUniformLocation(prog, "uMotion");
 
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }
  window.addEventListener("resize", resize);
  resize();
 
  gl.uniform1f(uMotion, reduceMotion ? 0.12 : 1.0);
 
  const start = performance.now();
  const timeScale = reduceMotion ? 0.25 : 1.0;
 
  function frame(now) {
    gl.uniform1f(uTime, ((now - start) / 1000) * timeScale);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
