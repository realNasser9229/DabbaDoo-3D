let scene, camera, renderer, controls;
let bullets = [], enemies = [], keys = {};

// Ensure the script runs only AFTER the window loads
window.onload = () => {
    init();
    animate();
};

function init() {
    // 1. Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Spawn height

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // 3. Controls (Click to start)
    controls = new THREE.PointerLockControls(camera, document.body);
    document.addEventListener('click', () => {
        controls.lock();
        document.getElementById('loading').innerHTML = "DabbaDoo: ACTIVE";
        setTimeout(() => { document.getElementById('loading').style.opacity = '0'; }, 2000);
    });

    // 4. Lighting (The "Full Bright" Setup)
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    // 5. The "I'm Not Broken" Floor
    const grid = new THREE.GridHelper(100, 20, 0x00ff00, 0x222222);
    scene.add(grid);

    // 6. Spawn Targets
    for (let i = 0; i < 20; i++) {
        const enemy = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshStandardMaterial({ color: 0xff00ff })
        );
        enemy.position.set(Math.random() * 40 - 20, 1, Math.random() * -40 - 5);
        scene.add(enemy);
        enemies.push(enemy);
    }

    // 7. Player Gun
    const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x00ffff })
    );
    gun.position.set(0.3, -0.3, -0.5);
    camera.add(gun);
    scene.add(camera); // Required because camera has children (the gun)

    // 8. Event Listeners
    window.addEventListener('keydown', (e) => keys[e.code] = true);
    window.addEventListener('keyup', (e) => keys[e.code] = false);
    window.addEventListener('mousedown', shoot);
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function shoot() {
    if (!controls.isLocked) return;
    const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.1), 
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    b.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    b.userData.v = dir.multiplyScalar(1.0);
    scene.add(b);
    bullets.push(b);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        const speed = 0.12;
        if (keys['KeyW']) controls.moveForward(speed);
        if (keys['KeyS']) controls.moveForward(-speed);
        if (keys['KeyA']) controls.moveRight(-speed);
        if (keys['KeyD']) controls.moveRight(speed);
    }

    // Move Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.position.add(b.userData.v);
        
        // Simple hit detection
        enemies.forEach((e, j) => {
            if (b.position.distanceTo(e.position) < 1.2) {
                e.position.y = -10; // Send enemy to shadow realm
                scene.remove(b);
                bullets.splice(i, 1);
            }
        });

        // Clean up far bullets
        if (b && b.position.length() > 100) {
            scene.remove(b);
            bullets.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
                                               }
