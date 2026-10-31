import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/* ---------------------------------------------------------------------- */
/* Shaders                                                                 */
/* ---------------------------------------------------------------------- */
const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uMask;   // white text on black
uniform sampler2D uImage;  // the liquid texture that fills the letters
uniform sampler2D uFlow;   // mouse "flow map" (velocity encoded in rg, 0.5 = still)
uniform sampler2D uDot;    // the sphere that replaces the dot of the "i"

uniform vec2  uCover;      // UV scale so the image covers the canvas
uniform float uTime;
uniform float uStrength;
uniform float uReveal;
uniform float uIdle;
uniform vec3  uBg;

vec2 readFlow(vec2 uv) {
  vec2 f = texture2D(uFlow, uv).rg * 2.0 - 1.0;
  // dead-zone: 8-bit fading never reaches exactly 0.5, this hides the residue
  return sign(f) * max(abs(f) - 0.1, 0.0) / 0.9;
}

void main() {
  vec2 flow = readFlow(vUv);

  // cover-fit the image, slightly zoomed so displacement never shows edges
  vec2 uv = (vUv - 0.5) * uCover + 0.5;

  // slow idle drift so the fill is alive even without the mouse
  uv += uIdle * 0.03 * vec2(
    sin(uTime * 0.45 + vUv.y * 5.0 + vUv.x * 3.0),
    cos(uTime * 0.35 + vUv.x * 5.0)
  );

  // push along the mouse direction + a little swirl around it
  vec2 swirl = vec2(-flow.y, flow.x);
  vec2 d = (flow + swirl * 0.6) * uStrength;

  // tiny chromatic split gives the liquid / oil-slick look
  vec3 col;
  col.r = texture2D(uImage, uv - d * 1.07).r;
  col.g = texture2D(uImage, uv - d).g;
  col.b = texture2D(uImage, uv - d * 0.93).b;

  float m = texture2D(uMask, vUv).r * uReveal;
  vec3 result = mix(uBg, col, m);

  // sphere (it wobbles slightly with the flow)
  vec4 dot = texture2D(uDot, vUv - flow * 0.03);
  result = mix(result, dot.rgb, dot.a * uReveal);

  gl_FragColor = vec4(result, 1.0);
}`;

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const compile = (gl, type, src) => {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
  }
  return s;
};

// Colourful abstract fallback, used until / unless `image` loads.
const makeFallbackImage = () => {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#15153a";
  ctx.fillRect(0, 0, c.width, c.height);

  const blobs = [
    ["#1f3cff", 0.16, 0.45, 0.3],
    ["#e5381b", 0.46, 0.5, 0.32],
    ["#ff7a45", 0.62, 0.3, 0.22],
    ["#f6e8dc", 0.34, 0.66, 0.12],
    ["#0a0a1f", 0.82, 0.6, 0.32],
    ["#2aa8ff", 0.26, 0.2, 0.16],
    ["#7a1e9e", 0.04, 0.72, 0.22],
    ["#c42a14", 0.7, 0.75, 0.2],
    ["#35d0c4", 0.9, 0.25, 0.14],
  ];
  blobs.forEach(([color, x, y, r]) => {
    const g = ctx.createRadialGradient(x * c.width, y * c.height, 0, x * c.width, y * c.height, r * c.width);
    g.addColorStop(0, color);
    g.addColorStop(1, color + "00");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
  });

  // thin glossy streaks
  ctx.lineCap = "round";
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = ["#7fe9ff", "#ffffff", "#ffb08a", "#1a1a8c"][i % 4] + "99";
    ctx.lineWidth = 2 + (i % 5) * 3;
    ctx.beginPath();
    const y0 = (i / 26) * c.height;
    ctx.moveTo(-20, y0);
    ctx.bezierCurveTo(c.width * 0.3, y0 + 120 * Math.sin(i), c.width * 0.6, y0 - 140 * Math.cos(i * 1.3), c.width + 20, y0 + 60 * Math.sin(i * 2));
    ctx.stroke();
  }
  return c;
};

const LiquidText = ({
  text = "Works.",
  image, // url of the texture that fills the letters (optional)
  fontFamily = "Montserrat, Poppins, 'Helvetica Neue', Arial, sans-serif",
  fontWeight = 800,
  letterSpacing = -0.02, // in em
  fontSize = "20vw", // px
  sidePadding = 0.02, // fraction of width kept free on each side
  background = "#09090B",
  strength = 0.35, // how far the mouse drags the fill
  radius = 0.11, // size of the mouse brush (fraction of width)
  sphereDot = true, // replace the dot of the first "i" with a sphere
  idle = true, // slow ambient motion of the fill
  className = "",
}) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas) return;

      const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
      if (!gl) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let disposed = false;
      let visible = true;

      /* ---------- program ------------------------------------------- */
      const prog = gl.createProgram();
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const U = {};
      ["uMask", "uImage", "uFlow", "uDot", "uCover", "uTime", "uStrength", "uReveal", "uIdle", "uBg"].forEach(
        (n) => (U[n] = gl.getUniformLocation(prog, n))
      );
      gl.uniform1i(U.uMask, 0);
      gl.uniform1i(U.uImage, 1);
      gl.uniform1i(U.uFlow, 2);
      gl.uniform1i(U.uDot, 3);
      gl.uniform3fv(U.uBg, hexToRgb(background));
      gl.uniform1f(U.uStrength, strength);
      gl.uniform1f(U.uIdle, idle && !reduceMotion ? 1 : 0);

      /* ---------- textures ------------------------------------------ */
      const makeTex = (unit) => {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return t;
      };
      const upload = (unit, tex, source) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      };

      const texMask = makeTex(0);
      const texImage = makeTex(1);
      const texFlow = makeTex(2);
      const texDot = makeTex(3);

      let imgW = 1024;
      let imgH = 512;
      let canvasAspect = 3;

      const setCover = () => {
        const ia = imgW / imgH;
        const ca = canvasAspect;
        const zoom = 0.82;
        const cover = ca > ia ? [1 * zoom, (ia / ca) * zoom] : [(ca / ia) * zoom, 1 * zoom];
        gl.uniform2fv(U.uCover, cover);
      };

      const setImage = (source, w, h) => {
        imgW = w;
        imgH = h;
        upload(1, texImage, source);
        setCover();
      };

      setImage(makeFallbackImage(), 1024, 512);

      if (image) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => !disposed && setImage(img, img.naturalWidth, img.naturalHeight);
        img.src = image;
      }

      /* ---------- flow map (2D canvas, 128 = still) ------------------ */
      const flowCanvas = document.createElement("canvas");
      const fctx = flowCanvas.getContext("2d");
      let fw = 256;
      let fh = 86;

      const resetFlow = () => {
        fctx.fillStyle = "rgb(128,128,128)";
        fctx.fillRect(0, 0, fw, fh);
        upload(2, texFlow, flowCanvas);
      };

      /* ---------- text mask + sphere (rebuilt on resize) ------------- */
      const build = () => {
        const w = root.clientWidth;
        if (!w) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const probe = document.createElement("canvas").getContext("2d");
        const setFont = (ctx, px) => {
          ctx.font = `${fontWeight} ${px}px ${fontFamily}`;
          if ("letterSpacing" in ctx) ctx.letterSpacing = `${letterSpacing * px}px`;
        };

        const iIndex = sphereDot ? text.indexOf("i") : -1;
        const str = iIndex >= 0 ? text.slice(0, iIndex) + "ı" + text.slice(iIndex + 1) : text;

        setFont(probe, 100);
        const width100 = probe.measureText(str).width || 1;
        const calculatedSize = parseFloat(fontSize);
const unit = fontSize.replace(/[0-9.]/g, "");

const requestedSize =
  unit === "vw"
    ? (window.innerWidth * calculatedSize) / 100
    : unit === "vh"
    ? (window.innerHeight * calculatedSize) / 100
    : calculatedSize;

const fontPx = Math.min(
  requestedSize,
  ((w * (1 - sidePadding * 2)) / width100) * 100
);
        const h = Math.ceil(fontPx * 1.4);

        const W = Math.round(w * dpr);
        const H = Math.round(h * dpr);

        root.style.height = `${h}px`;
        canvas.width = W;
        canvas.height = H;
        gl.viewport(0, 0, W, H);
        canvasAspect = W / H;
        setCover();

        // mask
        const mc = document.createElement("canvas");
        mc.width = W;
        mc.height = H;
        const mctx = mc.getContext("2d");
        mctx.fillStyle = "#000";
        mctx.fillRect(0, 0, W, H);
        const px = fontPx * dpr;
        setFont(mctx, px);
        mctx.textBaseline = "alphabetic";
        const textW = mctx.measureText(str).width;
        const x = (W - textW) / 2;
        const baseline = px * 1.05;
        mctx.fillStyle = "#fff";
        mctx.fillText(str, x, baseline);
        upload(0, texMask, mc);

        // sphere that replaces the dot of the "i"
        const dc = document.createElement("canvas");
        dc.width = W;
        dc.height = H;
        if (iIndex >= 0) {
          const dctx = dc.getContext("2d");
          setFont(dctx, px);
          const preW = dctx.measureText(str.slice(0, iIndex)).width;
          const iW = dctx.measureText("ı").width;
          const xHeight = dctx.measureText("x").actualBoundingBoxAscent || px * 0.55;
          const r = px * 0.09;
          const cx = x + preW + iW / 2 + (letterSpacing * px) / -2;
          const cy = baseline - xHeight - r * 1.7;
          const g = dctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
          g.addColorStop(0, "#d9fffb");
          g.addColorStop(0.35, "#2fe0d2");
          g.addColorStop(1, "#0b6f86");
          dctx.fillStyle = g;
          dctx.beginPath();
          dctx.arc(cx, cy, r, 0, Math.PI * 2);
          dctx.fill();
        }
        upload(3, texDot, dc);

        // flow canvas matches the aspect ratio so the brush stays round
        fw = 256;
        fh = Math.max(16, Math.round((256 * H) / W));
        flowCanvas.width = fw;
        flowCanvas.height = fh;
        resetFlow();
      };

      /* ---------- pointer -> smoothed cursor (GSAP) ------------------ */
      const cursor = { x: 0.5, y: 0.5 };
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3.out" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3.out" });
      let prev = { x: cursor.x, y: cursor.y };
      let firstMove = true;

      const onMove = (e) => {
        const r = canvas.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        if (firstMove) {
          // jump straight to the entry point so there's no streak across the word
          cursor.x = prev.x = nx;
          cursor.y = prev.y = ny;
          firstMove = false;
        }
        xTo(nx);
        yTo(ny);
      };
      const onLeave = () => {
        firstMove = true;
      };
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);

      /* ---------- reveal intro (GSAP) -------------------------------- */
      const state = { reveal: reduceMotion ? 1 : 0 };
      if (!reduceMotion) {
        gsap.to(state, { reveal: 1, duration: 1.4, ease: "power2.out", delay: 0.1 });
      }

      /* ---------- render loop (GSAP ticker) -------------------------- */
      const tick = (time) => {
        if (!visible || disposed) return;

        // 1. fade the old flow towards "still", then paint the new movement
        fctx.fillStyle = "rgba(128,128,128,0.06)";
        fctx.fillRect(0, 0, fw, fh);

        const dx = (cursor.x - prev.x) * fw;
        const dy = (cursor.y - prev.y) * fh;
        prev.x = cursor.x;
        prev.y = cursor.y;

        const speed = Math.hypot(dx, dy);
        if (speed > 0.15) {
          const norm = fw * 0.03;
          const vx = gsap.utils.clamp(-1, 1, dx / norm);
          const vy = gsap.utils.clamp(-1, 1, dy / norm);
          const rad = fw * radius;
          const px = cursor.x * fw;
          const py = cursor.y * fh;
          const a = Math.min(1, Math.hypot(vx, vy));
          const r = Math.round(128 + vx * 127);
          const g = Math.round(128 - vy * 127); // canvas y is down, GL y is up
          const grad = fctx.createRadialGradient(px, py, 0, px, py, rad);
          grad.addColorStop(0, `rgba(${r},${g},128,${a})`);
          grad.addColorStop(1, `rgba(${r},${g},128,0)`);
          fctx.fillStyle = grad;
          fctx.fillRect(px - rad, py - rad, rad * 2, rad * 2);
        }
        upload(2, texFlow, flowCanvas);

        // 2. draw
        gl.uniform1f(U.uTime, time);
        gl.uniform1f(U.uReveal, state.reveal);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      /* ---------- observers ------------------------------------------ */
      let raf;
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(build);
      });
      ro.observe(root);

      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
        rootMargin: "100px",
      });
      io.observe(root);

      // build once the font is ready so the mask uses the real glyphs
      const ready = document.fonts?.load
        ? document.fonts.load(`${fontWeight} 100px ${fontFamily}`).catch(() => {})
        : Promise.resolve();
      ready.then(() => {
        if (disposed) return;
        build();
        gsap.ticker.add(tick);
      });

      return () => {
        disposed = true;
        cancelAnimationFrame(raf);
        gsap.ticker.remove(tick);
        gsap.killTweensOf(state);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
        ro.disconnect();
        io.disconnect();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    },
    {
      scope: rootRef,
      dependencies: [
  text,
  image,
  fontFamily,
  fontWeight,
  letterSpacing,
  fontSize,
  sidePadding,
  background,
  strength,
  radius,
  sphereDot,
  idle
],
      revertOnUpdate: true,
    }
  );

  return (
    <div ref={rootRef} className={`relative w-full overflow-hidden ${className}`} style={{ background }}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </div>
  );
};

export default LiquidText;
