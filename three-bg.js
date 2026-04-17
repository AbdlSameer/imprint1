/**
 * IMPRINT — Three.js 3D Background
 * Full-page neural network + hero torus knot
 */

(function () {
  if (typeof THREE === 'undefined') return;

  // ─────────────────────────────────────────────────────
  // GLOBAL SCENE — fixed neural network behind everything
  // ─────────────────────────────────────────────────────
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 30);

  // ─── Neural node cloud ───────────────────────────────
  const NODE_COUNT = 160;
  const nodePositions = [];
  const nodeGroup = new THREE.Group();

  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.6 });

  for (let i = 0; i < NODE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 18 + Math.random() * 12;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    nodePositions.push(new THREE.Vector3(x, y, z));

    const geo  = new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 6, 6);
    const mesh = new THREE.Mesh(geo, nodeMaterial.clone());
    mesh.position.set(x, y, z);

    // Slow drift velocity
    mesh.userData.vx = (Math.random() - 0.5) * 0.008;
    mesh.userData.vy = (Math.random() - 0.5) * 0.008;
    mesh.userData.vz = (Math.random() - 0.5) * 0.004;

    nodeGroup.add(mesh);
  }
  scene.add(nodeGroup);

  // ─── Connection lines ─────────────────────────────────
  const LINE_DIST = 9;
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x4a9eff,
    transparent: true,
    opacity: 0.06,
  });

  const lineGroup = new THREE.Group();

  function buildLines() {
    // Clear old
    while (lineGroup.children.length) {
      const l = lineGroup.children[0];
      l.geometry.dispose();
      lineGroup.remove(l);
    }

    const positions = nodeGroup.children.map(m => m.position);

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < LINE_DIST) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            positions[i].clone(),
            positions[j].clone(),
          ]);
          const alpha = (1 - dist / LINE_DIST) * 0.12;
          const mat = new THREE.LineBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: alpha,
          });
          const line = new THREE.Line(geo, mat);
          lineGroup.add(line);
        }
      }
    }
  }

  buildLines();
  scene.add(lineGroup);

  // ─── Hero torus knot (large, prominent) ──────────────
  const torusGeo = new THREE.TorusKnotGeometry(5, 1.2, 220, 24, 3, 5);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x4a9eff,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const torusKnot = new THREE.Mesh(torusGeo, torusMat);
  torusKnot.position.set(14, -2, -5);
  scene.add(torusKnot);

  // Second smaller accent torus knot
  const torus2Geo = new THREE.TorusKnotGeometry(2.5, 0.5, 160, 16, 2, 3);
  const torus2Mat = new THREE.MeshBasicMaterial({
    color: 0x4a9eff,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });
  const torusKnot2 = new THREE.Mesh(torus2Geo, torus2Mat);
  torusKnot2.position.set(-18, 6, -10);
  scene.add(torusKnot2);

  // ─── Icosahedron (left side) ──────────────────────────
  const icoGeo = new THREE.IcosahedronGeometry(4, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x4a9eff,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-16, -8, -8);
  scene.add(ico);

  // ─── Grid floor plane ────────────────────────────────
  const gridHelper = new THREE.GridHelper(80, 30, 0x1a1a2e, 0x111122);
  gridHelper.position.y = -20;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.3;
  scene.add(gridHelper);

  // ─── Mouse parallax ───────────────────────────────────
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ─── Scroll reactivity ───────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // ─── Resize ───────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ─── Line rebuild throttle ────────────────────────────
  let lineRebuildTimer = 0;

  // ─── Animation loop ───────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Torus knot rotation
    torusKnot.rotation.x  = t * 0.18;
    torusKnot.rotation.y  = t * 0.10;
    torusKnot2.rotation.x = -t * 0.12;
    torusKnot2.rotation.z =  t * 0.08;
    ico.rotation.x = t * 0.07;
    ico.rotation.y = t * 0.12;

    // Node drift
    for (const node of nodeGroup.children) {
      node.position.x += node.userData.vx;
      node.position.y += node.userData.vy;
      node.position.z += node.userData.vz;

      // Soft boundary bounce
      if (Math.abs(node.position.x) > 22) node.userData.vx *= -1;
      if (Math.abs(node.position.y) > 18) node.userData.vy *= -1;
      if (Math.abs(node.position.z) > 15) node.userData.vz *= -1;

      // Pulse opacity
      node.material.opacity = 0.3 + 0.3 * Math.sin(t * 1.5 + node.position.x);
    }

    // Rebuild lines every ~40 frames
    lineRebuildTimer++;
    if (lineRebuildTimer > 40) {
      buildLines();
      lineRebuildTimer = 0;
    }

    // Smooth mouse parallax on camera
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    camera.position.x = currentX * 3;
    camera.position.y = -currentY * 2 - (scrollY * 0.005);
    camera.position.z = 30 + scrollY * 0.01;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // ─────────────────────────────────────────────────────
  // HERO MINI-SCENE — torus knot inside hero wrapper
  // ─────────────────────────────────────────────────────
  const heroWrapper = document.getElementById('hero-3d-wrapper');
  if (heroWrapper) {
    const heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    heroRenderer.setClearColor(0x000000, 0);

    const setHeroSize = () => {
      heroRenderer.setSize(heroWrapper.offsetWidth, heroWrapper.offsetHeight);
      heroCamera.aspect = heroWrapper.offsetWidth / heroWrapper.offsetHeight;
      heroCamera.updateProjectionMatrix();
    };

    heroWrapper.appendChild(heroRenderer.domElement);

    const heroScene  = new THREE.Scene();
    const heroCamera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    heroCamera.position.set(0, 0, 14);

    // Central glowing torus knot
    const hkGeo = new THREE.TorusKnotGeometry(3, 0.7, 300, 28, 3, 5);
    const hkMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const hk = new THREE.Mesh(hkGeo, hkMat);
    heroScene.add(hk);

    // Ring around it
    const ringGeo = new THREE.TorusGeometry(5.5, 0.04, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.15 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    heroScene.add(ring);

    // Outer ring
    const ring2Geo = new THREE.TorusGeometry(7.5, 0.03, 8, 120);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x4a9eff, transparent: true, opacity: 0.07 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.z = Math.PI / 6;
    heroScene.add(ring2);

    // Point cloud around torus
    const ptCount = 300;
    const ptGeo   = new THREE.BufferGeometry();
    const ptPos   = new Float32Array(ptCount * 3);
    for (let i = 0; i < ptCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const b = Math.random() * Math.PI;
      const r = 4 + Math.random() * 5;
      ptPos[i * 3]     = r * Math.sin(b) * Math.cos(a);
      ptPos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
      ptPos[i * 3 + 2] = r * Math.cos(b);
    }
    ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
    const ptMat = new THREE.PointsMaterial({ color: 0x4a9eff, size: 0.06, transparent: true, opacity: 0.5 });
    const pts   = new THREE.Points(ptGeo, ptMat);
    heroScene.add(pts);

    setHeroSize();
    window.addEventListener('resize', setHeroSize);

    let hMx = 0, hMy = 0, hCx = 0, hCy = 0;
    document.addEventListener('mousemove', e => {
      hMx = (e.clientX / window.innerWidth  - 0.5) * 0.8;
      hMy = (e.clientY / window.innerHeight - 0.5) * 0.8;
    });

    const heroClock = new THREE.Clock();
    function heroAnimate() {
      requestAnimationFrame(heroAnimate);
      const ht = heroClock.getElapsedTime();

      hk.rotation.x = ht * 0.22;
      hk.rotation.y = ht * 0.14;

      ring.rotation.z  = ht * 0.08;
      ring2.rotation.y = ht * 0.05;

      pts.rotation.y = ht * 0.04;
      pts.rotation.x = ht * 0.02;

      // Pulsing opacity
      hkMat.opacity = 0.16 + 0.10 * Math.sin(ht * 0.8);

      hCx += (hMx - hCx) * 0.05;
      hCy += (hMy - hCy) * 0.05;
      heroCamera.position.x = hCx * 2;
      heroCamera.position.y = -hCy * 2;
      heroCamera.lookAt(heroScene.position);

      heroRenderer.render(heroScene, heroCamera);
    }
    heroAnimate();
  }
})();
