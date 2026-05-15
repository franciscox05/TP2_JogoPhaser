export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    const graphics = this.add.graphics();

    graphics.fillStyle(0x4f7cac, 1);
    graphics.fillRect(0, 0, 26, 26);
    graphics.generateTexture("playerTex", 26, 26);
    graphics.clear();

    graphics.fillStyle(0x993d3d, 1);
    graphics.fillRect(0, 0, 26, 26);
    graphics.generateTexture("enemyTex", 26, 26);
    graphics.clear();

    graphics.fillStyle(0xd4b24c, 1);
    graphics.fillRect(0, 0, 20, 20);
    graphics.generateTexture("keyTex", 20, 20);
    graphics.clear();

    graphics.fillStyle(0x4caf50, 1);
    graphics.fillRect(0, 0, 30, 30);
    graphics.generateTexture("doorTex", 30, 30);
    graphics.destroy();

    this.physics.world.setBounds(50, 50, 860, 440);

    this.player = this.physics.add.sprite(100, 100, "playerTex");
    this.player.setCollideWorldBounds(true);

    this.keyItem = this.physics.add.staticSprite(820, 100, "keyTex");
    this.exitDoor = this.physics.add.staticSprite(840, 440, "doorTex");

    this.enemies = this.physics.add.group();
    const enemyA = this.enemies.create(300, 270, "enemyTex");
    const enemyB = this.enemies.create(620, 200, "enemyTex");
    enemyA.setVelocityX(110).setBounce(1, 1).setCollideWorldBounds(true);
    enemyB.setVelocityY(130).setBounce(1, 1).setCollideWorldBounds(true);

    this.hasKey = false;
    this.lives = 3;
    this.timeLeft = 60;

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

    this.hudText = this.add.text(16, 14, "", {
      fontSize: "22px",
      color: "#f2e6d8"
    }).setScrollFactor(0);

    this.langToggleText = this.add.text(16, 46, "E: PT/EN", {
      fontSize: "16px",
      color: "#cbb89d"
    }).setScrollFactor(0);

    this.toggleLangKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.refreshHud();

    this.soundPlayed = false;
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
  }

  handleCollectKey() {
    if (this.hasKey) return;
    this.hasKey = true;
    this.keyItem.destroy();
    this.refreshHud();
    // Placeholder integration for sound requirement.
    if (!this.soundPlayed) {
      this.soundPlayed = true;
    }
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
    this.refreshHud();

    this.player.setTint(0xff0000);
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
