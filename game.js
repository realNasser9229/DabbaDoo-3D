let scene, camera, renderer, controls;
let bullets = [], enemies = [];
let keys = {};

// Setup
const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1.6;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.PointerLockControls(camera, document.body);
    document.addEventListener('click', () => controls.lock());

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    const point = new THREE.PointLight(0xff00ff, 1, 100);
    point.position.set(10, 10, 10);
    scene.add(ambient, point);

    // Grid Floor (Cooler than a flat plane)
    const grid = new THREE.GridHelper(200, 50, 0xff00ff, 0x222222);
    scene.add(grid);

    // Spawn 50 Blocky Enemies
    for (let i = 0; i < 50; i++) {
        const enemy = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        );
        enemy.position.set(Math.random() * 100 - 50, 1, Math.random() * 100 - 50);
        scene.add(enemy);
        enemies.push(enemy);
    }

    // Gun Hands
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    gun.position.set(0.3, -0.3, -0.5);
    camera.add(gun);
    scene.add(camera);

    window.onkeydown = (e) => keys[e.code] = true;
    window.onkeyup = (e) => keys[e.code] = false;
    window.onmousedown = shoot;
};

function shoot() {
    if (!controls.isLocked) return;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    b.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    b.userData.v = dir.multiplyScalar(2);
    scene.add(b);
    bullets.push(b);
}

const animate = () => {
    requestAnimationFrame(animate);
    
    if (controls.isLocked) {
        const speed = 0.15;
        if (keys['KeyW']) controls.moveForward(speed);
        if (keys['KeyS']) controls.moveForward(-speed);
        if (keys['KeyA']) controls.moveRight(-speed);
        if (keys['KeyD']) controls.moveRight(speed);
        if (keys['Space'] && camera.position.y <= 1.6) camera.position.y += 2; // Instant Jump
    }

    // Gravity
    if (camera.position.y > 1.6) camera.position.y -= 0.1;

    // Bullet Physics & Collision
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.position.add(b.userData.v);
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (b.position.distanceTo(enemies[j].position) < 1.5) {
                scene.remove(enemies[j]);
                enemies.splice(j, 1);
                scene.remove(b);
                bullets.splice(i, 1);
                break;
            }
        }
        if (b && b.position.length() > 200) {
            scene.remove(b);
            bullets.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
};

init();
animate();
