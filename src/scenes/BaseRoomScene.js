export class BaseRoomScene extends Phaser.Scene {
  constructor(key, cfg) {
    super(key);
    this.cfg = cfg;
  }

  create() {
    this.physics.world.setBounds(20, 0, 920, 540);

    this.state = this.registry.get("runState") || {
      lives: 3,
      score: 0,
      phase: 1,
      level: 1,
      elapsed: 0
    };

    this.lanes = [300, 480, 660];
    this.currentLane = 1;

    this.createTrackBackground();
    this.createTrackLimits();

    this.player = this.physics.add.sprite(this.lanes[this.currentLane], 450, "carroSprite").setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(60, 115).setOffset(20, 8);

    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();

    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.langKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);

    this.hitCooldown = false;
    this.levelFinished = false;

    this.physics.add.collider(this.player, this.trackWalls);
    this.physics.add.overlap(this.player, this.obstacles, this.onHitObstacle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.onCollectCoin, null, this);

    this.createHud();
    this.updateHud();

    this.lastObstacleSpawn = 0;
    this.lastCoinSpawn = 0;

    this.gameTimer = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.levelFinished) return;

        this.state.elapsed += 0.1;
        this.state.score += 1;
        this.updatePhaseByScore();
        this.updateHud();

        if (this.state.score >= this.cfg.targetScore) {
          this.finishLevel();
        }
      }
    });
  }

  createTrackBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x2f2f2f, 1);
    g.fillRect(0, 0, 960, 540);

    // Estrada
    g.fillStyle(0x1d1d1d, 1);
    g.fillRect(220, 0, 520, 540);

    // Bermas
    g.fillStyle(0x3f3f3f, 1);
    g.fillRect(220, 0, 20, 540);
    g.fillRect(720, 0, 20, 540);

    // Linhas separadoras das 3 pistas
    g.fillStyle(0xffffff, 0.3);
    g.fillRect(392, 0, 8, 540);
    g.fillRect(560, 0, 8, 540);

    // Linhas tracejadas animadas
    this.roadLines = this.add.group();
    for (let i = 0; i < 8; i += 1) {
      const y = i * 90;
      const l1 = this.add.rectangle(396, y, 6, 45, 0xffffff).setAlpha(0.65);
      const l2 = this.add.rectangle(564, y + 45, 6, 45, 0xffffff).setAlpha(0.65);
      this.roadLines.add(l1);
      this.roadLines.add(l2);
    }
  }

  createTrackLimits() {
    this.trackWalls = this.physics.add.staticGroup();

    for (let y = 0; y <= 560; y += 40) {
      this.trackWalls.create(220, y, "metaSprite").setScale(0.001).refreshBody();
      this.trackWalls.create(740, y, "metaSprite").setScale(0.001).refreshBody();
    }

    this.finishLine = this.add.rectangle(480, 70, 520, 16, 0x2ea043).setDepth(3).setAlpha(0.35);
  }

  createHud() {
    const panel = this.add.rectangle(210, 38, 390, 58, 0x000000, 0.45).setDepth(30);
    panel.setStrokeStyle(1, 0x999999, 0.8);

    this.hudText = this.add.text(20, 20, "", {
      fontSize: "18px",
      color: "#f5f5f5"
    }).setDepth(31);

    this.infoText = this.add.text(20, 48, "", {
      fontSize: "14px",
      color: "#d4d4d4"
    }).setDepth(31);

    this.centerHint = this.add.text(480, 510, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setDepth(31).setAlpha(0.85);
  }

  t(k) {
    const l = this.registry.get("lang") || "pt";
    return (this.registry.get("i18n")[l] || {})[k] ?? k;
  }

  updateHud() {
    this.hudText.setText(
      `${this.t("hudLives")}: ${this.state.lives}   ${this.t("hudScore")}: ${this.state.score}   ${this.t("hudPhase")}: ${this.state.phase}   ${this.t("hudRoom")}: ${this.cfg.roomNumber}`
    );
    this.infoText.setText("A/LEFT e D/RIGHT para trocar de pista | L idioma");

    if (!this.levelFinished) {
      this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    }
  }

  updatePhaseByScore() {
    let nextPhase = 1;
    if (this.state.score >= this.cfg.phase2Score) nextPhase = 2;
    if (this.state.score >= this.cfg.phase3Score) nextPhase = 3;

    if (nextPhase !== this.state.phase) {
      this.state.phase = nextPhase;
      this.centerHint.setText(`${this.t("phaseUp")} ${nextPhase}`);
      this.time.delayedCall(1200, () => {
        if (!this.levelFinished) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
      });
    }
  }

  getObstacleSpeed() {
    return this.cfg.baseSpeed + (this.state.phase - 1) * this.cfg.phaseSpeedBoost;
  }

  getObstacleSpawnDelay() {
    return Math.max(420, this.cfg.baseSpawnDelay - (this.state.phase - 1) * 120);
  }

  spawnObstacle() {
    const lane = Phaser.Math.Between(0, 2);
    const obstacle = this.obstacles.create(this.lanes[lane], -60, "taxiSprite").setDepth(8);
    obstacle.body.setSize(58, 110).setOffset(22, 10);
    obstacle.setData("speed", this.getObstacleSpeed() + Phaser.Math.Between(-25, 35));
  }

  spawnCoin() {
    const lane = Phaser.Math.Between(0, 2);
    const coin = this.coins.create(this.lanes[lane], -30, "gasolinaSprite").setDepth(8);
    coin.body.setSize(24, 24).setOffset(4, 4);
    coin.setData("speed", this.getObstacleSpeed() - 40);
  }

  onHitObstacle(_player, obstacle) {
    if (this.hitCooldown || this.levelFinished) return;

    this.hitCooldown = true;
    obstacle.destroy();

    this.state.lives -= 1;
    this.player.setTint(0xff4d4d);
    this.cameras.main.shake(120, 0.007);
    this.centerHint.setText(this.t("hitObstacle"));

    this.time.delayedCall(260, () => {
      this.player.clearTint();
      this.hitCooldown = false;
      if (!this.levelFinished) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });

    this.updateHud();

    if (this.state.lives <= 0) {
      this.endRun(false);
    }
  }

  onCollectCoin(_player, coin) {
    coin.destroy();
    this.state.score += this.cfg.coinScore;
    this.centerHint.setText(this.t("coinCollected"));
    this.time.delayedCall(400, () => {
      if (!this.levelFinished) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updatePhaseByScore();
    this.updateHud();
  }

  finishLevel() {
    this.levelFinished = true;
    this.obstacles.clear(true, true);
    this.coins.clear(true, true);

    this.centerHint.setText(this.t("levelClear"));

    this.registry.set("runState", {
      ...this.state,
      level: this.cfg.roomNumber
    });

    this.time.delayedCall(1000, () => {
      if (this.cfg.final) {
        this.endRun(true);
      } else {
        this.scene.start(this.cfg.nextScene);
      }
    });
  }

  endRun(victory) {
    this.registry.set("runState", this.state);
    this.scene.start("EndScene", { victory, score: this.state.score, phase: this.state.phase });
  }

  tryMoveLane(dir) {
    if (this.levelFinished) return;
    const nextLane = Phaser.Math.Clamp(this.currentLane + dir, 0, 2);
    if (nextLane === this.currentLane) return;

    this.currentLane = nextLane;

    this.tweens.add({
      targets: this.player,
      x: this.lanes[this.currentLane],
      duration: 110,
      ease: "Sine.Out"
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.langKey)) {
      const c = this.registry.get("lang") || "pt";
      this.registry.set("lang", c === "pt" ? "en" : "pt");
      this.updateHud();
    }

    if (Phaser.Input.Keyboard.JustDown(this.leftKey) || Phaser.Input.Keyboard.JustDown(this.aKey)) this.tryMoveLane(-1);
    if (Phaser.Input.Keyboard.JustDown(this.rightKey) || Phaser.Input.Keyboard.JustDown(this.dKey)) this.tryMoveLane(1);

    if (!this.levelFinished) {
      const speed = this.getObstacleSpeed();

      this.roadLines.getChildren().forEach((line) => {
        line.y += speed * 0.18;
        if (line.y > 580) line.y = -40;
      });

      const now = this.time.now;
      if (now - this.lastObstacleSpawn > this.getObstacleSpawnDelay()) {
        this.lastObstacleSpawn = now;
        this.spawnObstacle();
      }
      if (now - this.lastCoinSpawn > this.cfg.coinSpawnDelay) {
        this.lastCoinSpawn = now;
        this.spawnCoin();
      }

      this.obstacles.getChildren().forEach((obstacle) => {
        obstacle.y += obstacle.getData("speed") * 0.016;
        if (obstacle.y > 620) obstacle.destroy();
      });

      this.coins.getChildren().forEach((coin) => {
        coin.y += coin.getData("speed") * 0.016;
        if (coin.y > 620) coin.destroy();
      });
    }
  }
}
