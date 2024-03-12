import * as THREE from 'three';

// Check for WebGL support
import WebGL from 'three/addons/capabilities/WebGL.js';

if (!WebGL.isWebGLAvailable()) { // WebGL is not available
    document.getElementById('container').appendChild(WebGL.getWebGLErrorMessage());
} else {

    // Initial setup
    var scene;
    var camera;
    var renderer;
    initialSetup();


    // Create a cube
    let cube = buildCube();
    scene.add(cube);

    // Create a line
    let line = buildLine();
    scene.add(line);



    // Animate the geometries
    animate();

    //////////////////////////////////////////////////////////////////////////////////////////////

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

    function initialSetup() {
        // Create a scene
        scene = new THREE.Scene();

        // Create a camera & set position + look at
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
        camera.position.set(0, 0, 35);
        camera.lookAt(0, 0, 0);

        // Create renderer & add to DOM
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    }

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

} //END: WebGL Check
