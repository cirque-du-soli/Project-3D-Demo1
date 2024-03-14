// IMPORTS
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js'; // Check for WebGL support
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
//import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { FlyControls } from '/scripts/FlyControlsCUSTOM.js';
import { Lensflare, LensflareElement } from 'three/addons/objects/Lensflare.js';
import { Stats } from '/scripts/StatsCUSTOM.js';



// First, check for WebGL support, then create the scene
if (!WebGL.isWebGLAvailable()) { // WebGL is not available
    document.getElementById('container').appendChild(WebGL.getWebGLErrorMessage());
} else {


    // TEMP
    /* const 3dItemLoader = new GLTFLoader();
    */

    //////////////////////////////////////////////////////////////////////////////////////////////

    ////////// Global Variables
    // DOM
    let container, stats;
    // Stage
    let scene, camera, renderer;
    // Lighting
    let ambientLight, spotLight, lensflareLight1, lensflareLight2;
    // Loaders
    let miscLoader, bgLoader;
    // Controls
    let flyControls, orbitControls;
    // Geometries
    let cube, line;
    // Animation
    let clock;

    initialSetup();

    buildGeometries();

    buildBackground();

    animate();

    //////////////////////////////////////////////////////////////////////////////////////////////

    function initialSetup() {

        // DOM Container
        container = document.createElement('div');
        document.body.appendChild(container);

        // Create a scene
        scene = new THREE.Scene();

        // Add camera, set its position and orientation
        camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 500);
        camera.position.set(55, 0, -35);
        camera.lookAt(0, 0, 0);

        // Add Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Add orbit controls
        orbitControls = new OrbitControls(camera, renderer.domElement);
        customizeOrbitControls();

        // Add fly controls
        flyControls = new FlyControls(camera, renderer.domElement);
        customizeFlyControls();

        // Add stats
        stats = new Stats();
        container.appendChild(stats.dom);

        // Add clock
        clock = new THREE.Clock();

        // Event Listeners
        window.addEventListener('resize', onWindowResize);
        document.body.addEventListener('mouseleave', onMouseLeave);
        document.body.addEventListener('mouseenter', onMouseEnter);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Control Functions 

    function customizeFlyControls() {
        flyControls.movementSpeed = 50;
        flyControls.domElement = container;
        flyControls.rollSpeed = Math.PI / 6;
        flyControls.autoForward = false;
        flyControls.dragToLook = false;
        flyControls.enableDamping = true;
        flyControls.disableClickToMove = true;
    }

    function customizeOrbitControls() {
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.1;
        orbitControls.enableZoom = false;
        orbitControls.enabled = false;
    }


    //////////////////////////////////////////////////////////////////////////////////////////////
    // Geometry Functions

    function buildBackground() {
        bgLoader = new RGBELoader();
        bgLoader.load('../HDRIs/space-bg.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping; // how to apply hdr image
            scene.background = texture;
            scene.environment = texture;
        });
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1; // adjust this!! FIXME
        renderer.outputEncoding = THREE.sRGBEncoding;

    }

    function buildGeometries() {
        // Create a cube
        cube = buildCube();
        scene.add(cube);

        // Create a lines
        line = buildLine();
        scene.add(line);
    }

    function buildLine() {
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

        const points = [];
        points.push(new THREE.Vector3(-10, 0, 0));
        points.push(new THREE.Vector3(0, 10, 0));
        points.push(new THREE.Vector3(10, 0, 0));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return new THREE.Line(geometry, material);
    }

    function buildCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        return new THREE.Mesh(geometry, material);
    }

    function transformCube() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Painting Functions

    function animate() {
        requestAnimationFrame(animate);

        transformCube(); // all entity transformations belong here
        render();
        stats.update();

    }

    function render() {
        const delta = clock.getDelta();
        //orbitControls.update(delta);
        flyControls.update(delta);
        renderer.render(scene, camera);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Event Listener Functions

    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    function onMouseLeave() {
        flyControls.freeze = true;
        //console.log('freeze');
    }
    
    function onMouseEnter() {
        flyControls.freeze = false;
        //console.log('unfreeze');
    }

} //END: WebGL Check


// //////////////////////////////////////////////////////////////////////////////////////////////
/* CREDITS:

Space Background HDR Image:
https://www.spacespheremaps.com/hdr-spheremaps/

Planet Textures:
https://www.solarsystemscope.com/textures/download/






*/
