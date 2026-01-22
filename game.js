// =========================
// DabbaDoo Fixed Prototype
// =========================

let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];
let haloParticles = [];
let platforms = [];
let clock = new THREE.Clock();
let player = { speed: 0.1 };

// Movement tracking
const keys = {};

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Note: Do NOT set camera.position.y here if using PointerLockControls inside a group
    scene.add(camera); 

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => {
        if (!controls.isLocked) controls.lock();
    });

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x555555));

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    createPlatforms();
    createPlayerHands();
    spawnEnemies(5);
    createBoobiDoodi();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousedown', shoot); // Use mousedown for better feel
    window.addEventListener('keydown', (e) => { keys[e.code] = true; onKeyDown(e); });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    const loadingText = document.getElementById("loading");
    if (loadingText) loadingText.style.display = "none";
}

function createPlayerHands() {
    const handsGroup = new THREE.Group();

    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), mat);
    lArm.position.set(-0.4, -0.3, -0.5);
    
    const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), mat);
    rArm.position.set(0.4, -0.3, -0.5);

    const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    gun.position.set(0.4, -0.2, -0.8);

    handsGroup.add(lArm, rArm, gun);
    camera.add(handsGroup); // Attach hands to camera so they move with view
}

function shoot() {
    if (!controls.isLocked) return;

    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00 })
    );
    
    // Start bullet at camera position
    bullet.position.copy(camera.position);
    
    // Get direction from camera
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    bullet.velocity = direction.clone().multiplyScalar(1.5);

    scene.add(bullet);
    bullets.push(bullet);
}

function spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
        const enemy = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
        
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mat);
        head.position.y = 1.2;
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1, 0.4), mat);
        body.position.y = 0.5;

        enemy.add(head, body);
        enemy.position.set(Math.random() * 40 - 20, 0, -Math.random() * 40 - 10);
        
        scene.add(enemy);
        enemies.push(enemy);
    }
}

function createBoobiDoodi() {
    const bobi = new THREE.Group();
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xA0522D }));
    head.position.y = 1;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.3), new THREE.MeshStandardMaterial({ color: 0x0000FF }));
    torso.position.y = 0.4;
    bobi.add(head, torso);
    bobi.position.set(0, 0, -15);
    scene.add(bobi);
}

function createPlatforms() {
    for (let i = 0; i < 10; i++) {
        const plat = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.5, 4),
            new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff })
        );
        plat.position.set(Math.random() * 30 - 15, Math.random() * 3, -i * 8);
        scene.add(plat);
        platforms.push(plat);
    }
}

function onKeyDown(event) {
    if (event.code === 'Space' && controls.isLocked) {
        camera.position.y += 1.5; 
        // Simple particle
        const halo = new THREE.Mesh(
            new THREE.RingGeometry(0.3, 0.5, 32),
            new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true })
        );
        halo.position.copy(camera.position);
        halo.rotation.x = Math.PI/2;
        scene.add(halo);
        haloParticles.push(halo);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (controls.isLocked) {
        // WASD Movement
        const speed = player.speed;
        if (keys['KeyW']) controls.moveForward(speed);
        if (keys['KeyS']) controls.moveForward(-speed);
        if (keys['KeyA']) controls.moveRight(-speed);
        if (keys['KeyD']) controls.moveRight(speed);
        
        // Gravity "Lite"
        if (camera.position.y > 1.6) camera.position.y -= 0.05;
    }

    // Enemies track player
    enemies.forEach(e => {
        const dir = new THREE.Vector3().subVectors(camera.position, e.position);
        dir.y = 0; // Keep them on ground
        e.position.add(dir.normalize().multiplyScalar(0.03));
        e.lookAt(camera.position.x, 0, camera.position.z);
    });

    // Update Bullets (safe removal)
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.position.add(b.velocity);

        if (b.position.distanceTo(camera.position) > 50) {
            scene.remove(b);
            bullets.splice(i, 1);
            continue;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
            if (b.position.distanceTo(enemies[j].position) < 1.2) {
                explodeEnemy(enemies[j].position);
                scene.remove(enemies[j]);
                enemies.splice(j, 1);
                scene.remove(b);
                bullets.splice(i, 1);
                break;
            }
        }
    }

    // Halo Fade
    for (let i = haloParticles.length - 1; i >= 0; i--) {
        const h = haloParticles[i];
        h.material.opacity -= 0.05;
        h.scale.multiplyScalar(1.05);
        if (h.material.opacity <= 0) {
            scene.remove(h);
            haloParticles.splice(i, 1);
        }
    }

    platforms.forEach((p, idx) => {
        p.position.y += Math.sin(Date.now() * 0.002 + idx) * 0.005;
    });

    renderer.render(scene, camera);
}

function explodeEnemy(pos) {
    for (let i = 0; i < 8; i++) {
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        cube.position.copy(pos);
        const vel = new THREE.Vector3((Math.random()-0.5), Math.random(), (Math.random()-0.5));
        scene.add(cube);
        
        let life = 0;
        const partInterval = setInterval(() => {
            cube.position.add(vel.clone().multiplyScalar(0.1));
            vel.y -= 0.02; // Gravity on debris
            life++;
            if(life > 20) {
                scene.remove(cube);
                clearInterval(partInterval);
            }
        }, 16);
    }
    }
                                            
