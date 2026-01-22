let scene, camera, renderer, controls;
let bullets = [], enemies = [], keys = {};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); // Dark grey, not pure black

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Spawn slightly back and up

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.PointerLockControls(camera, document.body);
    document.addEventListener('click', () => controls.lock());

    // --- LIGHTING FIX ---
    // Ambient light hits everything equally
    const ambient = new THREE.AmbientLight(0xffffff, 1.0); 
    scene.add(ambient);

    // Point light follows the player so you can always see
    const light = new THREE.PointLight(0x00ffff, 2, 50);
    camera.add(light); 
    scene.add(camera);

    // --- OBJECTS ---
    // Floor
    const grid = new THREE.GridHelper(200, 50, 0xff00ff, 0x444444);
    scene.add(grid);

    // Spawn Enemies with MeshBasicMaterial (These GLOW even without lights)
    for (let i = 0; i < 30; i++) {
        const enemy = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        enemy.position.set(Math.random() * 40 - 20, 1, Math.random() * -40);
        scene.add(enemy);
        enemies.push(enemy);
    }

    // Gun
    const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    gun.position.set(0.4, -0.4, -0.8);
    camera.add(gun);

    window.onkeydown = (e) => keys[e.code] = true;
    window.onkeyup = (e) => keys[e.code] = false;
    window.onmousedown = shoot;
}

function shoot() {
    if (!controls.isLocked) return;
    const b = new THREE.Mesh(
        new THREE.SphereGeometry(0.1), 
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    b.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    b.userData.v = dir.multiplyScalar(1.5);
    scene.add(b);
    bullets.push(b);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        const speed = 0.15;
        if (keys['KeyW']) controls.moveForward(speed);
        if (keys['KeyS']) controls.moveForward(-speed);
        if (keys['KeyA']) controls.moveRight(-speed);
        if (keys['KeyD']) controls.moveRight(speed);
    }

    // Bullet Physics
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.position.add(b.userData.v);
        
        enemies.forEach((e, j) => {
            if (b.position.distanceTo(e.position) < 1.2) {
                scene.remove(e);
                enemies.splice(j, 1);
                scene.remove(b);
                bullets.splice(i, 1);
            }
        });
    }

    renderer.render(scene, camera);
}

init();
animate();
