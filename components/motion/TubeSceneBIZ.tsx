"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Authored for a 2:1 card, ordered right -> left (uv.x 0 -> 1) so the reveal and pulses travel leftward.
const PATH: [number, number, number][] = [
  [11.5, 1.2, -2],
  [8.6, 0.5, -0.4],
  [6.4, 0, 0.9],
  [4.8, -0.3, 1.2],
  [3.3, 0.5, 0.8],
  [3.1, 2.1, 0.2],
  [4.3, 3.2, -0.4],
  [6.1, 3.0, -0.8],
  [7.1, 1.7, -1],
  [6.3, 0.3, -1],
  [4.8, -0.4, -1],
  [3.2, -1.6, -0.6],
  [1.2, -2.9, -0.2],
  [-2, -3.75, -0.5],
  [-6.5, -4.05, -1.2],
  [-12, -4.5, -2],
];
const LOOP_CENTER = new THREE.Vector3(5.1, 1.3, 0);
const DESIGN_HALF_W = 8.8;
const DESIGN_HALF_H = 4.41;

function buildCurve() {
  return new THREE.CatmullRomCurve3(
    PATH.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "centripetal",
  );
}

function readToken(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export default function TubeSceneBIZ() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = "size-full";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.75;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(-4, 6, 8);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(6, -3, -4);
    scene.add(key, rim);

    const uniforms = {
      uTime: { value: 0 },
      uReveal: { value: reduceMotion ? 1 : 0 },
      uPulse: { value: new THREE.Color(readToken("--biz-lime") || "white") },
    };

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(readToken("--biz-forest-light") || "green"),
      roughness: 0.28,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vAlong;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvAlong = uv.x;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying float vAlong;\nuniform float uTime;\nuniform float uReveal;\nuniform vec3 uPulse;",
        )
        .replace(
          "#include <clipping_planes_fragment>",
          "#include <clipping_planes_fragment>\nif (vAlong > uReveal) discard;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float phase = fract(vAlong * 2.5 - uTime * 0.11);
          float band = exp(-pow((phase - 0.5) / 0.022, 2.0));
          float front = exp(-pow((uReveal - vAlong) / 0.015, 2.0)) * (1.0 - step(0.999, uReveal));
          totalEmissiveRadiance += uPulse * (band * 0.35 + front * 1.6);`,
        );
    };

    const geometry = new THREE.TubeGeometry(buildCurve(), 720, 0.42, 48, false);
    const mesh = new THREE.Mesh(geometry, material);
    // Pivot the group on the loop so pointer tilt turns the knot in place instead of swinging it.
    mesh.position.copy(LOOP_CENTER).negate();
    const group = new THREE.Group();
    group.add(mesh);
    scene.add(group);

    // Wide cards keep the authored layout pinned to the right edge; narrow ones center the loop in the box.
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const halfW = halfH * camera.aspect;
      if (camera.aspect > 1.2) {
        const scale = halfH / DESIGN_HALF_H;
        group.scale.setScalar(scale);
        group.position.set(halfW - DESIGN_HALF_W * scale + LOOP_CENTER.x * scale, LOOP_CENTER.y * scale, 0);
      } else {
        const scale = Math.min(0.95, (halfW * 2) / 6.2);
        group.scale.setScalar(scale);
        group.position.set(0.2, 0.2, 0);
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const pointer = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });

    const startedAt = performance.now();
    let frame = 0;
    let running = false;
    const render = () => {
      const t = (performance.now() - startedAt) / 1000;
      if (!reduceMotion) {
        uniforms.uTime.value = t;
        uniforms.uReveal.value = easeOutCubic(Math.min(1, Math.max(0, (t - 0.1) / 2.4)));
        group.rotation.y += (pointer.x * 0.18 + Math.sin(t * 0.35) * 0.06 - group.rotation.y) * 0.04;
        group.rotation.x += (pointer.y * 0.1 + Math.cos(t * 0.3) * 0.04 - group.rotation.x) * 0.04;
      }
      renderer.render(scene, camera);
      if (running) frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (running) return;
      running = !reduceMotion;
      render();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    // Only spend GPU time while the hero is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) start();
      else stop();
    });
    visibility.observe(host);

    return () => {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden className="pointer-events-none size-full" />;
}
