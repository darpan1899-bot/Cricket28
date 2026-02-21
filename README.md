// ============================================
// COMPLETE CRICKET GAME - ALL IN ONE FILE
// ============================================

// ============================================
// BATSMAN GAME CLASS
// ============================================
class BatsmanGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Game stats
        this.score = 0;
        this.ballsPlayed = 0;
        this.runs = 0;
        this.isOut = false;
        
        // First person view
        this.batsman = {
            x: this.canvas.width / 2,
            y: this.canvas.height * 0.7,
            viewHeight: 100,
            rotation: 0,
            fov: 90
        };
        
        // Ball
        this.ball = null;
        this.ballSpeed = 12;
        
        // Input
        this.keys = {};
        this.ballHit = false;
        
        this.init();
    }
    
    init() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        if (e.key === ' ') {
            e.preventDefault();
            this.hitBall();
        }
        
        if (e.key === 'Escape') {
            e.preventDefault();
            gameManager.returnToMenu();
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    hitBall() {
        if (this.ball && !this.ballHit) {
            this.ballHit = true;
            const hitPower = 15 + Math.random() * 10;
            const hitAngle = (Math.random() - 0.5) * 0.4;
            
            this.ball.velocityX = Math.cos(hitAngle) * hitPower;
            this.ball.velocityY = -Math.sin(hitAngle) * hitPower;
            this.ball.velocityZ = (Math.random() - 0.5) * 8;
            
            this.ballHit = true;
        }
    }
    
    bowlBall() {
        this.ballHit = false;
        this.ballsPlayed++;
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            z: 500,
            velocityX: (Math.random() - 0.5) * 3,
            velocityY: (Math.random() - 0.5) * 2,
            velocityZ: -this.ballSpeed,
            radius: 8
        };
    }
    
    update() {
        // Move batsman based on input
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.batsman.rotation -= 0.05;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.batsman.rotation += 0.05;
        }
        
        // Update ball
        if (this.ball) {
            this.ball.x += this.ball.velocityX;
            this.ball.y += this.ball.velocityY;
            this.ball.z += this.ball.velocityZ;
            
            // Gravity
            this.ball.velocityY += 0.5;
            
            // Friction
            this.ball.velocityX *= 0.99;
            this.ball.velocityY *= 0.99;
            this.ball.velocityZ *= 0.98;
            
            // Check if ball passed or hit batsman
            if (this.ball.z < -100) {
                if (this.ballHit) {
                    const distance = Math.sqrt(
                        Math.pow(this.ball.x - this.batsman.x, 2) + 
                        Math.pow(this.ball.y - this.batsman.y, 2)
                    );
                    
                    if (distance < 150) {
                        // Runs based on where ball goes
                        this.runs += Math.floor(Math.random() * 4) + 1;
                        this.score += this.runs;
                    }
                } else {
                    // Bowled!
                    this.isOut = true;
                    gameManager.endGame('Bowled!', {
                        score: this.score,
                        ballsPlayed: this.ballsPlayed,
                        runs: this.runs
                    });
                }
                
                setTimeout(() => this.bowlBall(), 1500);
            }
            
            // Hit by ball
            if (this.ball.z > -50 && this.ball.z < 50) {
                const distance = Math.sqrt(
                    Math.pow(this.ball.x - this.batsman.x, 2) + 
                    Math.pow(this.ball.y - this.batsman.y, 2)
                );
                
                if (distance < this.ball.radius + 30 && !this.ballHit) {
                    this.isOut = true;
                    gameManager.endGame('Out! - Caught', {
                        score: this.score,
                        ballsPlayed: this.ballsPlayed,
                        runs: this.runs
                    });
                }
            }
        }
        
        // Update UI
        document.getElementById('score').textContent = this.score;
        document.getElementById('balls').textContent = this.ballsPlayed;
        document.getElementById('runs').textContent = this.runs;
    }
    
    draw() {
        // Clear with gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw first-person view
        this.drawFirstPersonView();
        
        // Draw ball in perspective
        if (this.ball) {
            this.drawBallInPerspective();
        }
        
        // Draw HUD
        this.drawHUD();
    }
    
    drawFirstPersonView() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Pitch
        const pitchColor = '#2d5016';
        ctx.fillStyle = pitchColor;
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
        
        // Crease line
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.65);
        ctx.lineTo(w, h * 0.65);
        ctx.stroke();
        
        // Stumps
        const stumpX = w / 2;
        const stumpY = h * 0.55;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(stumpX - 25, stumpY, 50, 80);
        
        // Bails
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stumpX - 30, stumpY - 10);
        ctx.lineTo(stumpX + 30, stumpY - 10);
        ctx.stroke();
        
        // Bat
        this.drawBat();
    }
    
    drawBat() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        const batX = w / 2;
        const batY = h * 0.7;
        
        ctx.save();
        ctx.translate(batX, batY);
        ctx.rotate(Math.sin(Date.now() * 0.001) * 0.1);
        
        // Bat handle
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-10, -80, 20, 80);
        
        // Bat blade
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(-35, -100, 70, 30);
        
        // Grip
        ctx.fillStyle = '#000';
        ctx.fillRect(-8, 0, 16, 20);
        
        ctx.restore();
    }
    
    drawBallInPerspective() {
        const ctx = this.ctx;
        const ball = this.ball;
        
        // Perspective projection
        if (ball.z > 0) {
            const scale = 400 / (ball.z + 400);
            const screenX = this.canvas.width / 2 + (ball.x - this.canvas.width / 2) * scale;
            const screenY = this.canvas.height / 2 + (ball.y - this.canvas.height / 2) * scale;
            const radius = ball.radius * scale;
            
            if (radius > 0.5) {
                // Ball shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(screenX, this.canvas.height * 0.68, radius * 1.5, radius * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Ball
                const ballGradient = ctx.createRadialGradient(screenX - radius * 0.3, screenY - radius * 0.3, 0, screenX, screenY, radius);
                ballGradient.addColorStop(0, '#FF6B6B');
                ballGradient.addColorStop(1, '#C92A2A');
                ctx.fillStyle = ballGradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Ball seam
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(screenX, screenY, radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    drawHUD() {
        const ctx = this.ctx;
        
        // Crosshair
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const size = 20;
        
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        
        // Horizontal
        ctx.beginPath();
        ctx.moveTo(cx - size, cy);
        ctx.lineTo(cx + size, cy);
        ctx.stroke();
        
        // Vertical
        ctx.beginPath();
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx, cy + size);
        ctx.stroke();
        
        // Center dot
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    start() {
        this.ballsPlayed = 0;
        this.score = 0;
        this.runs = 0;
        this.isOut = false;
        this.bowlBall();
    }
    
    stop() {
        this.isOut = true;
    }
}

// ============================================
// BOWLER GAME CLASS
// ============================================
class BowlerGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Game stats
        this.wickets = 0;
        this.runsConceded = 0;
        this.ballsBowled = 0;
        
        // Bowler view
        this.bowler = {
            x: this.canvas.width / 2,
            y: this.canvas.height * 0.8,
            aimX: this.canvas.width / 2,
            aimY: this.canvas.height / 2,
            fov: 100
        };
        
        // Ball in hand
        this.ballInHand = {
            x: this.canvas.width / 2 + 100,
            y: this.canvas.height * 0.3
        };
        
        // Bowled ball
        this.bowledBall = null;
        this.ballInFlight = false;
        
        // Bowling styles
        this.bowlType = 'fast';
        this.bowlTypes = {
            fast: { speed: 18, color: '#FF4444', name: 'Fast' },
            medium: { speed: 14, color: '#FFA500', name: 'Medium' },
            spin: { speed: 10, color: '#4444FF', name: 'Spin' }
        };
        
        // Input
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.canBowl = true;
        
        this.init();
    }
    
    init() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        if (e.key === ' ') {
            e.preventDefault();
            this.bowlBall();
        }
        
        if (e.key === 'q') {
            this.bowlType = 'fast';
            this.updateBowlDisplay();
        }
        if (e.key === 'w') {
            this.bowlType = 'medium';
            this.updateBowlDisplay();
        }
        if (e.key === 'e') {
            this.bowlType = 'spin';
            this.updateBowlDisplay();
        }
        
        if (e.key === 'Escape') {
            e.preventDefault();
            gameManager.returnToMenu();
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        this.bowler.aimX = this.mouse.x;
        this.bowler.aimY = this.mouse.y;
    }
    
    updateBowlDisplay() {
        document.getElementById('current-bowl').textContent = this.bowlTypes[this.bowlType].name;
    }
    
    bowlBall() {
        if (!this.canBowl || this.ballInFlight) return;
        
        this.canBowl = false;
        this.ballInFlight = true;
        this.ballsBowled++;
        
        const bowlData = this.bowlTypes[this.bowlType];
        
        const dx = this.bowler.aimX - this.canvas.width / 2;
        const dy = this.bowler.aimY - this.canvas.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        let variation = 0;
        if (this.bowlType === 'spin') {
            variation = (Math.random() - 0.5) * 0.3;
        } else if (this.bowlType === 'medium') {
            variation = (Math.random() - 0.5) * 0.15;
        }
        
        this.bowledBall = {
            x: this.canvas.width / 2,
            y: this.canvas.height * 0.3,
            z: 0,
            velocityX: Math.cos(angle + variation) * bowlData.speed,
            velocityY: Math.sin(angle + variation) * bowlData.speed * 0.3,
            velocityZ: bowlData.speed * 0.8,
            radius: 8,
            type: this.bowlType,
            color: bowlData.color,
            spin: this.bowlType === 'spin' ? Math.random() * 20 : 0
        };
        
        setTimeout(() => {
            this.ballInFlight = false;
            this.canBowl = true;
            this.bowledBall = null;
        }, 2000);
    }
    
    update() {
        if (this.bowledBall) {
            this.bowledBall.x += this.bowledBall.velocityX;
            this.bowledBall.y += this.bowledBall.velocityY;
            this.bowledBall.z += this.bowledBall.velocityZ;
            
            this.bowledBall.velocityX *= 0.98;
            this.bowledBall.velocityY *= 0.98;
            this.bowledBall.velocityZ *= 0.96;
            
            this.bowledBall.velocityY += 0.3;
        }
        
        const handDistance = 50 + Math.sin(Date.now() * 0.005) * 10;
        const handAngle = Math.atan2(this.bowler.aimY - this.canvas.height / 2, 
                                     this.bowler.aimX - this.canvas.width / 2);
        
        this.ballInHand.x = this.canvas.width / 2 + Math.cos(handAngle) * handDistance;
        this.ballInHand.y = this.canvas.height * 0.2 + Math.sin(handAngle) * handDistance * 0.5;
        
        document.getElementById('wickets').textContent = this.wickets;
        document.getElementById('runs-conceded').textContent = this.runsConceded;
        document.getElementById('balls-bowled').textContent = this.ballsBowled;
    }
    
    draw() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#E0F6FF');
        gradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawField();
        this.drawBallInHand();
        
        if (this.bowledBall) {
            this.drawBowledBall();
        }
        
        this.drawAimAssist();
        this.drawHUD();
    }
    
    drawField() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.fillStyle = '#2d5016';
        const pitchTop = h * 0.4;
        const pitchBottom = h * 0.7;
        
        ctx.beginPath();
        ctx.moveTo(w * 0.2, pitchTop);
        ctx.lineTo(w * 0.8, pitchTop);
        ctx.lineTo(w * 0.85, pitchBottom);
        ctx.lineTo(w * 0.15, pitchBottom);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(w * 0.15, pitchTop + (pitchBottom - pitchTop) * 0.1);
        ctx.lineTo(w * 0.85, pitchTop + (pitchBottom - pitchTop) * 0.1);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(w * 0.15, pitchBottom - 20);
        ctx.lineTo(w * 0.85, pitchBottom - 20);
        ctx.stroke();
        
        const stumpX = w / 2;
        const stumpY = pitchBottom - 40;
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(stumpX - 25, stumpY - 60, 50, 60);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(stumpX - 30, stumpY - 65);
        ctx.lineTo(stumpX + 30, stumpY - 65);
        ctx.stroke();
    }
    
    drawBallInHand() {
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(this.ballInHand.x, this.ballInHand.y + 40, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const gradient = ctx.createRadialGradient(
            this.ballInHand.x - 5, this.ballInHand.y - 5, 0,
            this.ballInHand.x, this.ballInHand.y, 12
        );
        gradient.addColorStop(0, '#FF8C8C');
        gradient.addColorStop(1, '#C92A2A');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.ballInHand.x, this.ballInHand.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(this.ballInHand.x, this.ballInHand.y, 8, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawBowledBall() {
        const ctx = this.ctx;
        const ball = this.bowledBall;
        
        if (ball.z < 500) {
            const scale = 300 / (ball.z + 300);
            const screenX = this.canvas.width / 2 + (ball.x - this.canvas.width / 2) * scale;
            const screenY = this.canvas.height / 2 + (ball.y - this.canvas.height / 2) * scale;
            const radius = ball.radius * scale;
            
            if (radius > 1) {
                ctx.fillStyle = 'rgba(0,0,0,0.25)';
                ctx.beginPath();
                ctx.ellipse(screenX, this.canvas.height * 0.68, radius * 2, radius * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                const gradient = ctx.createRadialGradient(screenX - radius * 0.3, screenY - radius * 0.3, 0, screenX, screenY, radius);
                gradient.addColorStop(0, ball.color);
                gradient.addColorStop(1, this.darkenColor(ball.color));
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(ball.spin * Date.now() * 0.01);
                ctx.strokeStyle = 'rgba(255,255,255,0.7)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
    
    darkenColor(color) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = 30;
        const usign = num > 0xffffff;
        return (usign ? '0x' : '0x') + Math.round(((num & 0x000000) * (1 - amt / 100)) + ((num & 0xffffff) * (amt / 100))).toString(16).pad
