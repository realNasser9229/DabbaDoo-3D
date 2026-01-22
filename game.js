// =========================
// DabbaDoo Prototype - Blocky FPS
// =========================

let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];
let haloParticles = [];
let clock = new THREE.Clock();
let player = {};

init();
animate();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 1.6;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.PointerLockControls(camera, document.body);
    document.body.addEventListener('click', () => controls.lock());

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x555555);
    scene.add(ambient);

    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Neon Platforms
    createPlatforms();

    // Player Vulvian Hands + Gun
    createPlayerHands();

    // Boobasta Enemies
    spawnEnemies(5);

    // Boobi Doodi NPC
    createBoobiDoodi();

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', shoot);
    window.addEventListener('keydown', onKeyDown);

    // ======= FIX: Hide loading text when scene is ready =======
    const loadingText = document.getElementById("loading");
    if (loadingText) loadingText.style.display = "none";
}

// =========================
// PLAYER FUNCTIONS
// =========================
function createPlayerHands() {
    player.hands = new THREE.Group();

    // Left Arm
    const lArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.6, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    lArm.position.set(-0.25, -0.3, -0.5);
    player.hands.add(lArm);

    // Right Arm + Gun
    const rArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.6, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    rArm.position.set(0.25, -0.3, -0.5);
    player.hands.add(rArm);

    // Gun
    const gun = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 1),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    gun.position.set(0.25, -0.2, -1.0);
    player.hands.add(gun);

    camera.add(player.hands);
}

// =========================
// BULLETS
// =========================
function shoot() {
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    bullet.position.copy(camera.position);
    bullet.velocity = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(1.2);
    scene.add(bullet);
    bullets.push(bullet);
}

// =========================
// ENEMIES
// =========================
function spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
        const enemy = new THREE.Group();

        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        head.position.y = 1.1;
        enemy.add(head);

        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        body.position.y = 0.5;
        enemy.add(body);

        // Arms
        const lArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.8, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        lArm.position.set(-0.6, 0.7, 0);
        enemy.add(lArm);

        const rArm = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.8, 0.2),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        );
        rArm.position.set(0.6, 0.7, 0);
        enemy.add(rArm);

        // Position
        enemy.position.set(Math.random() * 20 - 10, 0, -Math.random() * 20 - 10);

        scene.add(enemy);
        enemies.push(enemy);
    }
}

// =========================
// BOOBI DOODI NPC
// =========================
function createBoobiDoodi() {
    const bobi = new THREE.Group();

    // Head
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xA0522D }) // brown
    );
    head.position.y = 1;
    bobi.add(head);

    // Torso
    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 0.3),
        new THREE.MeshStandardMaterial({ color: 0x0000FF }) // blue jacket
    );
    torso.position.y = 0.4;
    bobi.add(torso);

    bobi.position.set(0, 0, -25);
    scene.add(bobi);

    player.bobi = bobi;
}

// =========================
// NEON PLATFORMS
// =========================
let platforms = [];
function createPlatforms() {
    for (let i = 0; i < 10; i++) {
        const plat = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.2, 3),
            new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0xff0000 : 0x00ff00 })
        );
        plat.position.set(Math.random() * 20 - 10, Math.random() * 2, -i * 5);
        scene.add(plat);
