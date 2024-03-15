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
    // Loaders
    let miscLoader, bgLoader;
    // Controls
    let flyControls, orbitControls;
    // Geometries
    let cube, line;
    // Animation
    let clock;
    // Lighting
    let ambientLight, spotLight, lensflareLight1, lensflareLight2;
    const textureLoader = new THREE.TextureLoader();
    const textureFlare0 = textureLoader.load('textures/lensflare0.png');
    const textureFlare3 = textureLoader.load('textures/lensflare3.png');

    initialSetup();

    buildGeometries();

    buildSpeckField();

    buildBackground();

    const planets = buildPlanets();

    renderRandomPlanet(planets);

    animate();

    //////////////////////////////////////////////////////////////////////////////////////////////

    function initialSetup() {

        // DOM Container
        container = document.createElement('div');
        document.body.appendChild(container);

        // Create a scene
        scene = new THREE.Scene();

        // Add camera, set its position and orientation
        camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 5000);
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
    // Lighting Functions 
    function genRandFlares() {
        let min1 = 0.03;
        let max1 = 0.07;
        let min2 = 0.15;
        let max2 = 0.25;
        let min3 = 0.09;
        let max3 = 0.11;
        let min4 = 0.32;
        let max4 = 0.38;
        return [
            (Math.random() * (max1 - min1) + min1),
            (Math.random() * (max2 - min2) + min2),
            (Math.random() * (max3 - min3) + min3),
            (Math.random() * (max4 - min4) + min4)
        ]
    }
    function tetrahedronCoords() {

        let m = 2000; // scale multiplier

        let x1 = m * 1;
        let y1 = m * -1 / Math.sqrt(3);
        let z1 = m * -1 / Math.sqrt(6);
        let x2 = m * -1;
        let y2 = m * -1 / Math.sqrt(3);
        let z2 = m * -1 / Math.sqrt(6);
        let x3 = m * 0;
        let y3 = m * 2 / Math.sqrt(3);
        let z3 = m * -1 / Math.sqrt(6);
        let x4 = m * 0;
        let y4 = m * 0;
        let z4 = m * 3 / Math.sqrt(6);

        return [x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4];
    }

    function addLight(h, s, l, x, y, z) {

        const light = new THREE.PointLight(0xffffff, 1.5, 4000, 0);
        light.color.setHSL(h, s, l);
        light.position.set(x, y, z);
        scene.add(light);

        let randomFlares = genRandFlares();

        const lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(textureFlare0, 200, 0, light.color));
        lensflare.addElement(new LensflareElement(textureFlare3, 60, randomFlares[0]));
        lensflare.addElement(new LensflareElement(textureFlare3, 70, randomFlares[1]));
        lensflare.addElement(new LensflareElement(textureFlare3, 100, randomFlares[2]));
        lensflare.addElement(new LensflareElement(textureFlare3, 50, randomFlares[3]));
        light.add(lensflare);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Control Functions 

    function customizeFlyControls() {
        flyControls.movementSpeed = 77;
        flyControls.domElement = container;
        flyControls.rollSpeed = Math.PI / 5;
        flyControls.autoForward = false;
        flyControls.dragToLook = false;
        flyControls.enableDamping = true;
        flyControls.dampingFactor = 0.125;
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


        let max = 2000;
        let min = -2000;
        //let coords = randCoord(min, max);
        let coords = tetrahedronCoords();
        // lensflares
        addLight((308 / 360), 1, .65, coords[0], coords[1], coords[2]);
        addLight((52 / 360), 1, .59, coords[3], coords[4], coords[5]);
        addLight((237 / 360), 1, .86, coords[6], coords[7], coords[8]);
        addLight((34 / 360), 1, .74, coords[9], coords[10], coords[11]);
        addLight((200 / 360), 1, .54, Math.random() * (max - min) + min, Math.random() * (max - min) + min, Math.random() * (max - min) + min);
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

    function buildSpeckField() {
        
        // define a speck
        const speckGeometry = new THREE.SphereGeometry(1, 32, 16);
        const speckMaterial = new THREE.MeshPhongMaterial({
            color: 0xfffce5,
            specular: 0x111111,
            shininess: 30,
            emissive: 0x232f34,
            reflectivity: 0.262,
            refractionRatio: 0.249,
            fog: false
        }); 

        // build field of specks
        for (let i = 0; i < 15000; i++) {
            const speckMesh = new THREE.Mesh(speckGeometry, speckMaterial);

            speckMesh.position.x = 2000 * (2.0 * Math.random() - 1.0);
            speckMesh.position.y = 2000 * (2.0 * Math.random() - 1.0);
            speckMesh.position.z = 2000 * (2.0 * Math.random() - 1.0);

            // speckMesh.rotation.x = Math.random() * Math.PI;
            // speckMesh.rotation.y = Math.random() * Math.PI;
            // speckMesh.rotation.z = Math.random() * Math.PI;

            speckMesh.matrixAutoUpdate = false;
            speckMesh.updateMatrix();

            scene.add(speckMesh);
        }
    }

    function renderRandomPlanet(planetMeshes) {

        // Generate random numbers between +500 and -500
        const x = Math.floor(Math.random() * 1001) - 500;
        const y = Math.floor(Math.random() * 1001) - 500;
        const z = Math.floor(Math.random() * 1001) - 500;

        // Modify item at random index
        let planet = planetMeshes[Math.floor(Math.random() * planetMeshes.length)];
        planet.position.set(x, y, z);

        // Add to scene
        scene.add(planet);

    }

    function buildPlanets() {

        // Planet Textures
        const sunTexture = new THREE.TextureLoader().load('../textures/2k_sun.jpg');
        const mercuryTexture = new THREE.TextureLoader().load('../textures/2k_mercury.jpg');
        const venusAtmoTexture = new THREE.TextureLoader().load('../textures/2k_venus_atmosphere.jpg');
        const venusSurfTexture = new THREE.TextureLoader().load('../textures/2k_venus_surface.jpg');

        const earthTexture = new THREE.TextureLoader().load('../textures/2k_earth_daymap.jpg');
        const moonTexture = new THREE.TextureLoader().load('../textures/2k_moon.jpg');
        const marsTexture = new THREE.TextureLoader().load('../textures/2k_mars.jpg');

        const jupiterTexture = new THREE.TextureLoader().load('../textures/2k_jupiter.jpg');
        const saturnTexture = new THREE.TextureLoader().load('../textures/2k_saturn.jpg');
        const uranusTexture = new THREE.TextureLoader().load('../textures/2k_uranus.jpg');
        const dunaTexture = new THREE.TextureLoader().load('../textures/duna.png');

        // Planets aka hawt rocks
        let planetMeshes = [];
        let sizeMultiplier = 5;
        const moonMesh = buildPlanetMesh(3 * sizeMultiplier, moonTexture); 
        const mercuryMesh = buildPlanetMesh(5 * sizeMultiplier, mercuryTexture);
        const venusSurfMesh = buildPlanetMesh(7 * sizeMultiplier, venusSurfTexture);
        const venusAtmoMesh = buildPlanetMesh(9 * sizeMultiplier, venusAtmoTexture);
        const marsMesh = buildPlanetMesh(12 * sizeMultiplier, marsTexture);
        const earthMesh = buildPlanetMesh(14 * sizeMultiplier, earthTexture);
        const uranusMesh = buildPlanetMesh(18 * sizeMultiplier, uranusTexture);
        const saturnMesh = buildPlanetMesh(26 * sizeMultiplier, saturnTexture);
        const jupiterMesh = buildPlanetMesh(35 * sizeMultiplier, jupiterTexture);
        const sunMesh = buildPlanetMesh(55 * sizeMultiplier, sunTexture);

        const dunaMesh = buildPlanetMesh(16, dunaTexture);

        // Add planets to array
        planetMeshes.push(moonMesh);
        planetMeshes.push(mercuryMesh);
        planetMeshes.push(venusSurfMesh);
        planetMeshes.push(venusAtmoMesh);
        planetMeshes.push(marsMesh);
        planetMeshes.push(earthMesh);
        planetMeshes.push(uranusMesh);
        planetMeshes.push(saturnMesh);
        planetMeshes.push(jupiterMesh);
        planetMeshes.push(sunMesh);
        planetMeshes.push(dunaMesh);

        // Add planets to scene
        /*
        scene.add(sun);
        scene.add(mercury);
        scene.add(venusSurf);
        scene.add(venusAtmo);

        scene.add(earth);
        scene.add(moon);
        scene.add(mars);

        scene.add(jupiter);
        scene.add(saturn);
        scene.add(uranus);
        scene.add(duna);
        */
        return planetMeshes;
    }

    function buildPlanetMesh(size, texture) {
        const planetGeometry = new THREE.SphereGeometry(size, 48, 32);
        const planetMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        return planetMesh;
    }

    function transformPlanets() {

        // Rotate planets
        for (let i = 0; i < planets.length; i++) {
            planets[i].rotation.y += (Math.random() * (0.007 - 0.001) + 0.001); 
        }
    }



    //////////////////////////////////////////////////////////////////////////////////////////////
    // Painting Functions

    function animate() {
        requestAnimationFrame(animate);

        transformCube(); // all entity transformations belong here
        transformPlanets();

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
