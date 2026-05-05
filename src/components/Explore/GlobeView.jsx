import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, ArrowRight, Wind, Thermometer } from 'lucide-react';
import { useWeather, useDestinationPhotos } from '../../hooks/useTravista';
import { useDestinationPhoto } from '../../hooks/useDestinationPhoto';

// Side panel for clicked destination
const GlobePanel = ({ dest, onClose, onViewGrid, onPlanTrip }) => {
  const { weather } = useWeather(dest?.name);
  const { photoUrl, loading: photoLoading } = useDestinationPhoto(dest?.name);

  if (!dest) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="panel"
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="absolute top-0 right-0 h-full w-[300px] bg-[#0f1629]/95 backdrop-blur-xl border-l border-white/10 z-30 flex flex-col"
      >
        <div className="relative h-48 shrink-0">
          {photoLoading ? (
            <div className="w-full h-full shimmer" />
          ) : (
            <img 
              src={photoUrl} 
              alt={dest.name} 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.src = `https://picsum.photos/seed/${encodeURIComponent(dest.name)}/600/400`;
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1629] via-transparent to-transparent z-[1]" />
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4">
            <h3 className="text-white font-black text-xl">{dest.name}</h3>
            <p className="text-white/60 text-sm">{dest.country} {dest.flag}</p>
          </div>
        </div>

        <div className="p-4 flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#1D9E75] bg-[#1D9E75]/10 border border-[#1D9E75]/20 px-2.5 py-1 rounded-full">{dest.category}</span>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-white/50 text-[10px] uppercase font-bold mb-1">Price / Person</p>
            <p className="text-white font-black text-lg">{dest.price}</p>
          </div>

          {weather && (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <img src={weather.icon} alt="" className="w-10 h-10" />
              <div>
                <p className="text-white font-bold text-lg">{weather.temp}°C</p>
                <p className="text-white/60 text-xs capitalize">{weather.description}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (onPlanTrip) onPlanTrip(dest);
              else onViewGrid(dest);
            }}
            className="w-full py-3 bg-[#1D9E75] hover:bg-[#15825f] text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#1D9E75]/20"
          >
            Plan Trip <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewGrid(dest)}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/5"
          >
            View in Grid
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hover label
const HoverLabel = ({ dest, position }) => {
  if (!dest) return null;
  return (
    <div
      className="absolute pointer-events-none z-20 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 whitespace-nowrap"
      style={{ left: position.x + 12, top: position.y - 20 }}
    >
      {dest.flag} {dest.name}, {dest.country}
    </div>
  );
};

const GlobeView = ({ destinations, onViewGrid, onPlanTrip }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeRef = useRef(null);
  const dotsRef = useRef([]);
  const animFrameRef = useRef(null);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const rotationVel = useRef({ x: 0, y: 0 });

  const [hovered, setHovered] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    // ─── 1. INITIALIZE SCENE ───────────────────────────────────────────────────
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x040d1a, 1);
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // ─── 2. LOAD TEXTURES ──────────────────────────────────────────────────────
    const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-day.jpg');
    const bumpMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const specularMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const cloudTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');

    // ─── 3. CREATE GLOBE ───────────────────────────────────────────────────────
    const globeGeo = new THREE.SphereGeometry(1, 128, 128);
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpMap,
      bumpScale: 0.008,
      specularMap: specularMap,
      specular: new THREE.Color(0x2266aa),
      shininess: 18,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);
    globeRef.current = globe;

    // ─── 4. CLOUD LAYER ────────────────────────────────────────────────────────
    const cloudGeo = new THREE.SphereGeometry(1.005, 128, 128);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);

    // ─── 5. ATMOSPHERE GLOW ───────────────────────────────────────────────────
    const atmosGeo = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0,0,1.0)), 3.0);
          gl_FragColor = vec4(0.3, 0.7, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere);

    // ─── 6. LIGHTING ──────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x333333, 1);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.15);
    fillLight.position.set(-5, -2, -5);
    scene.add(fillLight);

    // ─── 7. STAR FIELD ────────────────────────────────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ─── 8. DESTINATION PINS ──────────────────────────────────────────────────
    const latLonToVector3 = (lat, lon, radius = 1.01) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
         radius * Math.cos(phi),
         radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    const pinGroup = new THREE.Group();
    const pinMeshes = [];
    const haloMeshes = [];

    destinations.forEach(dest => {
      const pos = latLonToVector3(dest.lat, dest.lon);

      // Inner bright dot
      const dotGeo = new THREE.SphereGeometry(0.012, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00ff99 });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      dot.userData = { dest };
      pinGroup.add(dot);
      pinMeshes.push(dot);

      // Outer glow halo
      const haloGeo = new THREE.SphereGeometry(0.025, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x1D9E75,
        transparent: true,
        opacity: 0.4,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      halo.userData = { lat: dest.lat }; // for pulse animation
      pinGroup.add(halo);
      haloMeshes.push(halo);
    });

    scene.add(pinGroup);
    dotsRef.current = pinMeshes;

    // ─── 9. INTERACTION LOGIC ──────────────────────────────────────────────────
    let isUserInteracting = false;
    let isDraggingGlobe = false;
    let lastMousePos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDraggingGlobe = true;
      isUserInteracting = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      
      // Raycasting for hover state
      mouse.x = ((e.clientX - rect.left) / W) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / H) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinMeshes);
      
      if (intersects.length > 0) {
        setHovered(intersects[0].object.userData.dest);
        setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        el.style.cursor = 'pointer';
      } else {
        setHovered(null);
        el.style.cursor = isDraggingGlobe ? 'grabbing' : 'grab';
      }

      // Rotation drag
      if (isDraggingGlobe) {
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        globe.rotation.y += dx * 0.005;
        globe.rotation.x += dy * 0.005;
        pinGroup.rotation.y += dx * 0.005;
        pinGroup.rotation.x += dy * 0.005;
        clouds.rotation.y += dx * 0.005;
        atmosphere.rotation.y += dx * 0.005;
        lastMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDraggingGlobe = false;
      setTimeout(() => { isUserInteracting = false; }, 2000);
    };

    const onClick = (e) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / W) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / H) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pinMeshes);
      if (intersects.length > 0) {
        setSelected(intersects[0].object.userData.dest);
      }
    };

    const onWheel = (e) => {
      camera.position.z = Math.max(1.5, Math.min(4, camera.position.z + e.deltaY * 0.002));
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('click', onClick);
    el.addEventListener('wheel', onWheel, { passive: true });

    // ─── 10. ANIMATION LOOP ────────────────────────────────────────────────────
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Natural rotations
      if (!isUserInteracting) {
        globe.rotation.y += 0.0008;
        pinGroup.rotation.y += 0.0008;
      }
      clouds.rotation.y += 0.00015;

      // Pulse halos
      haloMeshes.forEach(halo => {
        halo.material.opacity = 0.2 + 0.2 * Math.sin(Date.now() * 0.003 + halo.userData.lat);
      });

      renderer.render(scene, camera);
    };
    animate();

    // ─── CLEANUP ───────────────────────────────────────────────────────────────
    const handleResize = () => {
      const W2 = el.clientWidth;
      const H2 = el.clientHeight;
      camera.aspect = W2 / H2;
      camera.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('click', onClick);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [destinations]);

  return (
    <div className="relative w-full h-full bg-[#0a0a1a] overflow-hidden" style={{ cursor: 'grab' }}>
      <div ref={mountRef} className="w-full h-full" />
      <HoverLabel dest={hovered} position={hoverPos} />
      {selected && (
        <GlobePanel
          dest={selected}
          onClose={() => setSelected(null)}
          onViewGrid={(dest) => onViewGrid(dest)}
          onPlanTrip={onPlanTrip}
        />
      )}
      <div className="absolute bottom-4 left-4 text-white/30 text-xs font-mono">
        Drag to rotate · Scroll to zoom · Click pins to explore
      </div>
    </div>
  );
};

export default GlobeView;
