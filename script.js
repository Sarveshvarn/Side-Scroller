window.addEventListener('load', function(){
	const canvas = document.getElementById("canvas1");
	const ctx = canvas.getContext("2d");
	canvas.width = 1500;
	canvas.height = 720;
	let enemies = [];
	let score = 0;
	let gameOver = false;
	let lastKey;
	const keys = {
		w: {
			pressed: false
		},
		a: {
			pressed: false
		},
		s: {
			pressed: false
		},
		d: {
			pressed: false
		},
	}
	class InputHandler { 
		constructor() { 
			this.keys = []; 
			addEventListener("keydown", (e) => { 
				switch (e.key) {
					case "w":
						keys.w.pressed = true;
						lastKey = "w"
						break;
					case "a":
						keys.a.pressed = true;
						lastKey = "a"
						break;
					case "s":
						keys.s.pressed = true;
						lastKey = "s"
						break;
					case "d":
						keys.d.pressed = true;
						lastKey = "d"
						break;
				}
			});
			addEventListener("keyup", (e) => { 
				switch (e.key) {
					case "w":
						keys.w.pressed = false;
						break;
					case "a":
						keys.a.pressed = false;
						break;
					case "s":
						keys.s.pressed = false;
						break;
					case "d":
						keys.d.pressed = false;
						break;
				}
			})
		}
	}

	class Player {
		constructor(gameWidth, gameHeight) {
			this.gameWidth = gameWidth;
			this.gameHeight = gameHeight;
			this.width = 200;
			this.height = 200;
			this.x = 0;
			this.y = this.gameHeight - this.height;
			this.image = document.getElementById('playerImage');
			this.frameX = 0;
			this.maxFrame = 8;
			this.fps = 20;
			this.frameTimer = 0;
			this.frameInterval = 1000/this.fps;
			this.frameY = 0;
			this.speed = 0;
			this.vy = 0;
			this.weight = 1;
		}
		draw(c) {
			c.drawImage(
				this.image, 
				this.frameX * this.width, 
				this.frameY * this.height, 
				this.width, 
				this.height, 
				this.x, 
				this.y, 
				this.width, 
				this.height
			)
		}
		update(input, deltaTime, enemies) {
			//collision detection
			enemies.forEach(enemy => {
				const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);
				const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);
				const distance = Math.sqrt(dx * dx + dy * dy);
				if (distance < enemy.width/2 + this.width/2) {
					gameOver = true
				}
			})
			//sprite animation
			if (this.frameTimer > this.frameInterval) {
				if (this.frameX >= this.maxFrame) this.frameX = 0;
				else this.frameX++;
				this.frameTimer = 0;
			} else {
				this.frameTimer += deltaTime
			}
			//controlls
			if (keys.d.pressed && lastKey === "d") {
				this.speed = 5; 
			} else if (keys.a.pressed && lastKey === "a") {
				this.speed = -5;
			} else if (keys.w.pressed && lastKey === "w" && this.onGround()) {
				this.vy -= 30;
			} else {
				this.speed = 0;
			}
			//horizontal movement
			this.x += this.speed;
			if (this.x < 0) this.x = 0;
			else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
			//vertical movement
			this.y += this.vy;
			if (!this.onGround()) {
				this.vy += this.weight;
				this.maxFrame = 5;
				this.frameY = 1;
			} else {
				this.vy = 0;
				this.maxFrame = 8;
				this.frameY = 0;
			}
			if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height
		}
		onGround() {
			return this.y >= this.gameHeight - this.height
		}
	}

	class Background {
		constructor(gameWidth, gameHeight) {
			this.gameWidth = gameWidth;
			this.gameHeight = gameHeight;
			this.image = document.getElementById('backgroundImage');
			this.x = 0;
			this.y = 0;
			this.width = 2400;
			this.height = 720;
			this.speed = 7;
		}
		draw(c) {
			c.drawImage(this.image, this.x, this.y, this.width, this.height)
			c.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height)
		}
		update() {
			this.x -= this.speed
			if (this.x < 0 - this.width) this.x = 0
		}
	}

	class Enemy {
		constructor(gameWidth, gameHeight) {
			this.gameWidth = gameWidth;
			this.gameHeight = gameHeight;
			this.image = document.getElementById('enemyImage');
			this.width = 160;
			this.height = 119;
			this.x = this.gameWidth;
			this.y = this.gameHeight - this.height;
			this.frameX = 0;
			this.maxFrame = 5;
			this.fps = 20;
			this.frameTimer = 0;
			this.frameInterval = 1000/this.fps;
			this.speed = 5;
			this.markForDeletion = false;
		}
		draw(c) {
			c.drawImage(
				this.image, 
				this.frameX * this.width, 
				0, 
				this.width, 
				this.height, 
				this.x, 
				this.y, 
				this.width, 
				this.height
			)
		}
		update(deltaTime) {
			if (this.frameTimer > this.frameInterval) {
				if (this.frameX >= this.maxFrame) this.frameX = 0
				else this.frameX++;
				this.frameTimer = 0
			} else {
				this.frameTimer += deltaTime
			}
			this.x -= this.speed;
			if (this.x < 0 - this.width) {
				this.markForDeletion = true
				score++;
			}
		}
	}

	function HandleEnemies(deltaTime) {
		if (enemyTimer > enemyInterval + randomEnemyInterval) {
			enemies.push(new Enemy(canvas.width, canvas.height))
			enemyTimer = 0;
		} else {
			enemyTimer += deltaTime;
		}
		enemies.forEach((enemy) => {
			enemy.draw(ctx);
			enemy.update(deltaTime)
		})
		enemies = enemies.filter(enemy => !enemy.markForDeletion)
	}

	function DisplayStatusText(c) {
		c.font = "40px Helvetica"
		c.fillStyle = "black";
		c.fillText("Score: " + score, 20, 50)
		c.fillStyle = "white";
		c.fillText("Score: " + score, 20, 53)
		if (gameOver) {
			c.textAlign = "center";
			c.fillStyle = "black";
			c.fillText("GAME OVER! Try Again", canvas.width/2, 200)
			c.fillStyle = "white";
			c.fillText("GAME OVER! Try Again", canvas.width/2, 203)
		}
	}

	const input = new InputHandler();
	const player = new Player(canvas.width, canvas.height);
	const background = new Background(canvas.width, canvas.height);

	//helper varibles
	let lastTime = 0;
	let enemyTimer = 0;
	let enemyInterval = 2000;
	let randomEnemyInterval = Math.random() * 1000 + 500;

	function animate(timeStamp) {
		if (!gameOver) requestAnimationFrame(animate)
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		background.draw(ctx);
		background.update();
		player.draw(ctx);
		player.update(input, deltaTime, enemies);
		HandleEnemies(deltaTime);
		DisplayStatusText(ctx)
	}
	animate(0)
})
;