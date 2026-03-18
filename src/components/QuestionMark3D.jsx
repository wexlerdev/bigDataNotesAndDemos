import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export default function QuestionMark3D({ onLoaded }) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ======== Scene ======== */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1726);
    scene.fog = new THREE.FogExp2(0x1a1726, 0.04);

    /* ======== Camera ======== */
    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 3, 10);

    /* ======== Renderer ======== */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    /* ======== Controls ======== */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.85;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.enableZoom = false;
    controls.enablePan = false;

    /* ======== Lighting — purple/gold theme ======== */
    const ambient = new THREE.AmbientLight(0x2d2640, 2.5);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xc4b5fd, 30.0);
    spot.position.set(0, 14, 1);
    spot.angle = Math.PI / 7;
    spot.penumbra = 0.15;
    spot.decay = 1.3;
    spot.distance = 35;
    spot.castShadow = true;
    spot.shadow.mapSize.set(2048, 2048);
    spot.shadow.bias = -0.0004;
    scene.add(spot);
    scene.add(spot.target);

    const backLight = new THREE.DirectionalLight(0x6644aa, 3.0);
    backLight.position.set(-3, 4, -6);
    scene.add(backLight);

    const underGlow = new THREE.PointLight(0xf5d547, 3.0, 10);
    underGlow.position.set(0, 0.2, 0);
    scene.add(underGlow);

    /* ======== Ground ======== */
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x16132a, roughness: 0.95, metalness: 0.0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ======== Particle textures ======== */
    function createSoftCircle() {
      const size = 64;
      const c = document.createElement('canvas'); c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.4, 'rgba(255,255,255,0.4)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }
    const softCircle = createSoftCircle();

    function createQuestionMark() {
      const size = 128;
      const c = document.createElement('canvas'); c.width = size; c.height = size;
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      ctx.filter = 'blur(6px)';
      ctx.font = 'bold 80px serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText('?', size / 2, size / 2 + 4);
      return new THREE.CanvasTexture(c);
    }
    const questionTex = createQuestionMark();

    /* ======== Fog particles ======== */
    const fogCount = 200;
    const fogGeo = new THREE.BufferGeometry();
    const fogPositions = new Float32Array(fogCount * 3);
    for (let i = 0; i < fogCount; i++) {
      fogPositions[i * 3] = (Math.random() - 0.5) * 20;
      fogPositions[i * 3 + 1] = Math.random() * 0.6;
      fogPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPositions, 3));
    const fogMat = new THREE.PointsMaterial({
      color: 0x6644aa, size: 2.5, map: questionTex,
      transparent: true, alphaTest: 0.01, opacity: 0.3,
      depthWrite: false, sizeAttenuation: true,
    });
    const fogParticles = new THREE.Points(fogGeo, fogMat);
    scene.add(fogParticles);

    /* ======== Embers — gold/purple ======== */
    const emberCount = 120;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities = new Float32Array(emberCount * 3);
    const emberColors = new Float32Array(emberCount * 3);
    const emberLifetimes = new Float32Array(emberCount);

    function initEmber(i) {
      const angle = Math.random() * Math.PI * 2, radius = Math.random() * 4;
      emberPositions[i * 3] = Math.cos(angle) * radius;
      emberPositions[i * 3 + 1] = Math.random() * 0.5;
      emberPositions[i * 3 + 2] = Math.sin(angle) * radius;
      emberVelocities[i * 3] = (Math.random() - 0.5) * 0.3;
      emberVelocities[i * 3 + 1] = 0.4 + Math.random() * 0.8;
      emberVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      const t = Math.random();
      // Gold to lavender gradient
      emberColors[i * 3] = 0.96 - t * 0.2;
      emberColors[i * 3 + 1] = 0.84 - t * 0.13;
      emberColors[i * 3 + 2] = 0.28 + t * 0.7;
      emberLifetimes[i] = Math.random();
    }
    for (let i = 0; i < emberCount; i++) initEmber(i);

    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(emberColors, 3));

    const emberMat = new THREE.PointsMaterial({
      size: 0.08, map: softCircle, vertexColors: true,
      transparent: true, opacity: 0.9, depthWrite: false,
      sizeAttenuation: true, blending: THREE.AdditiveBlending,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    /* ======== Load model ======== */
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      './questionmark3dmodel1.glb',
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        const scaledBox = new THREE.Box3().setFromObject(model);
        model.position.y -= scaledBox.min.y;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        const finalBox = new THREE.Box3().setFromObject(model);
        const finalCenter = finalBox.getCenter(new THREE.Vector3());
        // Shift model to the left side of viewport
        const offsetX = -4;
        finalCenter.x += offsetX;
        model.position.x += offsetX;

        // Start camera 90 degrees to the left
        const radius = 8;
        controls.target.copy(finalCenter);
        const angle = 120 * Math.PI / 180;
        camera.position.set(
          finalCenter.x + Math.sin(angle) * radius,
          finalCenter.y + 3,
          finalCenter.z + Math.cos(angle) * radius
        );

        spot.target.position.copy(finalCenter);
        underGlow.position.set(finalCenter.x, 0.2, finalCenter.z);
        controls.update();

        if (onLoaded) onLoaded();
      },
      undefined,
      (err) => console.error('Model load error:', err)
    );

    /* ======== Resize ======== */
    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    /* ======== Animate ======== */
    const clock = new THREE.Clock();
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      const pos = emberGeo.attributes.position.array;
      for (let i = 0; i < emberCount; i++) {
        emberLifetimes[i] += dt * 0.15;
        pos[i * 3] += emberVelocities[i * 3] * dt + Math.sin(t * 2 + i) * 0.003;
        pos[i * 3 + 1] += emberVelocities[i * 3 + 1] * dt;
        pos[i * 3 + 2] += emberVelocities[i * 3 + 2] * dt + Math.cos(t * 1.5 + i * 0.7) * 0.003;
        if (pos[i * 3 + 1] > 8 || emberLifetimes[i] > 1) initEmber(i);
      }
      emberGeo.attributes.position.needsUpdate = true;

      const fogPos = fogGeo.attributes.position.array;
      for (let i = 0; i < fogCount; i++) {
        fogPos[i * 3] += Math.sin(t * 0.3 + i * 0.5) * 0.002;
        fogPos[i * 3 + 2] += Math.cos(t * 0.2 + i * 0.3) * 0.002;
      }
      fogGeo.attributes.position.needsUpdate = true;

      underGlow.intensity = 3.0 + Math.sin(t * 3) * 0.6 + Math.sin(t * 7.3) * 0.3;

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    /* ======== Cleanup ======== */
    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: 'grab',
        overflow: 'hidden',
      }}
    />
  );
}
