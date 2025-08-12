//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.155.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.155.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";

// --- Smooth nav button scrolling ---
document.querySelectorAll('.nav-buttons .btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// --- Parallax ---
const layers = document.querySelectorAll('section .parallax-layer .shape');
function onScrollParallax() {
  layers.forEach(el => {
    const section = el.closest('section');
    const speed = parseFloat(section?.dataset?.speed) || 0.08;
    const rect = section.getBoundingClientRect();
    const offset = (window.innerHeight - rect.top) * speed;
    el.style.transform = `translate3d(0, ${offset}px, 0) rotate(${offset / 40}deg)`;
  });
}
window.addEventListener('scroll', onScrollParallax, { passive: true });
onScrollParallax();

// --- Highlight active nav ---
const sections = document.querySelectorAll('main section');
const navButtons = document.querySelectorAll('.nav-buttons .btn');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
    }
  });
}, { threshold: 0.6 });
sections.forEach(s => observer.observe(s));

//Create a Three.JS Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 3;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let object;
  let controls;
  const objToRender = 'gibal';

  const loader = new GLTFLoader();
  loader.load(
    `./models/${objToRender}/scene.gltf`,
    (gltf) => {
      object = gltf.scene;

      // Scale so height ≈ 250px in our 250px container
      const box = new THREE.Box3().setFromObject(object);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scaleFactor = 2 / size.y; // adjust as needed
      object.scale.setScalar(scaleFactor);

      // Center the model
      box.setFromObject(object);
      const center = new THREE.Vector3();
      box.getCenter(center);
      object.position.sub(center);

      scene.add(object);
    },
    (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
    (error) => console.error(error)
  );

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(250, 250);
  document.getElementById("container3D").appendChild(renderer.domElement);

  const topLight = new THREE.DirectionalLight(0xffffff, 1);
  topLight.position.set(5, 5, 5);
  topLight.castShadow = true;
  scene.add(topLight);

  const ambientLight = new THREE.AmbientLight(0x333333, 2);
  scene.add(ambientLight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; // disable scroll zoom
  controls.enablePan = false;  // disable panning
  controls.minPolarAngle = Math.PI / 2.5;
  controls.maxPolarAngle = Math.PI / 1.8;

  function animate() {
    requestAnimationFrame(animate);
    if (object) {
      object.rotation.y = -3 + mouseX / window.innerWidth * 3;
      object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
    }
    renderer.render(scene, camera);
  }

  document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  animate();
