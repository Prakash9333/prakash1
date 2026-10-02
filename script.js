/**
 * PRAKASH 3D ADVENTURE
 * High-performance 3D Endless Runner featuring Prakash
 * Powered by Three.js & Web Audio API
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. GAME CONFIGURATION & SPEED PRESETS
       ========================================================================== */
    const SPEED_PRESETS = {
        slow: {
            BASE_SPEED: 14,      // Low relaxed speed for smooth, easy gameplay!
            MAX_SPEED: 26,       // Gentle maximum speed
            SPEED_ACCEL: 0.03,   // Slow gradual acceleration
            JUMP_FORCE: 13.5,    // Floaty, comfortable jump
            GRAVITY: -32,
            NAME: 'SLOW (EASY)'
        },
        normal: {
            BASE_SPEED: 20,
            MAX_SPEED: 38,
            SPEED_ACCEL: 0.06,
            JUMP_FORCE: 14.0,
            GRAVITY: -35,
            NAME: 'NORMAL'
        },
        fast: {
            BASE_SPEED: 28,
            MAX_SPEED: 52,
            SPEED_ACCEL: 0.10,
            JUMP_FORCE: 14.5,
            GRAVITY: -38,
            NAME: 'FAST'
        }
    };

    const CONFIG = {
        LANES: [-3.2, 0, 3.2], // Left, Center, Right lanes
        LANE_SPEED_LERP: 14,   // How smoothly player shifts lanes
        BASE_SPEED: 14,        // Lowered default speed (units/sec)
        MAX_SPEED: 26,         // Lowered maximum speed cap
        SPEED_ACCEL: 0.03,     // Very gentle speed increase per second
        JUMP_FORCE: 13.5,      // Upward jump velocity
        GRAVITY: -32,          // Floaty gravity for easy obstacle clearance
        CHUNK_LENGTH: 80,      // Length of each road chunk
        TOTAL_CHUNKS: 7,       // Number of active road chunks in memory
        BUILDINGS_PER_CHUNK: 8,
        BILLBOARDS_PER_CHUNK: 2,
        OBSTACLE_SPAWN_INTERVAL: 22, // Distance between obstacle spawns
        DIAMOND_VALUE: 10,
        POWERUP_DURATION: 10,  // seconds
        PHOTOS: {
            photo1: 'assets/prakash1.jpg',
            photo2: 'assets/prakash2.jpg'
        }
    };

    /* ==========================================================================
       2. SOUND SYNTHESIZER (WEB AUDIO API) - ZERO EXTERNAL ASSETS NEEDED
       ========================================================================== */
    class CyberSound {
        constructor() {
            this.ctx = null;
            this.muted = false;
            this.musicPlaying = false;
            this.musicTimer = null;
            this.musicStep = 0;
            this.scale = [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00]; // D-minor synthwave
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggleMute() {
            this.muted = !this.muted;
            if (this.muted) {
                this.stopMusic();
            } else {
                this.startMusic();
            }
            return !this.muted;
        }

        playJump() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.23);
            } catch (e) { }
        }

        playDiamond() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6
                notes.forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                    gain.gain.setValueAtTime(0.18, now + idx * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.04 + 0.2);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.04);
                    osc.stop(now + idx * 0.04 + 0.22);
                });
            } catch (e) { }
        }

        playPowerup() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const chord = [293.66, 369.99, 440.00, 587.33];
                chord.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + i * 0.06);
                    gain.gain.setValueAtTime(0.15, now + i * 0.06);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.35);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.06);
                    osc.stop(now + i * 0.06 + 0.38);
                });
            } catch (e) { }
        }

        playShieldBreak() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.27);
            } catch (e) { }
        }

        playCrash() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.56);
            } catch (e) { }
        }

        startMusic() {
            if (this.muted || this.musicPlaying || !this.ctx) return;
            this.musicPlaying = true;
            this.musicStep = 0;
            const tempo = 132;
            const stepTime = (60 / tempo) / 2 * 1000; // 16th notes

            const bassline = [73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 110.00, 98.00];
            const leadNotes = [293.66, 0, 349.23, 392.00, 440.00, 392.00, 349.23, 293.66, 587.33, 523.25, 440.00, 392.00, 349.23, 293.66, 261.63, 293.66];

            this.musicTimer = setInterval(() => {
                if (this.muted || !this.musicPlaying || !this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    // Bass pulse
                    const bassFreq = bassline[this.musicStep % bassline.length];
                    const bassOsc = this.ctx.createOscillator();
                    const bassGain = this.ctx.createGain();
                    bassOsc.type = 'sawtooth';
                    bassOsc.frequency.setValueAtTime(bassFreq, now);
                    bassGain.gain.setValueAtTime(0.08, now);
                    bassGain.gain.exponentialRampToValueAtTime(0.005, now + 0.14);
                    bassOsc.connect(bassGain);
                    bassGain.connect(this.ctx.destination);
                    bassOsc.start(now);
                    bassOsc.stop(now + 0.15);

                    // Lead Melody
                    const note = leadNotes[this.musicStep % leadNotes.length];
                    if (note > 0 && this.musicStep % 2 === 0) {
                        const leadOsc = this.ctx.createOscillator();
                        const leadGain = this.ctx.createGain();
                        leadOsc.type = 'sine';
                        leadOsc.frequency.setValueAtTime(note, now);
                        leadGain.gain.setValueAtTime(0.045, now);
                        leadGain.gain.exponentialRampToValueAtTime(0.002, now + 0.22);
                        leadOsc.connect(leadGain);
                        leadGain.connect(this.ctx.destination);
                        leadOsc.start(now);
                        leadOsc.stop(now + 0.24);
                    }

                    this.musicStep++;
                } catch (e) { }
            }, stepTime);
        }

        stopMusic() {
            this.musicPlaying = false;
            if (this.musicTimer) {
                clearInterval(this.musicTimer);
                this.musicTimer = null;
            }
        }
    }

    /* ==========================================================================
       3. TEXTURE & PHOTO MANAGER
       Handles Prakash's photos with aspect ratio preservation & fallbacks
       ========================================================================== */
    class PhotoManager {
        constructor() {
            this.textures = { 1: null, 2: null };
            this.loaded = false;
            this.aspectRatio = 682 / 1024; // ~0.666 vertical portrait
        }

        loadTextures(renderer, onComplete) {
            const textureLoader = new THREE.TextureLoader();
            const maxAniso = renderer.capabilities ? renderer.capabilities.getMaxAnisotropy() : 4;

            const getUrl = (index) => {
                if (window.PRAKASH_PHOTOS) {
                    if (window.location.protocol === 'file:') {
                        return index === 1 ? window.PRAKASH_PHOTOS.photo1 : window.PRAKASH_PHOTOS.photo2;
                    }
                    return index === 1 ? window.PRAKASH_PHOTOS.file1 : window.PRAKASH_PHOTOS.file2;
                }
                return index === 1 ? CONFIG.PHOTOS.photo1 : CONFIG.PHOTOS.photo2;
            };

            const url1 = getUrl(1);
            const url2 = getUrl(2);

            let count = 0;
            const checkDone = () => {
                count++;
                if (count >= 2) {
                    this.loaded = true;
                    if (onComplete) onComplete();
                }
            };

            const setupTexture = (tex) => {
                tex.generateMipmaps = true;
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.anisotropy = maxAniso;
                return tex;
            };

            this.textures[1] = textureLoader.load(url1, (tex) => {
                setupTexture(tex);
                checkDone();
            }, undefined, () => {
                // If failed, use fallback base64
                if (window.PRAKASH_PHOTOS && window.PRAKASH_PHOTOS.photo1) {
                    this.textures[1] = textureLoader.load(window.PRAKASH_PHOTOS.photo1, setupTexture);
                }
                checkDone();
            });

            this.textures[2] = textureLoader.load(url2, (tex) => {
                setupTexture(tex);
                checkDone();
            }, undefined, () => {
                // If failed, use fallback base64
                if (window.PRAKASH_PHOTOS && window.PRAKASH_PHOTOS.photo2) {
                    this.textures[2] = textureLoader.load(window.PRAKASH_PHOTOS.photo2, setupTexture);
                }
                checkDone();
            });
        }

        getTexture(index) {
            return this.textures[index] || this.textures[1];
        }
    }

    /* ==========================================================================
       4. PROCEDURAL CANVAS TEXTURE GENERATOR (CYBER HIGHWAY & SKYSCRAPERS)
       ========================================================================== */
    class CyberTextureGen {
        static createRoadTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            // Dark cyber asphalt
            ctx.fillStyle = '#0a0f24';
            ctx.fillRect(0, 0, 512, 512);

            // Subtle cyber grid lines
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let y = 0; y < 512; y += 32) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(512, y);
                ctx.stroke();
            }

            // Glowing cyan lane markers (dashed)
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            const lane1X = 512 * 0.33;
            const lane2X = 512 * 0.67;

            for (let y = 16; y < 512; y += 64) {
                ctx.fillRect(lane1X - 3, y, 6, 32);
                ctx.fillRect(lane2X - 3, y, 6, 32);
            }

            // Side guardrail neon lines
            ctx.fillStyle = '#b026ff';
            ctx.shadowColor = '#b026ff';
            ctx.shadowBlur = 12;
            ctx.fillRect(8, 0, 8, 512);
            ctx.fillRect(512 - 16, 0, 8, 512);

            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }

        static createBuildingTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            // Dark metallic building facade
            ctx.fillStyle = '#080d21';
            ctx.fillRect(0, 0, 256, 512);

            // Glowing office windows in cyber colors
            const winColors = ['#00f0ff', '#b026ff', '#ffd700', '#ffffff', '#0a1a3a'];
            for (let y = 16; y < 496; y += 22) {
                for (let x = 16; x < 240; x += 22) {
                    if (Math.random() > 0.3) {
                        const col = winColors[Math.floor(Math.random() * winColors.length)];
                        ctx.fillStyle = col;
                        ctx.shadowColor = col;
                        ctx.shadowBlur = col === '#0a1a3a' ? 0 : 4;
                        ctx.fillRect(x, y, 12, 14);
                    }
                }
            }

            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }

        static createTextSignTexture(text, subtitle) {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#060a1d';
            ctx.fillRect(0, 0, 512, 128);

            // Glowing border
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 6;
            ctx.strokeRect(6, 6, 500, 116);

            // Neon glowing text
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 18;
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 46px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 256, 52);

            if (subtitle) {
                ctx.shadowColor = '#b026ff';
                ctx.shadowBlur = 12;
                ctx.fillStyle = '#00f0ff';
                ctx.font = '700 20px Orbitron, sans-serif';
                ctx.fillText(subtitle, 256, 96);
            }

            const tex = new THREE.CanvasTexture(canvas);
            return tex;
        }
    }

    /* ==========================================================================
       5. 3D GAME ENGINE CLASS
       ========================================================================== */
    class Game {
        constructor() {
            this.container = document.getElementById('game-container');
            this.sound = new CyberSound();
            this.photoManager = new PhotoManager();
            this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
            this.activePilot = 1; // 1 or 2
            this.currentSpeedMode = 'slow'; // Default to low relaxed speed!

            // Gameplay Variables
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('prakash_highscore') || '0', 10);
            this.diamonds = 0;
            this.distance = 0;
            this.speed = CONFIG.BASE_SPEED;
            this.multiplier = 1;
            this.currentLane = 1; // 0 = Left, 1 = Center, 2 = Right
            this.targetX = CONFIG.LANES[1];
            this.playerY = 0;
            this.playerVy = 0;
            this.isGrounded = true;
            this.isRolling = false;
            this.rollTimer = 0;

            // Power-ups state
            this.powerup = null; // 'shield', 'magnet', 'nitro'
            this.powerupTimeLeft = 0;

            // Camera animation
            this.cameraShake = 0;

            // 3D Objects Pools
            this.chunks = [];
            this.obstacles = [];
            this.collectibles = [];
            this.floatingTextList = [];
            this.billboardMeshes = [];
            this.skyVehicles = [];

            // Clock & Timing
            this.clock = new THREE.Clock();

            // Setup UI Elements references
            this.setupUIReferences();

            // Initialize Three.js
            this.initThree();

            // Build Scene & World
            this.buildWorld();

            // Bind User Inputs
            this.bindEvents();

            // Load Photos into textures
            this.photoManager.loadTextures(this.renderer, () => {
                this.updateBillboardTextures();
            });

            // Start Animation Loop
            this.animate = this.animate.bind(this);
            requestAnimationFrame(this.animate);
        }

        setupUIReferences() {
            this.ui = {
                startScreen: document.getElementById('start-screen'),
                pauseScreen: document.getElementById('pause-screen'),
                gameoverScreen: document.getElementById('gameover-screen'),
                instructionsModal: document.getElementById('instructions-modal'),
                hud: document.getElementById('hud'),
                hudScore: document.getElementById('hud-score'),
                hudMultiplier: document.getElementById('hud-multiplier'),
                hudDiamonds: document.getElementById('hud-diamonds'),
                hudAvatarImg: document.getElementById('hud-avatar-img'),
                menuHighScore: document.getElementById('menu-high-score'),
                powerupHud: document.getElementById('powerup-hud'),
                powerupIcon: document.getElementById('powerup-icon'),
                powerupName: document.getElementById('powerup-name'),
                powerupFill: document.getElementById('powerup-meter-fill'),
                hudToast: document.getElementById('hud-toast'),
                goScore: document.getElementById('go-score'),
                goHighScore: document.getElementById('go-high-score'),
                goNewRecord: document.getElementById('go-new-record'),
                goDiamonds: document.getElementById('go-diamonds'),
                goDistance: document.getElementById('go-distance'),
                goAvatarImg: document.getElementById('gameover-avatar-img'),
                soundIconStart: document.getElementById('sound-icon-start'),
                soundIconHud: document.getElementById('sound-icon-hud'),
                cardPhoto1: document.getElementById('card-photo-1'),
                cardPhoto2: document.getElementById('card-photo-2'),
                btnStart: document.getElementById('btn-start'),
                btnHowToPlay: document.getElementById('btn-how-to-play'),
                btnCloseInstructions: document.getElementById('btn-close-instructions'),
                btnSoundStart: document.getElementById('btn-sound-start'),
                btnSoundHud: document.getElementById('btn-sound-hud'),
                btnPause: document.getElementById('btn-pause'),
                btnResume: document.getElementById('btn-resume'),
                btnRestartPause: document.getElementById('btn-restart-pause'),
                btnMenuPause: document.getElementById('btn-menu-pause'),
                btnReplay: document.getElementById('btn-replay'),
                btnMenuGo: document.getElementById('btn-menu-go'),
                touchLeft: document.getElementById('touch-left'),
                touchJump: document.getElementById('touch-jump'),
                touchRight: document.getElementById('touch-right')
            };

            this.ui.menuHighScore.textContent = this.highScore.toLocaleString();
        }

        initThree() {
            // Renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.15;
            this.container.appendChild(this.renderer.domElement);

            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x050814);
            this.scene.fog = new THREE.FogExp2(0x050814, 0.0095);

            // Camera
            this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 450);
            this.camera.position.set(0, 4.8, 8.5);
            this.camera.lookAt(0, 1.8, -12);

            // Lighting
            this.ambientLight = new THREE.AmbientLight(0x283b5e, 0.85);
            this.scene.add(this.ambientLight);

            this.dirLight = new THREE.DirectionalLight(0xdff0ff, 1.25);
            this.dirLight.position.set(15, 35, 20);
            this.dirLight.castShadow = true;
            this.dirLight.shadow.mapSize.width = 1024;
            this.dirLight.shadow.mapSize.height = 1024;
            this.dirLight.shadow.camera.near = 0.5;
            this.dirLight.shadow.camera.far = 100;
            this.dirLight.shadow.camera.left = -20;
            this.dirLight.shadow.camera.right = 20;
            this.dirLight.shadow.camera.top = 20;
            this.dirLight.shadow.camera.bottom = -20;
            this.scene.add(this.dirLight);

            // Neon dynamic point lights tracking player
            this.playerLightCyan = new THREE.PointLight(0x00f0ff, 2.8, 30);
            this.playerLightCyan.position.set(-2, 3, 0);
            this.scene.add(this.playerLightCyan);

            this.playerLightPurple = new THREE.PointLight(0xb026ff, 2.5, 30);
            this.playerLightPurple.position.set(2, 3, 0);
            this.scene.add(this.playerLightPurple);
        }

        buildWorld() {
            // Reusable Geometries and Materials
            this.sharedRoadTex = CyberTextureGen.createRoadTexture();
            this.sharedRoadTex.repeat.set(1, 4);

            this.sharedBuildingTex = CyberTextureGen.createBuildingTexture();
            this.sharedBuildingTex.repeat.set(1, 2);

            this.roadMaterial = new THREE.MeshStandardMaterial({
                map: this.sharedRoadTex,
                roughness: 0.35,
                metalness: 0.6
            });

            this.buildingMaterial = new THREE.MeshStandardMaterial({
                map: this.sharedBuildingTex,
                roughness: 0.2,
                metalness: 0.8
            });

            this.neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
            this.neonPurpleMat = new THREE.MeshBasicMaterial({ color: 0xb026ff });
            this.neonPinkMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
            this.neonGoldMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

            // Build Starfield & Sky Ambience
            this.buildStarfield();

            // Build Flying Cyber Vehicles in Sky
            this.buildSkyVehicles();

            // Build Grand Entrance Archway with Prakash Billboards
            this.buildGrandArchway();

            // Build Player Character
            this.buildPlayer();

            // Build Initial Road Chunks
            for (let i = 0; i < CONFIG.TOTAL_CHUNKS; i++) {
                const zPos = -i * CONFIG.CHUNK_LENGTH;
                this.createChunk(zPos, i === 0);
            }
        }

        buildStarfield() {
            const starGeo = new THREE.BufferGeometry();
            const starCount = 600;
            const positions = new Float32Array(starCount * 3);
            for (let i = 0; i < starCount * 3; i += 3) {
                positions[i] = (Math.random() - 0.5) * 350;
                positions[i + 1] = Math.random() * 90 + 10;
                positions[i + 2] = (Math.random() - 0.5) * 450;
            }
            starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const starMat = new THREE.PointsMaterial({
                color: 0x88ccff,
                size: 1.5,
                transparent: true,
                opacity: 0.85
            });
            this.starField = new THREE.Points(starGeo, starMat);
            this.scene.add(this.starField);
        }

        buildSkyVehicles() {
            for (let i = 0; i < 5; i++) {
                const vGroup = new THREE.Group();
                const bodyMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f0ff : 0xff007f });
                const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.8), bodyMat);
                vGroup.add(body);

                // Trail light
                const light = new THREE.PointLight(bodyMat.color, 1.5, 20);
                vGroup.add(light);

                vGroup.position.set(
                    (Math.random() - 0.5) * 120,
                    25 + Math.random() * 30,
                    -50 - Math.random() * 200
                );
                vGroup.userData = {
                    speed: 20 + Math.random() * 25,
                    direction: Math.random() > 0.5 ? 1 : -1
                };

                this.skyVehicles.push(vGroup);
                this.scene.add(vGroup);
            }
        }

        buildPlayer() {
            this.playerGroup = new THREE.Group();
            this.playerGroup.position.set(0, 0, 0);

            // Sleek Cyber Speeder Chassis
            const bodyGeo = new THREE.BoxGeometry(1.4, 0.55, 2.4);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0x0d1c3b,
                metalness: 0.85,
                roughness: 0.2
            });
            this.playerBody = new THREE.Mesh(bodyGeo, bodyMat);
            this.playerBody.position.y = 0.55;
            this.playerBody.castShadow = true;
            this.playerGroup.add(this.playerBody);

            // Cockpit Canopy (Glowing Visor)
            const visorGeo = new THREE.BoxGeometry(0.9, 0.35, 1.2);
            const visorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
            const visor = new THREE.Mesh(visorGeo, visorMat);
            visor.position.set(0, 0.8, -0.15);
            this.playerGroup.add(visor);

            // Neon Trims along chassis
            const trimLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.4), this.neonCyanMat);
            trimLeft.position.set(-0.7, 0.6, 0);
            this.playerGroup.add(trimLeft);

            const trimRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.4), this.neonCyanMat);
            trimRight.position.set(0.7, 0.6, 0);
            this.playerGroup.add(trimRight);

            // Twin Rear Thrusters with glowing exhaust
            const thrusterGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.5, 12);
            thrusterGeo.rotateX(Math.PI / 2);
            const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff007f });

            const thrustLeft = new THREE.Mesh(thrusterGeo, thrusterMat);
            thrustLeft.position.set(-0.45, 0.45, 1.25);
            this.playerGroup.add(thrustLeft);

            const thrustRight = new THREE.Mesh(thrusterGeo, thrusterMat);
            thrustRight.position.set(0.45, 0.45, 1.25);
            this.playerGroup.add(thrustRight);

            // Floating Companion Cyber Drone
            this.drone = new THREE.Group();
            const droneCore = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), this.neonCyanMat);
            this.drone.add(droneCore);

            const droneRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.42, 0.04, 8, 20),
                this.neonPurpleMat
            );
            droneRing.rotation.x = Math.PI / 3;
            this.droneRing = droneRing;
            this.drone.add(droneRing);

            this.drone.position.set(0.9, 1.8, 0.4);
            this.playerGroup.add(this.drone);

            // Shield Bubble (Translucent Geodesic Energy Sphere)
            const shieldGeo = new THREE.IcosahedronGeometry(1.6, 2);
            this.shieldMat = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                transparent: true,
                opacity: 0,
                wireframe: true
            });
            this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
            this.shieldMesh.position.y = 0.8;
            this.playerGroup.add(this.shieldMesh);

            this.scene.add(this.playerGroup);
        }

        buildGrandArchway() {
            // Grand Cyber Triumphal Arch at Start of track
            const arch = new THREE.Group();
            arch.position.set(0, 0, -26);

            // Left & Right Tower Columns
            const colGeo = new THREE.BoxGeometry(3.5, 24, 3.5);
            const colMat = new THREE.MeshStandardMaterial({
                color: 0x0a1029,
                metalness: 0.85,
                roughness: 0.25
            });

            const colLeft = new THREE.Mesh(colGeo, colMat);
            colLeft.position.set(-9.5, 12, 0);
            arch.add(colLeft);

            const colRight = new THREE.Mesh(colGeo, colMat);
            colRight.position.set(9.5, 12, 0);
            arch.add(colRight);

            // Overhead Span
            const spanGeo = new THREE.BoxGeometry(22.5, 3.2, 4);
            const span = new THREE.Mesh(spanGeo, colMat);
            span.position.set(0, 20.5, 0);
            arch.add(span);

            // Glowing Marquee Sign: "PRAKASH 3D ADVENTURE"
            const signTex = CyberTextureGen.createTextSignTexture('PRAKASH', '3D ADVENTURE');
            const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
            const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.4), signMat);
            signMesh.position.set(0, 20.5, 2.2);
            arch.add(signMesh);

            // GIGANTIC PRAKASH PHOTO BILLBOARD RIGHT IN THE CENTER (BICH ME)!
            const centerBB = this.createBillboardMesh(1, 8.5, 12.75);
            centerBB.position.set(0, 11.5, 1.2);
            arch.add(centerBB);
            this.billboardMeshes.push(centerBB);

            this.scene.add(arch);
            this.grandArch = arch;
        }

        createBillboardMesh(photoIndex, width = 8.5, height = 12.75) {
            const bbGroup = new THREE.Group();

            // Screen Frame
            const frameGeo = new THREE.BoxGeometry(width + 0.8, height + 0.8, 0.45);
            const frameMat = new THREE.MeshStandardMaterial({
                color: 0x070c20,
                metalness: 0.9,
                roughness: 0.2
            });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            bbGroup.add(frame);

            // Glowing Neon Borders
            const borderMat = photoIndex === 1 ? this.neonCyanMat : this.neonPurpleMat;
            const topBar = new THREE.Mesh(new THREE.BoxGeometry(width + 0.9, 0.25, 0.5), borderMat);
            topBar.position.y = (height + 0.8) / 2;
            bbGroup.add(topBar);

            const botBar = new THREE.Mesh(new THREE.BoxGeometry(width + 0.9, 0.25, 0.5), borderMat);
            botBar.position.y = -(height + 0.8) / 2;
            bbGroup.add(botBar);

            const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.25, height + 0.8, 0.5), borderMat);
            leftBar.position.x = -(width + 0.8) / 2;
            bbGroup.add(leftBar);

            const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.25, height + 0.8, 0.5), borderMat);
            rightBar.position.x = (width + 0.8) / 2;
            bbGroup.add(rightBar);

            // Photo Plane - MeshBasicMaterial: original natural colors, no lighting effect, no tint!
            const planeGeo = new THREE.PlaneGeometry(width, height);
            const photoTexture = this.photoManager.getTexture(photoIndex);
            const photoMat = new THREE.MeshBasicMaterial({
                map: photoTexture
                // No emissive, no metalness, no roughness — photo dikhega bilkul asal jaisa!
            });

            const photoMesh = new THREE.Mesh(planeGeo, photoMat);
            photoMesh.position.z = 0.25;
            bbGroup.add(photoMesh);

            // Top Header Sign: "PRAKASH"
            const nameTex = CyberTextureGen.createTextSignTexture('PRAKASH', photoIndex === 1 ? 'BRIDGE EXPLORER' : 'SKYLINE MASTER');
            const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true });
            const nameMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.8), nameMat);
            nameMesh.position.set(0, (height / 2) + 1.25, 0.25);
            bbGroup.add(nameMesh);

            // Neutral white light — no color tint on photo!
            const spot = new THREE.PointLight(0xffffff, 0.6, 20);
            spot.position.set(0, 2, 5);
            bbGroup.add(spot);

            bbGroup.userData = {
                photoIndex: photoIndex,
                photoMesh: photoMesh,
                spotLight: spot
            };

            return bbGroup;
        }

        createCenterArchMesh(photoIndex) {
            const bridgeGroup = new THREE.Group();

            // Support Pillars Left and Right
            const pillarGeo = new THREE.BoxGeometry(2.8, 22, 2.8);
            const pillarMat = new THREE.MeshStandardMaterial({
                color: 0x091129,
                metalness: 0.85,
                roughness: 0.25
            });
            const pL = new THREE.Mesh(pillarGeo, pillarMat);
            pL.position.set(-9.2, 11, 0);
            bridgeGroup.add(pL);

            const pR = new THREE.Mesh(pillarGeo, pillarMat);
            pR.position.set(9.2, 11, 0);
            bridgeGroup.add(pR);

            // Overhead Span beam
            const spanGeo = new THREE.BoxGeometry(21.2, 2.4, 3.2);
            const span = new THREE.Mesh(spanGeo, pillarMat);
            span.position.set(0, 20.2, 0);
            bridgeGroup.add(span);

            // Neon underside lights
            const underLightMat = photoIndex === 1 ? this.neonCyanMat : this.neonPurpleMat;
            const underBeam = new THREE.Mesh(new THREE.BoxGeometry(20.5, 0.35, 0.4), underLightMat);
            underBeam.position.set(0, 19.0, 0);
            bridgeGroup.add(underBeam);

            // GIGANTIC PRAKASH PHOTO BILLBOARD RIGHT IN CENTER (BICH ME)!
            const bb = this.createBillboardMesh(photoIndex, 8.5, 12.75);
            bb.position.set(0, 11.5, 0.2);
            bridgeGroup.add(bb);
            this.billboardMeshes.push(bb);

            bridgeGroup.userData = { isCenterArch: true, photoIndex: photoIndex };
            return bridgeGroup;
        }

        createSkybridgeMesh(photoIndex) {
            return this.createCenterArchMesh(photoIndex);
        }

        // ===== SIDE BLACK AREA MEIN BADE BADE PHOTOS =====
        // Highway ke dono taraf kali jagah mein giant Prakash photo panels!
        addSidePhotoWalls(chunk, chunkIndex, zPos) {
            const photoTex1 = this.photoManager.getTexture(1);
            const photoTex2 = this.photoManager.getTexture(2);

            // Photo dimensions — portrait ratio 682:1024 = 0.666
            // Side wall pe kaafi bada: 12 wide x 18 tall (metres)
            const PW = 12;   // width in 3D units
            const PH = 18;   // height in 3D units

            // Alternating: odd chunks = photo1 left + photo2 right, even = photo2 left + photo1 right
            const texLeft  = (chunkIndex % 2 === 0) ? photoTex1 : photoTex2;
            const texRight = (chunkIndex % 2 === 0) ? photoTex2 : photoTex1;

            const makeSidePanel = (texture, xPos, facingRight) => {
                const group = new THREE.Group();

                // Glowing neon frame behind photo
                const frameMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
                const frameT = new THREE.Mesh(new THREE.BoxGeometry(PW + 1.2, 0.5, 0.3), frameMat);
                frameT.position.y = PH / 2 + 0.5;
                group.add(frameT);
                const frameB = new THREE.Mesh(new THREE.BoxGeometry(PW + 1.2, 0.5, 0.3), frameMat);
                frameB.position.y = -PH / 2 - 0.1;
                group.add(frameB);
                const frameMat2 = new THREE.MeshBasicMaterial({ color: 0xff00cc });
                const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.5, PH + 1.2, 0.3), frameMat2);
                frameL.position.x = -PW / 2 - 0.3;
                group.add(frameL);
                const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.5, PH + 1.2, 0.3), frameMat2);
                frameR.position.x = PW / 2 + 0.3;
                group.add(frameR);

                // BLACK background panel behind photo (dark backing)
                const backMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
                const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(PW + 0.2, PH + 0.2), backMat);
                backPlane.position.z = -0.05;
                group.add(backPlane);

                // PHOTO PANEL — MeshBasicMaterial: exact original colors, no tint!
                const photoMat = new THREE.MeshBasicMaterial({ map: texture });
                const photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), photoMat);
                photoPlane.position.z = 0.1;
                group.add(photoPlane);

                // Name label below photo
                const labelTex = CyberTextureGen.createTextSignTexture('PRAKASH', 'ADVENTURE');
                const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, transparent: true });
                const label = new THREE.Mesh(new THREE.PlaneGeometry(PW, 2.5), labelMat);
                label.position.set(0, -(PH / 2) - 1.6, 0.1);
                group.add(label);

                // Position & rotate to face inward toward road
                group.position.set(xPos, PH / 2 + 0.5, -CONFIG.CHUNK_LENGTH * 0.5);
                if (facingRight) {
                    group.rotation.y = Math.PI / 2;  // left side panel faces right (toward road)
                } else {
                    group.rotation.y = -Math.PI / 2; // right side panel faces left (toward road)
                }

                return group;
            };

            // Left side: X = -22 (deep in the black zone, clearly visible), facing road
            const leftPanel = makeSidePanel(texLeft, -22, true);
            chunk.add(leftPanel);

            // Right side: X = +22, facing road
            const rightPanel = makeSidePanel(texRight, 22, false);
            chunk.add(rightPanel);
        }

        updateBillboardTextures() {
            this.billboardMeshes.forEach(bb => {
                if (bb.userData && bb.userData.photoMesh) {
                    const tex = this.photoManager.getTexture(bb.userData.photoIndex);
                    if (tex) {
                        bb.userData.photoMesh.material.map = tex;
                        bb.userData.photoMesh.material.needsUpdate = true;
                    }
                }
            });
        }

        createChunk(zPos, isFirstChunk = false) {
            const chunk = new THREE.Group();
            chunk.position.z = zPos;

            // 1. Road Segment
            const roadGeo = new THREE.PlaneGeometry(12, CONFIG.CHUNK_LENGTH);
            roadGeo.rotateX(-Math.PI / 2);
            const road = new THREE.Mesh(roadGeo, this.roadMaterial);
            road.position.set(0, 0, -CONFIG.CHUNK_LENGTH / 2);
            road.receiveShadow = true;
            chunk.add(road);

            // Glowing curb edge rails
            const railGeo = new THREE.BoxGeometry(0.4, 0.5, CONFIG.CHUNK_LENGTH);
            const railLeft = new THREE.Mesh(railGeo, this.neonCyanMat);
            railLeft.position.set(-6, 0.25, -CONFIG.CHUNK_LENGTH / 2);
            chunk.add(railLeft);

            const railRight = new THREE.Mesh(railGeo, this.neonCyanMat);
            railRight.position.set(6, 0.25, -CONFIG.CHUNK_LENGTH / 2);
            chunk.add(railRight);

            // 2. Skyscrapers flanking the highway
            for (let b = 0; b < CONFIG.BUILDINGS_PER_CHUNK; b++) {
                const isLeft = b % 2 === 0;
                const bWidth = 8 + Math.random() * 8;
                const bDepth = 12 + Math.random() * 12;
                const bHeight = 25 + Math.random() * 50;

                const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
                const building = new THREE.Mesh(bGeo, this.buildingMaterial);

                const xOffset = isLeft ? -13 - (bWidth / 2) - Math.random() * 12 : 13 + (bWidth / 2) + Math.random() * 12;
                const zOffset = -Math.random() * CONFIG.CHUNK_LENGTH;

                building.position.set(xOffset, bHeight / 2, zOffset);
                building.castShadow = true;
                building.receiveShadow = true;
                chunk.add(building);

                // Roof neon trim & antenna beacon
                const beaconGeo = new THREE.CylinderGeometry(0.1, 0.2, 4, 6);
                const beacon = new THREE.Mesh(beaconGeo, this.neonPinkMat);
                beacon.position.set(xOffset, bHeight + 2, zOffset);
                chunk.add(beacon);
            }

            // 3. GIGANTIC CENTER ARCHWAY BILLBOARDS OF PRAKASH (BICH ME - RIGHT IN THE CENTER)
            if (!isFirstChunk) {
                const chunkIndex = Math.abs(Math.round(zPos / CONFIG.CHUNK_LENGTH));
                const photoIdx = (chunkIndex % 2) + 1; // Alternates Photo 1 & Photo 2
                const centerArch = this.createCenterArchMesh(photoIdx);
                centerArch.position.set(0, 0, -CONFIG.CHUNK_LENGTH * 0.5);
                chunk.add(centerArch);

                // ===== SIDE BLACK AREA MEIN BADE BADE PHOTOS =====
                // Highway ke dono taraf (black side areas) mein giant flat photo panels
                this.addSidePhotoWalls(chunk, chunkIndex, zPos);
            }

            // 4. Spawn Obstacles & Collectibles inside chunk
            if (!isFirstChunk) {
                this.populateChunkContents(chunk);
            }

            this.scene.add(chunk);
            this.chunks.push(chunk);
        }

        populateChunkContents(chunk) {
            const zLength = CONFIG.CHUNK_LENGTH;
            const segments = 3; // 3 segments per chunk

            for (let s = 1; s <= segments; s++) {
                const zLocal = -(s / (segments + 1)) * zLength;
                const pattern = Math.floor(Math.random() * 5);

                // Choose a lane for obstacle or collectibles
                const obsLane = Math.floor(Math.random() * 3);
                const obsX = CONFIG.LANES[obsLane];

                if (pattern === 0 || pattern === 1) {
                    // Low Laser Barrier (Jumpable)
                    const obs = this.createObstacle('laser', obsX, 0, zLocal);
                    chunk.add(obs);
                    this.obstacles.push(obs);

                    // Place an arc of diamonds over the jumpable barrier!
                    for (let d = -1; d <= 1; d++) {
                        const diam = this.createDiamond(obsX, 1.6 + Math.cos(d) * 1.6, zLocal + d * 3.5);
                        chunk.add(diam);
                        this.collectibles.push(diam);
                    }
                } else if (pattern === 2) {
                    // Tall Energy Monolith (Must switch lanes)
                    const obs = this.createObstacle('pillar', obsX, 0, zLocal);
                    chunk.add(obs);
                    this.obstacles.push(obs);

                    // Place diamonds in free lane
                    const freeLane = (obsLane + 1) % 3;
                    for (let d = 0; d < 3; d++) {
                        const diam = this.createDiamond(CONFIG.LANES[freeLane], 1.2, zLocal + (d - 1) * 3);
                        chunk.add(diam);
                        this.collectibles.push(diam);
                    }
                } else if (pattern === 3) {
                    // Double Obstacle (leaving 1 escape lane)
                    const escapeLane = Math.floor(Math.random() * 3);
                    for (let l = 0; l < 3; l++) {
                        if (l !== escapeLane) {
                            const obs = this.createObstacle('block', CONFIG.LANES[l], 0, zLocal);
                            chunk.add(obs);
                            this.obstacles.push(obs);
                        } else {
                            // Collectibles in the open lane!
                            const diam = this.createDiamond(CONFIG.LANES[l], 1.2, zLocal);
                            chunk.add(diam);
                            this.collectibles.push(diam);
                        }
                    }
                } else {
                    // Power-up or Diamond Trail
                    const lane = Math.floor(Math.random() * 3);
                    if (Math.random() < 0.25) {
                        // Spawn a power-up (Magnet, Shield, or Nitro)
                        const puTypes = ['magnet', 'shield', 'nitro'];
                        const puType = puTypes[Math.floor(Math.random() * puTypes.length)];
                        const pu = this.createPowerup(puType, CONFIG.LANES[lane], 1.4, zLocal);
                        chunk.add(pu);
                        this.collectibles.push(pu);
                    } else {
                        // Diamond trail
                        for (let d = 0; d < 4; d++) {
                            const diam = this.createDiamond(CONFIG.LANES[lane], 1.2, zLocal + (d - 1.5) * 3.2);
                            chunk.add(diam);
                            this.collectibles.push(diam);
                        }
                    }
                }
            }
        }

        createObstacle(type, x, y, z) {
            const group = new THREE.Group();
            group.position.set(x, y, z);
            group.userData = {
                isObstacle: true,
                type: type,
                box: new THREE.Box3()
            };

            if (type === 'laser') {
                // Low Cyber Laser Barrier
                const postGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.8, 8);
                const postMat = new THREE.MeshStandardMaterial({ color: 0x1a264a, metalness: 0.9, roughness: 0.2 });
                const postL = new THREE.Mesh(postGeo, postMat);
                postL.position.set(-1.3, 0.9, 0);
                group.add(postL);

                const postR = new THREE.Mesh(postGeo, postMat);
                postR.position.set(1.3, 0.9, 0);
                group.add(postR);

                // Glowing Laser Beam
                const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8);
                beamGeo.rotateZ(Math.PI / 2);
                const beam = new THREE.Mesh(beamGeo, this.neonPinkMat);
                beam.position.set(0, 0.9, 0);
                group.add(beam);

                group.userData.height = 1.2;
                group.userData.width = 2.6;
            } else if (type === 'pillar') {
                // Tall Energy Monolith (Cannot be jumped)
                const pillarGeo = new THREE.BoxGeometry(2.2, 7.5, 1.4);
                const pillarMat = new THREE.MeshStandardMaterial({
                    color: 0x09142f,
                    metalness: 0.8,
                    roughness: 0.3
                });
                const pillar = new THREE.Mesh(pillarGeo, pillarMat);
                pillar.position.y = 3.75;
                pillar.castShadow = true;
                group.add(pillar);

                // Neon glowing core
                const coreGeo = new THREE.BoxGeometry(1.4, 6.5, 0.2);
                const core = new THREE.Mesh(coreGeo, this.neonPurpleMat);
                core.position.set(0, 3.75, 0.72);
                group.add(core);

                group.userData.height = 7.5;
                group.userData.width = 2.2;
            } else {
                // Cyber Spikes / Hazard Block
                const boxGeo = new THREE.BoxGeometry(2.4, 1.5, 1.6);
                const boxMat = new THREE.MeshStandardMaterial({
                    color: 0x1f112e,
                    metalness: 0.8,
                    roughness: 0.4
                });
                const box = new THREE.Mesh(boxGeo, boxMat);
                box.position.y = 0.75;
                box.castShadow = true;
                group.add(box);

                // Hazard warning glow
                const hazard = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.2, 1.65), this.neonGoldMat);
                hazard.position.y = 0.75;
                group.add(hazard);

                group.userData.height = 1.5;
                group.userData.width = 2.4;
            }

            return group;
        }

        createDiamond(x, y, z) {
            const group = new THREE.Group();
            group.position.set(x, y, z);
            group.userData = {
                isCollectible: true,
                type: 'diamond',
                collected: false
            };

            // Sparkling 3D Octahedron
            const geo = new THREE.OctahedronGeometry(0.55, 0);
            const mat = new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                emissive: 0x00f0ff,
                emissiveIntensity: 0.65,
                metalness: 0.9,
                roughness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);
            group.add(mesh);

            // Outer spinning glowing ring
            const ringGeo = new THREE.TorusGeometry(0.8, 0.035, 6, 16);
            const ring = new THREE.Mesh(ringGeo, this.neonPurpleMat);
            ring.rotation.x = Math.PI / 4;
            group.add(ring);

            group.userData.mesh = mesh;
            group.userData.ring = ring;
            return group;
        }

        createPowerup(type, x, y, z) {
            const group = new THREE.Group();
            group.position.set(x, y, z);
            group.userData = {
                isCollectible: true,
                type: 'powerup',
                powerupType: type, // 'magnet', 'shield', 'nitro'
                collected: false
            };

            let color = 0x00f0ff;
            if (type === 'magnet') color = 0xff007f;
            if (type === 'nitro') color = 0xffd700;

            const sphereGeo = new THREE.SphereGeometry(0.65, 16, 16);
            const sphereMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.8,
                metalness: 0.8,
                roughness: 0.15
            });
            const orb = new THREE.Mesh(sphereGeo, sphereMat);
            group.add(orb);

            // Glowing orbital ring
            const ringGeo = new THREE.TorusGeometry(0.95, 0.05, 8, 20);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            group.add(ring);

            group.userData.mesh = orb;
            group.userData.ring = ring;
            return group;
        }

        /* ==========================================================================
           6. CONTROLS & EVENT BINDINGS
           ========================================================================== */
        bindEvents() {
            // Window Resize
            window.addEventListener('resize', () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });

            // Keyboard Controls
            window.addEventListener('keydown', (e) => {
                if (this.state === 'PLAYING') {
                    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                        this.moveLeft();
                    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                        this.moveRight();
                    } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                        this.jump();
                        e.preventDefault();
                    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                        this.roll();
                        e.preventDefault();
                    } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                        this.togglePause();
                    }
                } else if (this.state === 'PAUSED') {
                    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                        this.togglePause();
                    }
                }
            });

            // Mobile Touch Swipe Handling
            let touchStartX = 0;
            let touchStartY = 0;
            let touchStartTime = 0;

            window.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    touchStartTime = Date.now();
                }
            }, { passive: true });

            window.addEventListener('touchend', (e) => {
                if (this.state !== 'PLAYING') return;
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                const dt = Date.now() - touchStartTime;

                if (dt < 400) {
                    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
                        if (dx > 0) this.moveRight();
                        else this.moveLeft();
                    } else if (Math.abs(dy) > 35) {
                        if (dy < 0) this.jump();
                        else this.roll();
                    }
                }
            }, { passive: true });

            // On-Screen Touch Buttons
            this.ui.touchLeft.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.moveLeft();
            });
            this.ui.touchRight.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.moveRight();
            });
            this.ui.touchJump.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.jump();
            });

            // Start & Menu UI Buttons
            this.ui.btnStart.addEventListener('click', () => this.startGame());
            this.ui.btnHowToPlay.addEventListener('click', () => this.showInstructions(true));
            this.ui.btnCloseInstructions.addEventListener('click', () => this.showInstructions(false));

            // Photo Card Selectors on Menu
            this.ui.cardPhoto1.addEventListener('click', () => this.selectPilot(1));
            this.ui.cardPhoto2.addEventListener('click', () => this.selectPilot(2));

            // Sound Toggles
            const toggleSoundHandler = () => {
                this.sound.init();
                const isUnmuted = this.sound.toggleMute();
                const icon = isUnmuted ? '🔊' : '🔇';
                this.ui.soundIconStart.textContent = icon;
                this.ui.soundIconHud.textContent = icon;
            };
            this.ui.btnSoundStart.addEventListener('click', toggleSoundHandler);
            this.ui.btnSoundHud.addEventListener('click', toggleSoundHandler);

            // Pause & Resume Buttons
            this.ui.btnPause.addEventListener('click', () => this.togglePause());
            this.ui.btnResume.addEventListener('click', () => this.togglePause());
            this.ui.btnRestartPause.addEventListener('click', () => this.restartGame());
            this.ui.btnMenuPause.addEventListener('click', () => this.goToMenu());

            // Game Over Buttons
            this.ui.btnReplay.addEventListener('click', () => this.restartGame());
            this.ui.btnMenuGo.addEventListener('click', () => this.goToMenu());

            // HUD Avatar click switches pilot photo
            document.querySelector('.hud-avatar-box').addEventListener('click', () => {
                this.selectPilot(this.activePilot === 1 ? 2 : 1);
            });

            // Speed Mode Selection Buttons
            document.querySelectorAll('.btn-speed').forEach(btn => {
                btn.addEventListener('click', () => {
                    const mode = btn.dataset.speed;
                    this.setSpeedMode(mode);
                });
            });
        }

        setSpeedMode(mode) {
            if (!SPEED_PRESETS[mode]) return;
            this.currentSpeedMode = mode;
            const preset = SPEED_PRESETS[mode];
            CONFIG.BASE_SPEED = preset.BASE_SPEED;
            CONFIG.MAX_SPEED = preset.MAX_SPEED;
            CONFIG.SPEED_ACCEL = preset.SPEED_ACCEL;
            CONFIG.JUMP_FORCE = preset.JUMP_FORCE;
            CONFIG.GRAVITY = preset.GRAVITY;
            this.speed = preset.BASE_SPEED;

            document.querySelectorAll('.btn-speed').forEach(b => {
                if (b.dataset.speed === mode) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });

            this.showToast(`SPEED MODE: ${preset.NAME}`);
        }

        selectPilot(pilotIndex) {
            this.activePilot = pilotIndex;
            if (pilotIndex === 1) {
                this.ui.cardPhoto1.classList.add('active');
                this.ui.cardPhoto2.classList.remove('active');
                this.ui.hudAvatarImg.src = CONFIG.PHOTOS.photo1;
                this.ui.goAvatarImg.src = CONFIG.PHOTOS.photo1;
            } else {
                this.ui.cardPhoto2.classList.add('active');
                this.ui.cardPhoto1.classList.remove('active');
                this.ui.hudAvatarImg.src = CONFIG.PHOTOS.photo2;
                this.ui.goAvatarImg.src = CONFIG.PHOTOS.photo2;
            }
            this.showToast(`PILOT THEME: PRAKASH ${pilotIndex === 1 ? 'BRIDGE EXPLORER' : 'SKYLINE MASTER'}`);
        }

        moveLeft() {
            if (this.currentLane > 0) {
                this.currentLane--;
                this.targetX = CONFIG.LANES[this.currentLane];
                if (navigator.vibrate) navigator.vibrate(20);
            }
        }

        moveRight() {
            if (this.currentLane < CONFIG.LANES.length - 1) {
                this.currentLane++;
                this.targetX = CONFIG.LANES[this.currentLane];
                if (navigator.vibrate) navigator.vibrate(20);
            }
        }

        jump() {
            if (this.isGrounded) {
                this.playerVy = CONFIG.JUMP_FORCE;
                this.isGrounded = false;
                this.sound.playJump();
                if (navigator.vibrate) navigator.vibrate(30);
            }
        }

        roll() {
            if (!this.isGrounded) {
                // Slam down from air
                this.playerVy = -CONFIG.JUMP_FORCE * 1.5;
            } else {
                // Low slide
                this.isRolling = true;
                this.rollTimer = 0.65;
            }
        }

        /* ==========================================================================
           7. GAME STATE TRANSITIONS
           ========================================================================== */
        startGame() {
            this.sound.init();
            this.sound.startMusic();

            this.resetGameValues();
            this.state = 'PLAYING';

            this.ui.startScreen.classList.remove('active');
            this.ui.hud.classList.remove('hidden');
            this.ui.pauseScreen.classList.add('hidden');
            this.ui.gameoverScreen.classList.add('hidden');

            this.showToast('MISSION START! GO PRAKASH!');
        }

        resetGameValues() {
            const preset = SPEED_PRESETS[this.currentSpeedMode] || SPEED_PRESETS.slow;
            this.speed = preset.BASE_SPEED;
            CONFIG.BASE_SPEED = preset.BASE_SPEED;
            CONFIG.MAX_SPEED = preset.MAX_SPEED;
            CONFIG.SPEED_ACCEL = preset.SPEED_ACCEL;
            CONFIG.JUMP_FORCE = preset.JUMP_FORCE;
            CONFIG.GRAVITY = preset.GRAVITY;

            this.score = 0;
            this.diamonds = 0;
            this.distance = 0;
            this.multiplier = 1;
            this.currentLane = 1;
            this.targetX = CONFIG.LANES[1];
            this.playerY = 0;
            this.playerVy = 0;
            this.isGrounded = true;
            this.isRolling = false;
            this.powerup = null;
            this.powerupTimeLeft = 0;

            // Reset player position
            this.playerGroup.position.set(0, 0, 0);

            // Rebuild chunks
            this.obstacles.forEach(obs => {
                if (obs.parent) obs.parent.remove(obs);
            });
            this.collectibles.forEach(col => {
                if (col.parent) col.parent.remove(col);
            });
            this.chunks.forEach(chunk => {
                this.scene.remove(chunk);
            });
            this.obstacles = [];
            this.collectibles = [];
            this.chunks = [];
            this.billboardMeshes = [];

            // Add starting chunks
            for (let i = 0; i < CONFIG.TOTAL_CHUNKS; i++) {
                const zPos = -i * CONFIG.CHUNK_LENGTH;
                this.createChunk(zPos, i === 0);
            }

            this.updateBillboardTextures();
            this.updateHUD();
        }

        togglePause() {
            if (this.state === 'PLAYING') {
                this.state = 'PAUSED';
                this.ui.pauseScreen.classList.remove('hidden');
                document.getElementById('pause-score').textContent = Math.floor(this.score).toLocaleString();
                document.getElementById('pause-diamonds').textContent = this.diamonds;
            } else if (this.state === 'PAUSED') {
                this.state = 'PLAYING';
                this.ui.pauseScreen.classList.add('hidden');
            }
        }

        restartGame() {
            this.startGame();
        }

        goToMenu() {
            this.state = 'MENU';
            this.sound.stopMusic();
            this.ui.startScreen.classList.add('active');
            this.ui.hud.classList.add('hidden');
            this.ui.pauseScreen.classList.add('hidden');
            this.ui.gameoverScreen.classList.add('hidden');
            this.ui.menuHighScore.textContent = this.highScore.toLocaleString();
        }

        gameOver() {
            this.state = 'GAMEOVER';
            this.sound.stopMusic();
            this.sound.playCrash();
            this.cameraShake = 0.8;

            if (navigator.vibrate) navigator.vibrate([100, 50, 150]);

            // Save High Score
            const finalScore = Math.floor(this.score);
            let isNewRecord = false;
            if (finalScore > this.highScore) {
                this.highScore = finalScore;
                localStorage.setItem('prakash_highscore', this.highScore);
                isNewRecord = true;
            }

            // Fill Game Over UI
            this.ui.goScore.textContent = finalScore.toLocaleString();
            this.ui.goHighScore.textContent = this.highScore.toLocaleString();
            this.ui.goDiamonds.textContent = this.diamonds;
            this.ui.goDistance.textContent = `${Math.floor(this.distance)}m`;

            if (isNewRecord) {
                this.ui.goNewRecord.classList.remove('hidden');
            } else {
                this.ui.goNewRecord.classList.add('hidden');
            }

            // Comments
            const comments = [
                'Legendary run, Prakash!',
                'Futuristic Reflexes!',
                'Spectacular cyber dash!',
                'Champion of the 3D Highway!'
            ];
            document.getElementById('gameover-hero-comment').textContent = comments[Math.floor(Math.random() * comments.length)];

            setTimeout(() => {
                this.ui.gameoverScreen.classList.remove('hidden');
            }, 600);
        }

        showInstructions(show) {
            if (show) {
                this.ui.instructionsModal.classList.remove('hidden');
            } else {
                this.ui.instructionsModal.classList.add('hidden');
            }
        }

        showToast(msg) {
            this.ui.hudToast.textContent = msg;
            this.ui.hudToast.classList.remove('hidden');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => {
                this.ui.hudToast.classList.add('hidden');
            }, 2500);
        }

        /* ==========================================================================
           8. MAIN UPDATE & PHYSICS LOOP
           ========================================================================== */
        update(delta) {
            if (this.state !== 'PLAYING') {
                // Gentle idle animation in Menu
                if (this.playerGroup) {
                    this.playerGroup.position.y = Math.sin(Date.now() * 0.003) * 0.25;
                }
                return;
            }

            // Cap delta to prevent huge jumps
            delta = Math.min(delta, 0.1);

            // Accelerate speed gradually
            this.speed = Math.min(CONFIG.MAX_SPEED, this.speed + CONFIG.SPEED_ACCEL * delta);

            // Nitro speed multiplier
            let effectiveSpeed = this.speed;
            if (this.powerup === 'nitro') {
                effectiveSpeed *= 1.6;
            }

            // Advance distance & score
            const stepZ = effectiveSpeed * delta;
            this.distance += stepZ;
            this.score += stepZ * 0.5 * this.multiplier;
            this.playerGroup.position.z -= stepZ;

            // Multiplier milestones
            this.multiplier = 1 + Math.floor(this.distance / 180);

            // Lateral Lane Lerp
            const currentX = this.playerGroup.position.x;
            const diffX = this.targetX - currentX;
            this.playerGroup.position.x += diffX * Math.min(1, CONFIG.LANE_SPEED_LERP * delta);

            // Dynamic roll bank angle
            this.playerGroup.rotation.z = -diffX * 0.12;

            // Jump Physics
            if (!this.isGrounded) {
                this.playerY += this.playerVy * delta;
                this.playerVy += CONFIG.GRAVITY * delta;
                if (this.playerY <= 0) {
                    this.playerY = 0;
                    this.playerVy = 0;
                    this.isGrounded = true;
                }
            }

            // Rolling / Slide countdown
            if (this.isRolling) {
                this.rollTimer -= delta;
                this.playerBody.scale.set(1, 0.4, 1.2);
                if (this.rollTimer <= 0) {
                    this.isRolling = false;
                    this.playerBody.scale.set(1, 1, 1);
                }
            } else {
                this.playerBody.scale.set(1, 1, 1);
            }

            // Set final player Y
            this.playerGroup.position.y = this.playerY + (this.isRolling ? 0.25 : 0.45);

            // Animate companion drone & rings
            if (this.drone) {
                this.drone.position.y = 1.6 + Math.sin(Date.now() * 0.005) * 0.2;
                this.droneRing.rotation.z += delta * 4;
            }

            // Power-up Timer Update
            if (this.powerup) {
                this.powerupTimeLeft -= delta;
                const ratio = Math.max(0, this.powerupTimeLeft / CONFIG.POWERUP_DURATION);
                this.ui.powerupFill.style.width = `${ratio * 100}%`;

                if (this.powerup === 'shield') {
                    this.shieldMesh.rotation.y += delta * 2;
                }

                if (this.powerupTimeLeft <= 0) {
                    this.deactivatePowerup();
                }
            }

            // Update Point Lights to follow player
            this.playerLightCyan.position.set(this.playerGroup.position.x - 2, this.playerGroup.position.y + 3, this.playerGroup.position.z - 2);
            this.playerLightPurple.position.set(this.playerGroup.position.x + 2, this.playerGroup.position.y + 3, this.playerGroup.position.z - 2);

            // Update Sky Vehicles
            this.skyVehicles.forEach(v => {
                v.position.x += v.userData.speed * v.userData.direction * delta;
                if (Math.abs(v.position.x) > 130) {
                    v.userData.direction *= -1;
                }
            });

            // Infinite Chunk Recycling System
            this.recycleChunks();

            // Collectibles & Obstacle Interactions
            this.updateInteractions(delta);

            // Camera follow with dynamic damping & shake
            this.updateCamera(delta);

            // Update HUD Numbers
            this.updateHUD();
        }

        recycleChunks() {
            const playerZ = this.playerGroup.position.z;
            const rearLimit = playerZ + CONFIG.CHUNK_LENGTH * 0.8;

            this.chunks.forEach(chunk => {
                if (chunk.position.z > rearLimit) {
                    // Find furthest chunk ahead
                    let minZ = 0;
                    this.chunks.forEach(c => {
                        if (c.position.z < minZ) minZ = c.position.z;
                    });

                    // Move this chunk ahead
                    const newZ = minZ - CONFIG.CHUNK_LENGTH;
                    chunk.position.z = newZ;

                    // Clear old contents & respawn
                    const toRemove = [];
                    chunk.children.forEach(child => {
                        if (child.userData && (child.userData.isObstacle || child.userData.isCollectible)) {
                            toRemove.push(child);
                        }
                    });

                    toRemove.forEach(child => {
                        chunk.remove(child);
                        const obsIdx = this.obstacles.indexOf(child);
                        if (obsIdx !== -1) this.obstacles.splice(obsIdx, 1);
                        const colIdx = this.collectibles.indexOf(child);
                        if (colIdx !== -1) this.collectibles.splice(colIdx, 1);
                    });

                    // Populate fresh items
                    this.populateChunkContents(chunk);

                    // Ensure recycled chunk maintains giant center Prakash display (bich me!)
                    let hasDisplay = false;
                    chunk.children.forEach(c => {
                        if (c.userData && (c.userData.photoIndex || c.userData.isCenterArch || c.userData.isSkybridge)) hasDisplay = true;
                    });
                    if (!hasDisplay) {
                        const chunkIdx = Math.abs(Math.round(newZ / CONFIG.CHUNK_LENGTH));
                        const photoIdx = (chunkIdx % 2) + 1;
                        const centerArch = this.createCenterArchMesh(photoIdx);
                        centerArch.position.set(0, 0, -CONFIG.CHUNK_LENGTH * 0.5);
                        chunk.add(centerArch);
                    }
                }
            });
        }

        updateInteractions(delta) {
            const playerBox = new THREE.Box3().setFromObject(this.playerBody);
            const playerPos = this.playerGroup.position;

            // 1. Collectibles
            for (let i = this.collectibles.length - 1; i >= 0; i--) {
                const item = this.collectibles[i];
                if (item.userData.collected) continue;

                // Animate rotating
                if (item.userData.mesh) {
                    item.userData.mesh.rotation.y += delta * 3;
                }
                if (item.userData.ring) {
                    item.userData.ring.rotation.z += delta * 2;
                }

                // World position of item
                const worldPos = new THREE.Vector3();
                item.getWorldPosition(worldPos);

                // Magnet pull effect
                if (this.powerup === 'magnet' && item.userData.type === 'diamond') {
                    const distToPlayer = worldPos.distanceTo(playerPos);
                    if (distToPlayer < 24) {
                        const pullDir = new THREE.Vector3().subVectors(playerPos, worldPos).normalize();
                        item.position.addScaledVector(pullDir, 32 * delta);
                    }
                }

                // Check pickup distance
                const dist = worldPos.distanceTo(playerPos);
                if (dist < 1.7) {
                    item.userData.collected = true;
                    item.visible = false;

                    if (item.userData.type === 'diamond') {
                        this.diamonds++;
                        this.score += CONFIG.DIAMOND_VALUE * this.multiplier;
                        this.sound.playDiamond();
                    } else if (item.userData.type === 'powerup') {
                        this.activatePowerup(item.userData.powerupType);
                    }
                }
            }

            // 2. Obstacles Collision
            for (let i = 0; i < this.obstacles.length; i++) {
                const obs = this.obstacles[i];
                const obsPos = new THREE.Vector3();
                obs.getWorldPosition(obsPos);

                // Only check obstacles near player Z
                const dz = Math.abs(obsPos.z - playerPos.z);
                if (dz < 2.0) {
                    const dx = Math.abs(obsPos.x - playerPos.x);
                    if (dx < (obs.userData.width / 2 + 0.6)) {
                        const playerTop = playerPos.y + (this.isRolling ? 0.6 : 1.4);
                        const playerBottom = playerPos.y;
                        const obsTop = obs.userData.height;

                        let hit = false;
                        if (obs.userData.type === 'laser') {
                            // Low laser: Jumpable!
                            if (playerBottom < 1.1) hit = true;
                        } else if (obs.userData.type === 'pillar') {
                            // Tall pillar: Cannot jump!
                            hit = true;
                        } else {
                            // Hazard block: Jumpable if high enough
                            if (playerBottom < 1.3) hit = true;
                        }

                        if (hit) {
                            if (this.powerup === 'nitro') {
                                // Destroy obstacle in nitro mode!
                                obs.visible = false;
                                this.sound.playShieldBreak();
                            } else if (this.powerup === 'shield') {
                                // Shield absorbs hit!
                                this.deactivatePowerup();
                                this.sound.playShieldBreak();
                                this.showToast('SHIELD ABSORBED COLLISION!');
                                obs.visible = false; // break obstacle
                            } else {
                                this.gameOver();
                                break;
                            }
                        }
                    }
                }
            }
        }

        activatePowerup(type) {
            this.powerup = type;
            this.powerupTimeLeft = CONFIG.POWERUP_DURATION;
            this.sound.playPowerup();

            this.ui.powerupHud.classList.remove('hidden');

            if (type === 'magnet') {
                this.ui.powerupIcon.textContent = '🧲';
                this.ui.powerupName.textContent = 'DIAMOND MAGNET';
                this.showToast('🧲 MAGNET ACTIVATED!');
            } else if (type === 'shield') {
                this.ui.powerupIcon.textContent = '🛡️';
                this.ui.powerupName.textContent = 'ENERGY SHIELD';
                this.shieldMat.opacity = 0.55;
                this.showToast('🛡️ SHIELD EQUIPPED!');
            } else if (type === 'nitro') {
                this.ui.powerupIcon.textContent = '⚡';
                this.ui.powerupName.textContent = 'HYPER NITRO';
                this.showToast('⚡ HYPER NITRO BOOST!');
            }
        }

        deactivatePowerup() {
            this.powerup = null;
            this.powerupTimeLeft = 0;
            this.shieldMat.opacity = 0;
            this.ui.powerupHud.classList.add('hidden');
        }

        updateCamera(delta) {
            const playerPos = this.playerGroup.position;
            const targetCamX = playerPos.x * 0.65;
            const targetCamY = 4.6 + (this.playerY * 0.4);
            const targetCamZ = playerPos.z + 8.2;

            // Camera Shake on hit
            let shakeX = 0;
            let shakeY = 0;
            if (this.cameraShake > 0) {
                shakeX = (Math.random() - 0.5) * this.cameraShake * 1.5;
                shakeY = (Math.random() - 0.5) * this.cameraShake * 1.5;
                this.cameraShake = Math.max(0, this.cameraShake - delta * 2);
            }

            this.camera.position.x += (targetCamX - this.camera.position.x) * Math.min(1, 10 * delta) + shakeX;
            this.camera.position.y += (targetCamY - this.camera.position.y) * Math.min(1, 8 * delta) + shakeY;
            this.camera.position.z = targetCamZ;

            // Dynamic camera tilt
            this.camera.rotation.z = -this.playerGroup.rotation.z * 0.5;

            // Look ahead of player
            this.camera.lookAt(playerPos.x * 0.4, 2.0 + this.playerY * 0.2, playerPos.z - 16);
        }

        updateHUD() {
            this.ui.hudScore.textContent = Math.floor(this.score).toLocaleString();
            this.ui.hudDiamonds.textContent = this.diamonds;
            this.ui.hudMultiplier.textContent = `${this.multiplier}x`;
        }

        animate() {
            requestAnimationFrame(this.animate);
            const delta = this.clock.getDelta();
            this.update(delta);
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Initialize Game on DOM ready
    window.addEventListener('DOMContentLoaded', () => {
        window.prakashGame = new Game();
    });

})();
