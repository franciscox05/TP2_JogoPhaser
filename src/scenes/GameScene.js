export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.createTextures();
    this.drawDungeonBackground();

    this.physics.world.setBounds(50, 50, 860, 440);

    this.player = this.physics.add.sprite(100, 100, "playerTex").setDepth(5);
    this.player.setCollideWorldBounds(true);

    this.keyItem = this.physics.add.staticSprite(820, 100, "keyTex").setDepth(6);
    this.exitDoor = this.physics.add.staticSprite(840, 440, "doorTex").setDepth(4);

    this.walls = this.physics.add.staticGroup();
    this.createWalls();

    this.enemies = this.physics.add.group();
    const enemyA = this.enemies.create(300, 270, "enemyTex").setDepth(5);
    const enemyB = this.enemies.create(620, 200, "enemyTex").setDepth(5);
    enemyA.setVelocityX(110).setBounce(1, 1).setCollideWorldBounds(true);
    enemyB.setVelocityY(130).setBounce(1, 1).setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.enemies);

    this.hasKey = false;
    this.lives = 3;
    this.timeLeft = 75;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");

    this.physics.add.overlap(this.player, this.keyItem, this.handleCollectKey, null, this);
    this.physics.add.overlap(this.player, this.exitDoor, this.handleExitDoor, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyHit, null, this);

    this.hitCooldown = false;

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft -= 1;
        this.refreshHud();
        if (this.timeLeft <= 0) {
          this.endGame(false);
        }
      },
      loop: true
    });

    this.createHud();

    this.toggleLangKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.refreshHud();
  }

  createTextures() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0xf2b46f, 1);
    graphics.fillCircle(14, 14, 14);
    graphics.fillStyle(0x6d3a1f, 1);
    graphics.fillCircle(14, 14, 5);
    graphics.generateTexture("playerTex", 28, 28);
    graphics.clear();

    graphics.fillStyle(0x5f1f1f, 1);
    graphics.fillRoundedRect(0, 0, 28, 28, 6);
    graphics.fillStyle(0xc05858, 1);
    graphics.fillRoundedRect(4, 4, 20, 20, 4);
    graphics.generateTexture("enemyTex", 28, 28);
    graphics.clear();

    graphics.fillStyle(0xd6ab3d, 1);
    graphics.fillCircle(11, 11, 11);
    graphics.fillStyle(0x6b4e1a, 1);
    graphics.fillRect(10, 4, 12, 4);
    graphics.generateTexture("keyTex", 24, 24);
    graphics.clear();

    graphics.fillStyle(0x5e3f2a, 1);
    graphics.fillRoundedRect(0, 0, 34, 44, 5);
    graphics.fillStyle(0x8b633d, 1);
    graphics.fillRect(15, 14, 4, 20);
    graphics.generateTexture("doorTex", 34, 44);
    graphics.clear();

    graphics.fillStyle(0x5b402d, 1);
    graphics.fillRoundedRect(0, 0, 40, 40, 3);
    graphics.fillStyle(0x7a5638, 1);
    graphics.fillRect(0, 0, 40, 5);
    graphics.fillRect(0, 20, 40, 4);
    graphics.generateTexture("wallTex", 40, 40);
    graphics.destroy();
  }

  drawDungeonBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x2f1f16, 0x2f1f16, 0x4a3021, 0x4a3021, 1);
    g.fillRect(0, 0, 960, 540);

    g.fillStyle(0x6c4a31, 0.8);
    for (let y = 65; y < 500; y += 42) {
      for (let x = 55; x < 905; x += 42) {
        g.fillRect(x, y, 40, 40);
      }
    }

    g.fillStyle(0x090706, 0.2);
    g.fillRect(50, 50, 860, 440);

    g.fillStyle(0x1a130f, 0.38);
    g.fillRect(0, 0, 960, 540);

    this.createTorch(110, 90);
    this.createTorch(850, 90);
    this.createTorch(110, 460);
    this.createTorch(850, 460);
  }

  createTorch(x, y) {
    const glow = this.add.circle(x, y, 75, 0xff8f2c, 0.22).setDepth(2);
    this.add.circle(x, y, 12, 0xff4df0, 0.75).setDepth(3);
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.26, to: 0.12 },
      duration: 420,
      yoyo: true,
      repeat: -1
    });
  }

  createWalls() {
    const wallPositions = [];

    for (let x = 180; x <= 780; x += 40) wallPositions.push([x, 160]);
    for (let x = 180; x <= 740; x += 40) wallPositions.push([x, 320]);
    for (let y = 200; y <= 400; y += 40) wallPositions.push([420, y]);
    for (let y = 80; y <= 280; y += 40) wallPositions.push([700, y]);

    wallPositions.forEach(([x, y]) => {
      this.walls.create(x, y, "wallTex").setDepth(4);
    });
  }

  createHud() {
    const panel = this.add.rectangle(200, 40, 370, 56, 0x100c09, 0.68).setDepth(20);
    panel.setStrokeStyle(1, 0xb67a32, 0.9);

    this.hudText = this.add.text(20, 22, "", {
      fontSize: "20px",
      color: "#f2e6d8"
    }).setDepth(21);

    this.langToggleText = this.add.text(20, 52, "E: PT/EN", {
      fontSize: "15px",
      color: "#e0b884"
    }).setDepth(21);

    this.doorHintText = this.add.text(480, 510, "", {
      fontSize: "19px",
      color: "#f6ddb4",
      backgroundColor: "#3f2a1a",
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setDepth(20);
  }

  t(key) {
    const lang = this.registry.get("lang") || "pt";
    const dict = this.registry.get("i18n")[lang];
    return dict[key] ?? key;
  }

  refreshHud() {
    const keyState = this.hasKey ? this.t("hudKeyYes") : this.t("hudKeyNo");
    this.hudText.setText(
      `${this.t("hudLives")}: ${this.lives}   ${this.t("hudTime")}: ${this.timeLeft}   ${this.t("hudKey")}: ${keyState}`
    );
    this.doorHintText.setText(
      this.hasKey ? "Saida desbloqueada / Exit unlocked" : "Encontra a chave para sair / Find the key to escape"
    );
  }

  handleCollectKey() {
    if (this.hasKey) return;
    this.hasKey = true;
    this.keyItem.destroy();
    this.refreshHud();

    this.cameras.main.shake(120, 0.0025);
    this.tweens.add({
      targets: this.player,
      scale: { from: 1.3, to: 1 },
      duration: 220,
      ease: "Back.Out"
    });
  }

  handleExitDoor() {
    if (this.hasKey) {
      this.endGame(true);
    }
  }

  handleEnemyHit() {
    if (this.hitCooldown) return;
    this.hitCooldown = true;

    this.lives -= 1;
    this.player.setPosition(100, 100);
    this.refreshHud();

    this.player.setTint(0xff0000);
    this.cameras.main.shake(140, 0.005);

    this.time.delayedCall(250, () => {
      this.player.clearTint();
      this.hitCooldown = false;
    });

    if (this.lives <= 0) {
      this.endGame(false);
    }
  }

  endGame(victory) {
    this.scene.start("EndScene", { victory });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.toggleLangKey)) {
      const current = this.registry.get("lang") || "pt";
      this.registry.set("lang", current === "pt" ? "en" : "pt");
      this.refreshHud();
    }

    const speed = 180;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

    this.player.setVelocity(vx, vy);
  }
}
