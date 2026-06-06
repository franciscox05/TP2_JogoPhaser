export class BaseRoomScene extends Phaser.Scene {
  constructor(key, cfg) {
    super(key);
    this.cfg = cfg;
  }

  create() {
    this.physics.world.setBounds(20, 0, 920, 540);

    const defaultRunState = {
      lives: 3,
      score: 0,
      phase: 1,
      level: 1,
      fuel: 100,
      shield: 0,
      combo: 0,
      bestCombo: 0,
      nearMisses: 0,
      elapsed: 0
    };
    this.state = { ...defaultRunState, ...(this.registry.get("runState") || {}) };

    this.lanes = [300, 480, 660];
    this.currentLane = 1;

    this.createTrackBackground();
    this.createTrackLimits();

    this.player = this.physics.add.sprite(this.lanes[this.currentLane], 450, "carroSprite").setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(60, 115).setOffset(20, 8);

    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.lifePickups = this.physics.add.group();
    this.shieldPickups = this.physics.add.group();

    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.langKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.hitCooldown = false;
    this.levelFinished = false;
    this.isPaused = false;
    this.isStarting = true;

    this.physics.add.collider(this.player, this.trackWalls);
    this.physics.add.overlap(this.player, this.obstacles, this.onHitObstacle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.onCollectCoin, null, this);
    this.physics.add.overlap(this.player, this.lifePickups, this.onCollectLife, null, this);
    this.physics.add.overlap(this.player, this.shieldPickups, this.onCollectShield, null, this);

    this.createHud();
    this.updateHud();
    this.showLevelIntro();

    this.lastObstacleSpawn = 0;
    this.lastCoinSpawn = 0;
    this.lastLifeSpawnTime = 0;
    this.activeLifePickup = null;
    this.lastShieldSpawnTime = 0;
    this.activeShieldPickup = null;

    this.startBackgroundMusic();

    this.gameTimer = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.levelFinished || this.isPaused || this.isStarting) return;

        this.state.elapsed += 0.1;
        this.state.score += 1;
        this.state.fuel = Math.max(0, this.state.fuel - this.getFuelDrainPerTick());

        if (this.state.fuel <= 0) {
          this.centerHint.setText(this.t("fuelEmpty"));
          this.endRun(false);
          return;
        }

        this.updatePhaseByScore();
        this.updateHud();

        if (this.state.score >= this.cfg.targetScore) {
          this.finishLevel();
        }
      }
    });
    // Ativa o som do motor em loop com volume moderado (40%)
    this.engineAudio = this.sound.add("engineLoop", { loop: true, volume: 0.4 });
    this.engineAudio.play();
  }

  createTrackBackground() {
    this.createGeneratedTextures();

    const g = this.add.graphics();
    g.fillStyle(0x2f2f2f, 1);
    g.fillRect(0, 0, 960, 540);

    g.fillStyle(0x1d1d1d, 1);
    g.fillRect(220, 0, 520, 540);

    g.fillStyle(0x3f3f3f, 1);
    g.fillRect(220, 0, 20, 540);
    g.fillRect(720, 0, 20, 540);

    // Bordas amarelas da estrada para destacar limites
    g.fillStyle(0xf1c40f, 0.95);
    g.fillRect(238, 0, 4, 540);
    g.fillRect(718, 0, 4, 540);

    // Divisorias principais das 3 pistas com contraste melhor
    g.fillStyle(0xffffff, 0.42);
    g.fillRect(390, 0, 10, 540);
    g.fillRect(558, 0, 10, 540);

    this.roadLines = this.add.group();
    for (let i = 0; i < 8; i += 1) {
      const y = i * 90;
      const l1 = this.add.rectangle(396, y, 6, 45, 0xffffff).setAlpha(0.65);
      const l2 = this.add.rectangle(564, y + 45, 6, 45, 0xffffff).setAlpha(0.65);
      this.roadLines.add(l1);
      this.roadLines.add(l2);
    }

    // Cenário lateral em movimento (postes/placas)
    this.sideScenery = this.add.group();
    for (let i = 0; i < 8; i += 1) {
      const y = i * 80 + Phaser.Math.Between(-20, 20);

      const leftPost = this.add.rectangle(120, y, 12, 42, 0x4f6d7a).setAlpha(0.85);
      const rightPost = this.add.rectangle(840, y + 35, 12, 42, 0x4f6d7a).setAlpha(0.85);
      const leftSign = this.add.rectangle(150, y + 8, 36, 20, 0x6aa6d8).setAlpha(0.9);
      const rightSign = this.add.rectangle(810, y + 20, 36, 20, 0x6aa6d8).setAlpha(0.9);

      this.sideScenery.add(leftPost);
      this.sideScenery.add(rightPost);
      this.sideScenery.add(leftSign);
      this.sideScenery.add(rightSign);
    }

  }

  createGeneratedTextures() {
    if (!this.textures.exists("lifeSprite")) {
      const life = this.add.graphics();
      life.fillStyle(0xe74c3c, 1);
      life.fillCircle(14, 14, 14);
      life.fillStyle(0xffffff, 1);
      life.fillRect(12, 5, 4, 18);
      life.fillRect(5, 12, 18, 4);
      life.generateTexture("lifeSprite", 28, 28);
      life.destroy();
    }

    if (!this.textures.exists("shieldSprite")) {
      const shield = this.add.graphics();
      shield.fillStyle(0x1b7bd1, 1);
      shield.fillRoundedRect(6, 2, 28, 34, 8);
      shield.fillStyle(0x91e8ff, 1);
      shield.fillRoundedRect(11, 7, 18, 22, 5);
      shield.fillStyle(0xffffff, 0.95);
      shield.fillTriangle(20, 9, 28, 17, 20, 29);
      shield.generateTexture("shieldSprite", 40, 40);
      shield.destroy();
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
    const panel = this.add.rectangle(300, 40, 580, 72, 0x000000, 0.68).setDepth(30);
    panel.setStrokeStyle(2, 0x69bfff, 0.9);

    this.hudText = this.add.text(26, 16, "", {
      fontSize: "18px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setDepth(31);

    this.infoText = this.add.text(26, 44, "", {
      fontSize: "14px",
      color: "#dfefff",
      stroke: "#000000",
      strokeThickness: 3
    }).setDepth(31);

    this.progressBarBg = this.add.rectangle(26, 68, 552, 8, 0x101820, 0.95).setOrigin(0, 0.5).setDepth(31);
    this.progressBarFill = this.add.rectangle(26, 68, 1, 8, 0x69bfff, 1).setOrigin(0, 0.5).setDepth(32);

    this.fuelBox = this.add.rectangle(825, 34, 220, 30, 0x000000, 0.6).setDepth(30).setStrokeStyle(1, 0xffffff, 0.8);
    this.fuelBarBg = this.add.rectangle(825, 34, 180, 14, 0x1c1c1c, 0.95).setDepth(31);
    this.fuelBarFill = this.add.rectangle(735, 34, 180, 14, 0x2ecc71, 1).setOrigin(0, 0.5).setDepth(32);
    this.fuelLabel = this.add.text(825, 34, "", {
      fontSize: "13px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(33);

    this.centerHint = this.add.text(480, 510, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setDepth(31).setAlpha(0.9);

    this.pauseOverlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.52).setDepth(60).setVisible(false);
    this.pausePanel = this.add.rectangle(480, 270, 420, 300, 0x08111b, 0.88).setDepth(61).setVisible(false);
    this.pausePanel.setStrokeStyle(2, 0x69bfff, 0.9);

    this.pauseTitle = this.add.text(480, 180, this.t("paused"), {
      fontSize: "46px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(62).setVisible(false);

    this.pauseContinueBtn = this.createPauseButton(480, 245, this.t("pauseContinue"), () => this.togglePause());
    this.pauseRestartBtn = this.createPauseButton(480, 295, this.t("pauseRestart"), () => this.restartRun());
    this.pauseMenuBtn = this.createPauseButton(480, 345, this.t("pauseMenu"), () => this.goToMenu());

    this.pauseButtons = [this.pauseContinueBtn, this.pauseRestartBtn, this.pauseMenuBtn];
    this.pauseButtons.forEach((btn) => btn.container.setVisible(false));

    this.createTouchControls();
  }

  createTouchControls() {
    this.touchLeft = this.createTouchButton(86, 462, "<", () => this.tryMoveLane(-1));
    this.touchRight = this.createTouchButton(874, 462, ">", () => this.tryMoveLane(1));
  }

  createTouchButton(x, y, label, onClick) {
    const circle = this.add.circle(x, y, 42, 0x0b1e2c, 0.72).setDepth(34);
    circle.setStrokeStyle(2, 0x69bfff, 0.85);
    const text = this.add.text(x, y - 2, label, {
      fontSize: "34px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(35);

    circle.setInteractive({ useHandCursor: true });
    circle.on("pointerover", () => circle.setFillStyle(0x164765, 0.86));
    circle.on("pointerout", () => circle.setFillStyle(0x0b1e2c, 0.72));
    circle.on("pointerdown", onClick);

    return { circle, text };
  }

  createPauseButton(x, y, label, onClick) {
    const rect = this.add.rectangle(x, y, 240, 38, 0x1f4f7a, 0.95).setDepth(62).setStrokeStyle(1, 0xbbe6ff, 0.9);
    const text = this.add.text(x, y, label, {
      fontSize: "18px",
      color: "#ffffff"
    }).setOrigin(0.5).setDepth(63);

    rect.setInteractive({ useHandCursor: true });
    rect.on("pointerover", () => rect.setFillStyle(0x2d6fa8, 1));
    rect.on("pointerout", () => rect.setFillStyle(0x1f4f7a, 0.95));
    rect.on("pointerdown", onClick);

    rect.setVisible(false);
    text.setVisible(false);
    return { container: rect, text };
  }

  t(k) {
    const l = this.registry.get("lang") || "pt";
    return (this.registry.get("i18n")[l] || {})[k] ?? k;
  }

  format(k, values) {
    return this.t(k).replace(/\{(\w+)\}/g, (_match, key) => values[key] ?? "");
  }

  showLevelIntro() {
    this.centerHint.setText(this.format("roomIntro", { room: this.cfg.roomNumber, score: this.cfg.targetScore }));
    this.time.delayedCall(1300, () => {
      this.isStarting = false;
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
  }

  updateHud() {
    const fuelRounded = Math.round(this.state.fuel);
    this.hudText.setText(
      `${this.t("hudLives")}: ${this.state.lives}   ${this.t("hudShield")}: ${this.state.shield}   ${this.t("hudCombo")}: x${this.state.combo}   ${this.t("hudScore")}: ${this.state.score}   ${this.t("hudRoom")}: ${this.cfg.roomNumber}`
    );
    this.infoText.setText(`${this.t("hudControls")} | ${this.t("hudObjective")}: ${this.cfg.targetScore}`);

    const roomStartScore = this.cfg.previousTargetScore ?? 0;
    const roomProgress = Phaser.Math.Clamp((this.state.score - roomStartScore) / (this.cfg.targetScore - roomStartScore), 0, 1);
    this.progressBarFill.width = 552 * roomProgress;

    const ratio = Phaser.Math.Clamp(this.state.fuel / 100, 0, 1);
    this.fuelBarFill.width = 180 * ratio;
    this.fuelBarFill.fillColor = ratio > 0.5 ? 0x2ecc71 : ratio > 0.25 ? 0xf1c40f : 0xe74c3c;
    this.fuelLabel.setText(`${this.t("hudFuel")}: ${fuelRounded}%`);

    if (!this.levelFinished && !this.isPaused) {
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
        if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
      });
    }
  }

  getObstacleSpeed() {
    return this.cfg.baseSpeed + (this.state.phase - 1) * this.cfg.phaseSpeedBoost;
  }

  getFuelDrainPerTick() {
    const byPhase = 1 + (this.state.phase - 1) * 0.22;
    const byLevel = 1 + (this.cfg.roomNumber - 1) * 0.18;
    return this.cfg.fuelDrainPerTick * byPhase * byLevel;
  }

  getObstacleSpawnDelay() {
    return Math.max(this.cfg.minSpawnDelay ?? 620, this.cfg.baseSpawnDelay - (this.state.phase - 1) * 90);
  }

  hasLaneSpace(group, laneIndex, minGap) {
    const laneX = this.lanes[laneIndex];
    return !group.getChildren().some((obj) => obj.active && Math.abs(obj.x - laneX) < 5 && obj.y < minGap);
  }

  getBlockedLanesAhead(extraLane = null) {
    const blocked = new Set(extraLane === null ? [] : [extraLane]);
    const playerY = this.player?.y ?? 450;

    this.obstacles.getChildren().forEach((obstacle) => {
      if (!obstacle.active) return;
      const y = obstacle.y;
      const lane = obstacle.getData("lane");
      if (y > -120 && y < playerY + 80) blocked.add(lane);
    });

    return blocked;
  }

  canSpawnObstacleInLane(lane) {
    if (!this.hasLaneSpace(this.obstacles, lane, this.cfg.obstacleMinGap ?? 280)) return false;
    return this.getBlockedLanesAhead(lane).size <= 2;
  }

  spawnObstacle() {
    const order = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    const lane = order.find((idx) => this.canSpawnObstacleInLane(idx));
    if (lane === undefined) return;

    const obstacle = this.obstacles.create(this.lanes[lane], -70, "taxiSprite").setDepth(8);
    obstacle.body.setSize(58, 110).setOffset(22, 10);
    obstacle.setData("speed", this.getObstacleSpeed());
    obstacle.setData("lane", lane);
  }

  spawnCoin() {
    const order = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    const lane = order.find((idx) => this.hasLaneSpace(this.coins, idx, 170) && this.hasLaneSpace(this.obstacles, idx, 170));
    if (lane === undefined) return;

    const coin = this.coins.create(this.lanes[lane], -34, "gasolinaSprite").setDepth(8);
    coin.body.setSize(24, 24).setOffset(4, 4);
    coin.setData("speed", Math.max(180, this.getObstacleSpeed() - 60));
    coin.setData("lane", lane);
  }

  onHitObstacle(_player, obstacle) {
    if (this.hitCooldown || this.levelFinished) return;

    this.hitCooldown = true;
    obstacle.destroy();

    if (this.state.shield > 0) {
      this.state.shield -= 1;
      this.state.combo = 0;
      this.player.setTint(0x66d9ff);
      this.cameras.main.shake(90, 0.004);
      this.centerHint.setText(this.t("shieldBlocked"));
      this.time.delayedCall(280, () => {
        this.player.clearTint();
        this.hitCooldown = false;
        if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
      });
      this.updateHud();
      return;
    }

    this.state.lives -= 1;
    this.state.combo = 0;
    this.state.fuel = Math.max(0, this.state.fuel - this.cfg.hitFuelPenalty);
    this.player.setTint(0xff4d4d);
    this.cameras.main.shake(120, 0.007);
    this.centerHint.setText(this.t("hitObstacle"));

    this.time.delayedCall(260, () => {
      this.player.clearTint();
      this.hitCooldown = false;
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });

    this.updateHud();

    if (this.state.lives <= 0 || this.state.fuel <= 0) {
      this.endRun(false);
    }
  }

  onCollectCoin(_player, coin) {
    coin.destroy();
    this.state.score += this.cfg.coinScore;
    this.state.fuel = Math.min(100, this.state.fuel + this.cfg.coinFuelBonus);
    this.centerHint.setText(this.t("coinCollected"));
    this.time.delayedCall(500, () => {
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updatePhaseByScore();
    this.updateHud();
  }

  onCollectLife(_player, life) {
    life.destroy();
    this.activeLifePickup = null;
    this.state.lives = Math.min(3, this.state.lives + 1);
    this.centerHint.setText(this.t("lifeCollected"));
    this.time.delayedCall(600, () => {
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updateHud();
  }

  onCollectShield(_player, shield) {
    shield.destroy();
    this.activeShieldPickup = null;
    this.state.shield = Math.min(1, this.state.shield + 1);
    this.centerHint.setText(this.t("shieldCollected"));
    this.player.setTint(0x66d9ff);
    this.time.delayedCall(550, () => {
      this.player.clearTint();
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updateHud();
  }

  awardNearMiss(obstacle) {
    const obstacleLane = obstacle.getData("lane");
    if (Math.abs(obstacleLane - this.currentLane) !== 1) return;

    this.state.combo = Math.min(this.state.combo + 1, 9);
    this.state.bestCombo = Math.max(this.state.bestCombo, this.state.combo);
    this.state.nearMisses += 1;

    const multiplier = Math.min(this.state.combo, 5);
    const bonus = this.cfg.nearMissScore * multiplier;
    this.state.score += bonus;

    const label = `+${bonus} ${this.t("nearMiss")} (${this.t("combo")} x${this.state.combo})`;
    this.centerHint.setText(label);
    this.showFloatingScore(label);
    this.time.delayedCall(650, () => {
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updatePhaseByScore();
    this.updateHud();
  }

  showFloatingScore(label) {
    const text = this.add.text(this.player.x, this.player.y - 92, label, {
      fontSize: "18px",
      color: "#f9e86d",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(35);

    this.tweens.add({
      targets: text,
      y: text.y - 38,
      alpha: 0,
      duration: 650,
      ease: "Sine.Out",
      onComplete: () => text.destroy()
    });
  }

  trySpawnLifePickup(now) {
    if (this.state.lives !== 1) return;
    if (this.activeLifePickup && this.activeLifePickup.active) return;
    if (now - this.lastLifeSpawnTime < this.cfg.lifeRespawnDelay) return;

    const order = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    const lane = order.find((idx) => this.hasLaneSpace(this.obstacles, idx, 220) && this.hasLaneSpace(this.coins, idx, 160));
    if (lane === undefined) return;

    const life = this.lifePickups.create(this.lanes[lane], -36, "lifeSprite").setDepth(8);
    life.body.setSize(24, 24).setOffset(2, 2);
    life.setData("speed", Math.max(170, this.getObstacleSpeed() - 70));
    life.setData("spawnTime", now);

    this.activeLifePickup = life;
    this.lastLifeSpawnTime = now;
    this.centerHint.setText(this.t("lifeAppeared"));
    this.time.delayedCall(800, () => {
      if (!this.levelFinished && !this.isPaused && this.state.lives === 1) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
  }

  trySpawnShieldPickup(now) {
    if (this.state.shield > 0) return;
    if (this.activeShieldPickup && this.activeShieldPickup.active) return;
    if (now - this.lastShieldSpawnTime < this.cfg.shieldRespawnDelay) return;
    if (this.state.fuel > 70 && this.state.lives > 2) return;

    const order = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    const lane = order.find((idx) => this.hasLaneSpace(this.obstacles, idx, 220) && this.hasLaneSpace(this.coins, idx, 150));
    if (lane === undefined) return;

    const shield = this.shieldPickups.create(this.lanes[lane], -40, "shieldSprite").setDepth(8);
    shield.body.setSize(26, 30).setOffset(7, 5);
    shield.setData("speed", Math.max(175, this.getObstacleSpeed() - 80));
    shield.setData("spawnTime", now);

    this.activeShieldPickup = shield;
    this.lastShieldSpawnTime = now;
    this.centerHint.setText(this.t("shieldAppeared"));
    this.time.delayedCall(800, () => {
      if (!this.levelFinished && !this.isPaused && this.state.shield === 0) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
  }

  finishLevel() {
    this.levelFinished = true;
    this.obstacles.clear(true, true);
    this.coins.clear(true, true);
    this.lifePickups.clear(true, true);
    this.shieldPickups.clear(true, true);

    this.centerHint.setText(this.t("levelClear"));

    this.registry.set("runState", {
      ...this.state,
      level: this.cfg.roomNumber,
      phase: 1,
      shield: Math.min(1, this.state.shield),
      fuel: Math.max(35, this.state.fuel)
    });

    this.time.delayedCall(1000, () => {
      // Para o motor antes de saltar para o próximo nível
      if (this.engineAudio) this.engineAudio.stop(); 
      this.stopBackgroundMusic();
      
      if (this.cfg.final) {
        this.endRun(true);
      } else {
        this.scene.start(this.cfg.nextScene);
      }
    });
  }

  endRun(victory) {
    if (this.engineAudio) this.engineAudio.stop();
    this.stopBackgroundMusic();
    this.registry.set("runState", this.state);
    this.scene.start("EndScene", {
      victory,
      score: this.state.score,
      phase: this.state.phase,
      level: this.cfg.roomNumber,
      elapsed: this.state.elapsed,
      bestCombo: this.state.bestCombo,
      nearMisses: this.state.nearMisses
    });
  }

  restartRun() {
    // Para o motor antes de reiniciar a partida
    if (this.engineAudio) this.engineAudio.stop(); 
    this.stopBackgroundMusic();
    this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, shield: 0, combo: 0, bestCombo: 0, nearMisses: 0, elapsed: 0 });
    this.scene.start("Room1Scene");
  }

  goToMenu() {
    // Para o motor antes de voltar ao menu principal
    if (this.engineAudio) this.engineAudio.stop(); 
    this.stopBackgroundMusic();
    this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, shield: 0, combo: 0, bestCombo: 0, nearMisses: 0, elapsed: 0 });
    this.scene.start("MenuScene");
  }

  tryMoveLane(dir) {
    if (this.levelFinished || this.isPaused || this.isStarting) return;
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

  togglePause() {
    if (this.levelFinished) return;
    this.isPaused = !this.isPaused;
    this.physics.world.isPaused = this.isPaused;

    this.pauseOverlay.setVisible(this.isPaused);
    this.pausePanel.setVisible(this.isPaused);
    this.pauseTitle.setVisible(this.isPaused);

    this.pauseContinueBtn.container.setVisible(this.isPaused);
    this.pauseContinueBtn.text.setVisible(this.isPaused);
    this.pauseRestartBtn.container.setVisible(this.isPaused);
    this.pauseRestartBtn.text.setVisible(this.isPaused);
    this.pauseMenuBtn.container.setVisible(this.isPaused);
    this.pauseMenuBtn.text.setVisible(this.isPaused);

    if (!this.isPaused) this.updateHud();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.langKey)) {
      const c = this.registry.get("lang") || "pt";
      this.registry.set("lang", c === "pt" ? "en" : "pt");
      this.pauseTitle.setText(this.t("paused"));
      this.pauseContinueBtn.text.setText(this.t("pauseContinue"));
      this.pauseRestartBtn.text.setText(this.t("pauseRestart"));
      this.pauseMenuBtn.text.setText(this.t("pauseMenu"));
      this.updateHud();
    }

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
      
      // GESTÃO DE ÁUDIO NA PAUSA: Trava ou retoma o motor conforme o estado do jogo
      if (this.engineAudio) {
        if (this.isPaused) this.engineAudio.pause();
        else this.engineAudio.resume();
      }
    }

    if (this.isPaused) return;
    if (this.isStarting) return;

    if (Phaser.Input.Keyboard.JustDown(this.leftKey) || Phaser.Input.Keyboard.JustDown(this.aKey)) this.tryMoveLane(-1);
    if (Phaser.Input.Keyboard.JustDown(this.rightKey) || Phaser.Input.Keyboard.JustDown(this.dKey)) this.tryMoveLane(1);

    if (!this.levelFinished) {
      const speed = this.getObstacleSpeed();

      // --- DINÂMICA DO SOM DO MOTOR ---
      if (this.engineAudio) {
        if (this.engineAudio.isPaused) this.engineAudio.resume();
        
        const currentScore = this.state.score || 0;
        const targetRate = Math.min(2, 1 + (currentScore * 0.002));
        
        this.engineAudio.setRate(targetRate);
      }
      // ---------------------------------

      this.roadLines.getChildren().forEach((line) => {
        line.y += speed * 0.18;
        if (line.y > 580) line.y = -40;
      });

      this.sideScenery.getChildren().forEach((obj) => {
        obj.y += speed * 0.12;
        if (obj.y > 590) obj.y = -40;
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
      this.trySpawnLifePickup(now);
      this.trySpawnShieldPickup(now);

      this.obstacles.getChildren().forEach((obstacle) => {
        obstacle.y += obstacle.getData("speed") * 0.016;
        if (!obstacle.getData("nearMissChecked") && obstacle.y > this.player.y) {
          obstacle.setData("nearMissChecked", true);
          this.awardNearMiss(obstacle);
        }
        if (obstacle.y > 620) obstacle.destroy();
      });

      this.coins.getChildren().forEach((coin) => {
        coin.y += coin.getData("speed") * 0.016;
        if (coin.y > 620) coin.destroy();
      });

      this.lifePickups.getChildren().forEach((life) => {
        life.y += life.getData("speed") * 0.016;
        const livedFor = now - life.getData("spawnTime");
        if (life.y > 620 || livedFor > this.cfg.lifeVisibleMs) {
          if (this.activeLifePickup === life) this.activeLifePickup = null;
          life.destroy();
        }
      });

      this.shieldPickups.getChildren().forEach((shield) => {
        shield.y += shield.getData("speed") * 0.016;
        const livedFor = now - shield.getData("spawnTime");
        if (shield.y > 620 || livedFor > this.cfg.shieldVisibleMs) {
          if (this.activeShieldPickup === shield) this.activeShieldPickup = null;
          shield.destroy();
        }
      });
    }
  }

  startBackgroundMusic() {
    if (this.bgMusic && this.bgMusic.isPlaying) return;
    this.bgMusic = this.sound.add("engineStart", { loop: true, volume: 0.18 });
    this.bgMusic.play();
  }

  stopBackgroundMusic() {
    if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
  }
}
