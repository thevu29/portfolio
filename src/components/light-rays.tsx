"use client";

import { useEffect, useRef, useState } from "react";

// Light rays falling from the top centre. One full-screen triangle, one
// fragment shader, no libraries. Colour comes from CSS tokens so it follows
// the theme. Paused offscreen / in background tabs; static under reduced motion.

const VERTEX = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform float uAlpha;

float ray(vec2 src, vec2 dir, vec2 coord, float seedA, float seedB, float speed) {
  vec2 toC = coord - src;
  float cosA = dot(normalize(toC), dir);
  return clamp(
    (0.45 + 0.15 * sin(cosA * seedA + uTime * speed)) +
    (0.3 + 0.2 * cos(-cosA * seedB + uTime * speed)),
    0.0, 1.0
  ) * clamp((uRes.x - length(toC)) / uRes.x, 0.5, 1.0);
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 src = vec2(uRes.x * 0.5, -uRes.y * 0.35);
  vec2 dir = vec2(0.0, 1.0);
  float s = ray(src, dir, coord, 36.2214, 21.11349, 0.55) * 0.55
          + ray(src + vec2(uRes.x * 0.1, 0.0), dir, coord, 22.3991, 18.0234, 0.42) * 0.45;
  float fall = 1.0 - smoothstep(0.0, 1.0, coord.y / (uRes.y * 0.95));
  float cone = 1.0 - smoothstep(0.25, 1.0, abs(coord.x - uRes.x * 0.5) / (uRes.x * 0.6));
  float a = s * fall * cone * uAlpha;
  gl_FragColor = vec4(uColor * a, a);
}
`;

// The rays are soft gradients: half the CSS resolution looks the same once the
// browser upscales the canvas, at a quarter of the pixels. With a 30fps cap
// for a slow drift, this keeps the GPU free for page work (navigations on
// phones were waiting on it, and on reading the canvas back for the slide).
const RENDER_SCALE = 0.5;
const FRAME_MS = 1000 / 30;
const STATIC_TIME = 2.0;

type Mode = "webgl" | "static" | "fallback";

function readRayColor(): { rgb: [number, number, number]; alpha: number } {
  const css = getComputedStyle(document.documentElement);
  const rgb = css
    .getPropertyValue("--rays-rgb")
    .trim()
    .split(/\s+/)
    .map((v) => Number(v) / 255) as [number, number, number];
  const alpha = Number(css.getPropertyValue("--rays-alpha")) || 0.5;
  return { rgb: rgb.length === 3 && rgb.every(Number.isFinite) ? rgb : [1, 1, 1], alpha };
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("createShader failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

export function LightRays({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("webgl");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
    if (!gl) {
      setMode("fallback");
      return;
    }

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link failed");
    } catch {
      setMode("fallback");
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uColor = gl.getUniformLocation(program, "uColor");
    const uAlpha = gl.getUniformLocation(program, "uAlpha");

    const applyColor = () => {
      const { rgb, alpha } = readRayColor();
      gl.uniform3f(uColor, ...rgb);
      gl.uniform1f(uAlpha, alpha);
    };

    const draw = (seconds: number) => {
      gl.uniform1f(uTime, seconds);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let animate = !reducedMotion.matches;
    setMode(animate ? "webgl" : "static");

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * RENDER_SCALE));
      canvas.height = Math.max(1, Math.round(height * RENDER_SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      if (!animate) draw(STATIC_TIME);
    };

    let frame = 0;
    let lastDraw = 0;
    let visible = true;
    const start = performance.now();
    const loop = (now: number) => {
      if (now - lastDraw >= FRAME_MS) {
        lastDraw = now;
        draw((now - start) / 1000);
      }
      frame = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (animate && visible && document.visibilityState === "visible") {
        frame = requestAnimationFrame(loop);
      } else {
        draw(STATIC_TIME);
      }
    };

    applyColor();
    resize();
    sync();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    intersection.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      applyColor();
      if (!frame) draw(STATIC_TIME);
    });
    themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    const onMotionChange = () => {
      animate = !reducedMotion.matches;
      setMode(animate ? "webgl" : "static");
      sync();
    };
    reducedMotion.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", sync);
    // Mobile Safari drops contexts under memory pressure: show the CSS rays.
    const onContextLost = () => setMode("fallback");
    canvas.addEventListener("webglcontextlost", onContextLost);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      reducedMotion.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", sync);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      // No loseContext(): a StrictMode remount reuses this canvas's context.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div aria-hidden="true" data-rays={mode} className={`pointer-events-none ${className}`}>
      {mode === "fallback" ? (
        <div className="rays-fallback absolute inset-0" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}
