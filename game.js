let scene, camera, renderer, controls;
let bullets = [], enemies = [], platforms = [];
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Spawning height
    camera.position.y = 2; 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.PointerLockControls(camera, document.body);

    const overlay = document.getElementById('overlay');
    overlay.addEventListener('click', () => {
        controls.lock();
    });

    controls.addEventListener('lock', () => { overlay.style.display = 'none'; });
    controls.addEventListener('unlock', () => { overlay.style.display = 'flex'; });

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 10, 7);
    scene.add(sun);

    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Create Platforms & Enemies
    for (let i = 0; i < 5; i++) {
        const enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        enemy.position.set(Math.random() * 20 - 10, 1, Math.random() * -20 - 5);
        scene.add(enemy);
        enemies.push(enemy);
    }

    // Hands
    const hands = new THREE.Group();
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x555555 }));
    gun.position.set(0.5, -0.4, -0.5);
    hands.add(gun);
    camera.add(hands);
    scene.add(camera);

    // Input
    const onKeyDown = (e) => {
        switch (e.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyD': moveRight = true; break;
            case 'Space': if (camera.position.y <= 2.1) velocity.y += 15; break;
        }
    };
    const onKeyUp = (e) => {
        switch (e.code) {
            case 'KeyW': moveForward = false; break;
            case 'KeyS': moveBackward = false; break;
            case 'KeyA': moveLeft = false; break;
            case 'KeyD': moveRight = false; break;
        }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', shoot);
}

function shoot() {
    if (!controls.isLocked) return;
    const bullet = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    bullet.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    bullet.userData.velocity = dir.multiplyScalar(1.2);
    scene.add(bullet);
    bullets.push(bullet);
}

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        // Movement Physics
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 3.0 * delta; // Gravity

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        camera.position.y += (velocity.y * delta);
        if (camera.position.y < 2) {
            velocity.y = 0;
            camera.position.y = 2;
        }
    }

    // Bullets & Collision
    bullets.forEach((b, i) => {
        b.position.add(b.userData.velocity);
        enemies.forEach((e, j) => {
            if (b.position.distanceTo(e.position) < 1.5) {
                scene.remove(e);
                enemies.splice(j, 1);
            }
        });
    });

    prevTime = time;
    renderer.render(scene, camera);
        }
