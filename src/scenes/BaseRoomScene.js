export class BaseRoomScene extends Phaser.Scene {
  // Cena base reutilizada pelos tres niveis.
  // As cenas Room1/Room2/Room3 mudam apenas a configuracao de dificuldade.
  constructor(key, cfg) {
    super(key);
    this.cfg = cfg;
  }

  create() {
    // Limites fisicos da zona jogavel da estrada.
    this.physics.world.setBounds(20, 0, 920, 540);

    // Estado persistente da corrida. Ao passar de sala mantemos pontuacao,
    // vidas, combustivel, escudo e estatisticas de combo.
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

    // Tres pistas fixas: o jogador fica sempre centrado num destes X.
    this.lanes = [300, 480, 660];
    this.currentLane = 1;
    this.lastLaneChangeTime = -9999;
    this.laneLastObstacleTime = [0, 0, 0];

    this.createTrackBackground();
    this.createTrackLimits();

    this.player = this.physics.add.sprite(this.lanes[this.currentLane], 450, "carroSprite").setDepth(10).setScale(0.15);
    // O spritesheet tem espaco transparente a direita; este origin centra
    // a parte visivel do carro no meio da pista.
    this.player.setOrigin(0.324, 0.5);
    this.player.setCollideWorldBounds(true);
    // Hitbox um pouco menor que o desenho para a colisao parecer justa.
    this.setBodyBox(this.player, 0.58, 0.82);

    if (!this.anims.exists("luzesPlayer")) {
      this.anims.create({
        key: "luzesPlayer",
        frames: this.anims.generateFrameNumbers("carroSprite", { frames: [0, 1] }),
        frameRate: 4,
        repeat: -1
      });
    }
    this.player.play("luzesPlayer");

    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.lifePickups = this.physics.add.group();
    this.shieldPickups = this.physics.add.group();

    // Controlos principais: setas/A-D, L para idioma e P para pausa.
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
    this._transitioning = false;

    // Cada grupo tem uma regra propria de colisao/recolha.
    this.physics.add.collider(this.player, this.trackWalls);
    this.physics.add.overlap(this.player, this.obstacles, this.onHitObstacle, null, this);
    this.physics.add.overlap(this.player, this.coins, this.onCollectCoin, null, this);
    this.physics.add.overlap(this.player, this.lifePickups, this.onCollectLife, null, this);
    this.physics.add.overlap(this.player, this.shieldPickups, this.onCollectShield, null, this);

    this.createHud();
    this.updateHud();
    this.showLevelIntro();

    // Temporizadores de spawn. laneLastObstacleTime evita pistas vazias
    // durante tempo excessivo.
    this.lastObstacleSpawn = 0;
    this.lastCoinSpawn = 0;
    this.laneLastObstacleTime = [this.time.now, this.time.now, this.time.now];
    this.lastLifeSpawnTime = 0;
    this.activeLifePickup = null;
    this.lastShieldSpawnTime = 0;
    this.activeShieldPickup = null;

    this.startBackgroundMusic();

    // Relogio principal: pontuacao passiva, combustivel, fases e fim da sala.
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
          this.endRun(false, "fuel");
          return;
        }

        this.updatePhaseByScore();
        this.updateHud();

        if (this.state.score >= this.cfg.targetScore) {
          this.finishLevel();
        }
      }
    });

    if (this.cache.audio.has("engineLoop")) {
      this.engineAudio = this.sound.add("engineLoop", { loop: true, volume: 0.4 });
      this.engineAudio.play();
    }

    this.cameras.main.fadeIn(350, 0, 0, 0);
}

  createTrackBackground() {
    this.createGeneratedTextures();

    // Fundo desenhado por codigo: estrada, bermas e marcadores de pista.
    const g = this.add.graphics();
    g.fillStyle(0x2f2f2f, 1);
    g.fillRect(0, 0, 960, 540);

    g.fillStyle(0x1d1d1d, 1);
    g.fillRect(220, 0, 520, 540);

    g.fillStyle(0x3f3f3f, 1);
    g.fillRect(220, 0, 20, 540);
    g.fillRect(720, 0, 20, 540);

    // Bordas amarelas da estrada para destacar limites.
    g.fillStyle(0xf1c40f, 0.95);
    g.fillRect(238, 0, 4, 540);
    g.fillRect(718, 0, 4, 540);

    // Divisorias principais das tres pistas.
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

    // Cenario lateral em movimento: postes e placas reforcam a sensacao de velocidade.
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
    // Texturas pequenas geradas em runtime para evitar ficheiros extra.
    if (!this.textures.exists("particleSprite")) {
      const p = this.add.graphics();
      p.fillStyle(0xffffff, 1);
      p.fillCircle(5, 5, 5);
      p.generateTexture("particleSprite", 10, 10);
      p.destroy();
    }

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
    // Paredes invisiveis nas laterais impedem o carro de sair da estrada.
    this.trackWalls = this.physics.add.staticGroup();

    for (let y = 0; y <= 560; y += 40) {
      this.trackWalls.create(220, y, "metaSprite").setScale(0.001).refreshBody();
      this.trackWalls.create(740, y, "metaSprite").setScale(0.001).refreshBody();
    }

    this.finishLine = this.add.rectangle(480, 70, 520, 16, 0x2ea043).setDepth(3).setAlpha(0.35);
  }

  createHud() {
    // --- Painel principal do HUD ---
    const panel = this.add.rectangle(340, 40, 660, 72, 0x000000, 0.68).setDepth(30);
    panel.setStrokeStyle(2, 0x69bfff, 0.9);

    this.hudText = this.add.text(44, 16, "", {
      fontSize: "16px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setDepth(31);

    this.infoText = this.add.text(26, 44, "", {
      fontSize: "13px",
      color: "#dfefff",
      stroke: "#000000",
      strokeThickness: 3
    }).setDepth(31);

    this.progressBarBg = this.add.rectangle(26, 68, 620, 8, 0x101820, 0.95).setOrigin(0, 0.5).setDepth(31);
    this.progressBarFill = this.add.rectangle(26, 68, 1, 8, 0x69bfff, 1).setOrigin(0, 0.5).setDepth(32);

    // --- Painel e barra de combustivel ---
    this.fuelBox = this.add.rectangle(825, 34, 220, 30, 0x000000, 0.6).setDepth(30).setStrokeStyle(1, 0xffffff, 0.8);
    this.fuelBarBg = this.add.rectangle(825, 34, 180, 14, 0x1c1c1c, 0.95).setDepth(31);
    this.fuelBarFill = this.add.rectangle(735, 34, 180, 14, 0x2ecc71, 1).setOrigin(0, 0.5).setDepth(32);
    this.fuelLabel = this.add.text(825, 34, "", {
      fontSize: "13px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(33);

    // --- Icones graficos do HUD ---
    this.hudIcons = this.add.graphics().setDepth(31);
    
    this.hudIcons.fillStyle(0xe74c3c, 1);
    this.hudIcons.fillCircle(28, 27, 5);
    this.hudIcons.fillCircle(38, 27, 5);
    this.hudIcons.fillTriangle(23, 29, 43, 29, 33, 42);

    // --- Indicacoes e overlay de pausa ---
    this.centerHint = this.add.text(480, 510, "", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#000000",
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setDepth(31).setAlpha(0.9);

    this.pauseOverlay = this.add.rectangle(480, 270, 960, 540, 0x000000, 0.52).setDepth(60).setVisible(false);
    
    this.pausePanel = this.add.rectangle(480, 310, 420, 380, 0x08111b, 0.88).setDepth(61).setVisible(false);
    this.pausePanel.setStrokeStyle(2, 0x69bfff, 0.9);

    this.pauseTitle = this.add.text(480, 150, this.t("paused"), {
      fontSize: "46px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(62).setVisible(false);

    // --- Botoes do menu de pausa ---
    this.pauseContinueBtn = this.createPauseButton(480, 210, this.t("pauseContinue"), () => this.togglePause());
    this.pauseRestartBtn = this.createPauseButton(480, 395, this.t("pauseRestart"), () => this.restartRun());
    this.pauseMenuBtn = this.createPauseButton(480, 445, this.t("pauseMenu"), () => this.goToMenu());

    this.pauseButtons = [this.pauseContinueBtn, this.pauseRestartBtn, this.pauseMenuBtn];
    this.pauseButtons.forEach((btn) => btn.container.setVisible(false));

    // --- Controlos de audio na pausa ---
    this.volumeLabel = this.add.text(330, 270, this.t("volume"), {
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0, 0.5).setDepth(62).setVisible(false);

    this.sliderBg = this.add.rectangle(490, 270, 160, 6, 0x555555).setDepth(62).setVisible(false);

    const savedVolume = parseFloat(localStorage.getItem("gameVolume") || "1.0");
    this.sound.volume = savedVolume;
    const initialHandleX = 410 + (savedVolume * 160);

    this.sliderHandle = this.add.circle(initialHandleX, 270, 8, 0x69bfff).setDepth(63).setVisible(false).setInteractive({ useHandCursor: true });
    this.input.setDraggable(this.sliderHandle);

    const savedMute = localStorage.getItem("gameMute") === "true";
    this.sound.mute = savedMute;
    const initialMuteText = `${this.t("mute")}: ${savedMute ? this.t("on") : this.t("off")}`;

    this.pauseMuteBtn = this.add.text(480, 325, initialMuteText, {
      fontSize: "18px",
      color: "#ffffff"
    }).setOrigin(0.5).setDepth(62).setVisible(false).setInteractive({ useHandCursor: true });

    // --- Grupo de elementos de audio para mostrar/esconder em conjunto ---
    this.pauseAudioElements = [this.volumeLabel, this.sliderBg, this.sliderHandle, this.pauseMuteBtn];

    // --- Logica de interacao do slider e mute ---
    this.input.on("drag", (pointer, gameObject, dragX) => {
      if (gameObject === this.sliderHandle) {
        const constrainedX = Phaser.Math.Clamp(dragX, 410, 570);
        gameObject.x = constrainedX;
        const newVolume = (constrainedX - 410) / 160;
        this.sound.volume = newVolume;
        localStorage.setItem("gameVolume", newVolume.toString());
      }
    });

    this.pauseMuteBtn.on("pointerdown", () => {
      const newMuteState = !this.sound.mute;
      this.sound.mute = newMuteState;
      localStorage.setItem("gameMute", newMuteState.toString());
      this.pauseMuteBtn.setText(`${this.t("mute")}: ${newMuteState ? this.t("on") : this.t("off")}`);
    });

    // --- Controlos tateis ---
    this.createTouchControls();
  }

  createTouchControls() {
    // Botoes laterais para mobile/tablet; usam a mesma funcao do teclado.
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

  setBodyBox(sprite, widthRatio, heightRatio) {
    // Phaser calcula a hitbox com base no frame original.
    // Racios deixam a hitbox proporcional ao sprite depois da escala visual.
    const bodyWidth = sprite.width * widthRatio;
    const bodyHeight = sprite.height * heightRatio;
    sprite.body.setSize(bodyWidth, bodyHeight, true);
  }

  t(k) {
    // Traducao simples com base no idioma guardado no registry global.
    const l = this.registry.get("lang") || "pt";
    return (this.registry.get("i18n")[l] || {})[k] ?? k;
  }

  format(k, values) {
    // Substitui placeholders como {room} ou {score}.
    return this.t(k).replace(/\{(\w+)\}/g, (_match, key) => values[key] ?? "");
  }

  playSound(key, config = {}) {
    if (this.cache.audio.has(key)) {
      this.sound.play(key, config);
    }
  }

  addParticleBurst(x, y, tint, count) {
    const emitter = this.add.particles(x, y, "particleSprite", {
      speed: { min: 80, max: 210 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      tint,
      emitting: false,
      depth: 15
    });
    emitter.explode(count);
    this.time.delayedCall(600, () => emitter.destroy());
  }

  showLevelIntro() {
    // Pequena pausa inicial para mostrar objetivo antes de comecar a gerar perigos.
    this.centerHint.setText(this.format("roomIntro", { room: this.cfg.roomNumber, score: this.cfg.targetScore }));
    this.time.delayedCall(1300, () => {
      this.isStarting = false;
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
  }

  updateHud() {
    // Atualiza textos, progresso da sala e cor da barra de combustivel.
    const fuelRounded = Math.round(this.state.fuel);
    this.hudText.setText(
      `${this.t("hudLives")}: ${this.state.lives}   ${this.t("hudShield")}: ${this.state.shield}   ${this.t("hudCombo")}: x${this.state.combo}   ${this.t("hudScore")}: ${this.state.score}   ${this.t("hudRoom")}: ${this.cfg.roomNumber}`
    );
    this.infoText.setText(`${this.t("hudControls")} | ${this.t("hudObjective")}: ${this.cfg.targetScore}`);

    const roomStartScore = this.cfg.previousTargetScore ?? 0;
    const roomProgress = Phaser.Math.Clamp((this.state.score - roomStartScore) / (this.cfg.targetScore - roomStartScore), 0, 1);
    this.progressBarFill.width = 620 * roomProgress;

    const ratio = Phaser.Math.Clamp(this.state.fuel / 100, 0, 1);
    this.fuelBarFill.width = 180 * ratio;
    this.fuelBarFill.fillColor = ratio > 0.5 ? 0x2ecc71 : ratio > 0.25 ? 0xf1c40f : 0xe74c3c;
    this.fuelLabel.setText(`${this.t("hudFuel")}: ${fuelRounded}%`);

    if (!this.levelFinished && !this.isPaused) {
      this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    }
  }

  updatePhaseByScore() {
    // A sala fica mais dificil quando a pontuacao passa os limites de fase.
    let nextPhase = 1;
    if (this.state.score >= this.cfg.phase2Score) nextPhase = 2;
    if (this.state.score >= this.cfg.phase3Score) nextPhase = 3;

    if (nextPhase !== this.state.phase) {
      this.state.phase = nextPhase;
      this.playSound("phaseUp", { volume: 0.6 });
      this.addParticleBurst(this.player.x, this.player.y - 50, 0xffd700, 14);
      this.centerHint.setText(`${this.t("phaseUp")} ${nextPhase}`);
      this.time.delayedCall(1200, () => {
        if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
      });
    }
  }

  getObstacleSpeed() {
    // Velocidade cresce por fase.
    return this.cfg.baseSpeed + (this.state.phase - 1) * this.cfg.phaseSpeedBoost;
  }

  getFuelDrainPerTick() {
    // Consumo cresce por fase e por sala para aumentar a pressao no fim.
    const byPhase = 1 + (this.state.phase - 1) * 0.22;
    const byLevel = 1 + (this.cfg.roomNumber - 1) * 0.18;
    return this.cfg.fuelDrainPerTick * byPhase * byLevel;
  }

  getObstacleSpawnDelay() {
    // Delay menor significa mais obstaculos; minSpawnDelay evita exageros injustos.
    const phaseReduction = this.cfg.phaseSpawnReduction ?? 90;
    const levelReduction = (this.cfg.roomNumber - 1) * (this.cfg.levelSpawnReduction ?? 25);
    return Math.max(this.cfg.minSpawnDelay ?? 620, this.cfg.baseSpawnDelay - (this.state.phase - 1) * phaseReduction - levelReduction);
  }

  hasLaneSpace(group, laneIndex, minGap) {
    // Evita criar dois objetos demasiado juntos na mesma pista.
    const laneX = this.lanes[laneIndex];
    return !group.getChildren().some((obj) => obj.active && Math.abs(obj.x - laneX) < 5 && obj.y < minGap);
  }

  getBlockedLanesAhead(extraLanes = []) {
    // Calcula pistas bloqueadas entre o topo e o jogador.
    // extraLanes permite testar uma onda nova antes de a criar.
    const laneList = Array.isArray(extraLanes)
      ? extraLanes
      : (extraLanes === null ? [] : [extraLanes]);
    const blocked = new Set(laneList);
    const playerY = this.player?.y ?? 450;

    this.obstacles.getChildren().forEach((obstacle) => {
      if (!obstacle.active) return;
      const y = obstacle.y;
      const lane = obstacle.getData("lane");
      if (y > -120 && y < playerY + 80) blocked.add(lane);
    });

    return blocked;
  }

  canSpawnObstacleWave(lanes) {
    // Regra anti-circuitos impossiveis:
    // a onda so nasce se, no total, nao bloquear as tres pistas.
    if (!lanes.every((lane) => this.hasLaneSpace(this.obstacles, lane, this.cfg.obstacleMinGap ?? 280))) return false;
    return this.getBlockedLanesAhead(lanes).size <= 2;
  }

  getDoubleObstacleChance() {
    // Probabilidade de duas pistas bloqueadas ao mesmo tempo.
    // Cresce com a fase e com a sala, ate ao limite configurado.
    const base = this.cfg.doubleObstacleChance ?? 0.12;
    const phaseBoost = (this.state.phase - 1) * (this.cfg.doubleObstaclePhaseBoost ?? 0.08);
    const levelBoost = (this.cfg.roomNumber - 1) * (this.cfg.doubleObstacleLevelBoost ?? 0.04);
    return Phaser.Math.Clamp(base + phaseBoost + levelBoost, 0, this.cfg.maxDoubleObstacleChance ?? 0.62);
  }

  getPlayerLanePressureChance() {
    // Probabilidade de pressionar a pista atual do jogador.
    // A validacao anti-impossivel continua a ser aplicada antes do spawn.
    const base = this.cfg.playerLanePressureChance ?? 0.45;
    const phaseBoost = (this.state.phase - 1) * (this.cfg.playerLanePressurePhaseBoost ?? 0.08);
    const levelBoost = (this.cfg.roomNumber - 1) * (this.cfg.playerLanePressureLevelBoost ?? 0.05);
    return Phaser.Math.Clamp(base + phaseBoost + levelBoost, 0, this.cfg.maxPlayerLanePressureChance ?? 0.82);
  }

  getStaleLanes() {
    // Pistas sem obstaculos durante tempo demais ganham prioridade.
    // Isto evita que uma linha fique vazia durante muitos segundos.
    const now = this.time.now;
    const threshold = this.cfg.maxLaneIdleMs ?? 3200;
    return this.lanes
      .map((_x, lane) => lane)
      .filter((lane) => now - this.laneLastObstacleTime[lane] > threshold);
  }

  getWaveLaneAge(wave) {
    // Idade da pista mais antiga dentro de uma onda candidata.
    const now = this.time.now;
    return Math.max(...wave.map((lane) => now - this.laneLastObstacleTime[lane]));
  }

  createObstacleAtLane(lane, waveSize) {
    // Camioes so aparecem em ondas simples: sao mais lentos/maiores,
    // por isso nao os juntamos com bloqueios duplos.
    const isTruck = waveSize === 1 && Phaser.Math.FloatBetween(0, 1) < (this.cfg.truckChance ?? 0.12);
    const obstacle = this.obstacles.create(this.lanes[lane], -70, "taxiSprite");
    obstacle.setDepth(8);

    if (isTruck) {
      obstacle.setScale(0.35).setTint(0xff8c00);
      this.setBodyBox(obstacle, 0.50, 0.68);
      obstacle.setData("speed", this.getObstacleSpeed() * (this.cfg.truckSpeedFactor ?? 0.68));
    } else {
      obstacle.setScale(0.22).clearTint();
      this.setBodyBox(obstacle, 0.46, 0.66);
      obstacle.setData("speed", this.getObstacleSpeed());
    }

    obstacle.setData("lane", lane);
    obstacle.setData("isTruck", isTruck);
    this.laneLastObstacleTime[lane] = this.time.now;
  }

  spawnObstacle() {
    // Pipeline de spawn:
    // 1. escolhe onda simples ou dupla conforme a dificuldade;
    // 2. remove ondas sem espaco ou que fechariam as tres pistas;
    // 3. prioriza pistas ha mais tempo sem carros;
    // 4. aplica alguma pressao sobre a pista atual do jogador.
    const allWaves = [
      [0], [1], [2],
      [0, 1], [0, 2], [1, 2]
    ];
    const shouldDouble = Phaser.Math.FloatBetween(0, 1) < this.getDoubleObstacleChance();
    const wantedSize = shouldDouble ? 2 : 1;
    let candidates = allWaves.filter((wave) => wave.length === wantedSize && this.canSpawnObstacleWave(wave));

    if (candidates.length === 0 && wantedSize === 2) {
      candidates = allWaves.filter((wave) => wave.length === 1 && this.canSpawnObstacleWave(wave));
    }

    if (candidates.length === 0) return;

    const staleLanes = this.getStaleLanes();
    const staleWaves = candidates.filter((wave) => staleLanes.some((lane) => wave.includes(lane)));
    if (staleWaves.length > 0) {
      const oldestAge = Math.max(...staleWaves.map((wave) => this.getWaveLaneAge(wave)));
      candidates = staleWaves.filter((wave) => this.getWaveLaneAge(wave) === oldestAge);
    }

    const pressureWaves = candidates.filter((wave) => wave.includes(this.currentLane));
    if (staleWaves.length === 0 && pressureWaves.length > 0 && Phaser.Math.FloatBetween(0, 1) < this.getPlayerLanePressureChance()) {
      candidates = pressureWaves;
    }

    candidates = Phaser.Utils.Array.Shuffle(candidates);
    const wave = candidates[0];
    wave.forEach((lane) => this.createObstacleAtLane(lane, wave.length));
  }

  spawnCoin() {
    // Gasolina/pontos so aparecem em pistas com espaco suficiente.
    const order = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    const lane = order.find((idx) => this.hasLaneSpace(this.coins, idx, 170) && this.hasLaneSpace(this.obstacles, idx, 170));
    if (lane === undefined) return;

    const coin = this.coins.create(this.lanes[lane], -34, "gasolinaSprite").setDepth(8);
    this.setBodyBox(coin, 0.70, 0.78);
    coin.setData("speed", Math.max(180, this.getObstacleSpeed() - 60));
    coin.setData("lane", lane);
  }

  onHitObstacle(_player, obstacle) {
    // Escudo absorve a batida; sem escudo perde vida, combo e combustivel.
    if (this.hitCooldown || this.levelFinished) return;

    this.hitCooldown = true;
    obstacle.destroy();

    if (this.state.shield > 0) {
      this.state.shield -= 1;
      this.state.combo = 0;
      this.player.setTint(0x66d9ff);
      this.cameras.main.shake(90, 0.004);
      this.playSound("collision", { volume: 0.4 });
      this.addParticleBurst(this.player.x, this.player.y, 0x66d9ff, 6);
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
    this.playSound("collision", { volume: 0.75 });
    this.addParticleBurst(this.player.x, this.player.y, 0xff4444, 10);
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
    // A moeda de gasolina recupera combustivel e acrescenta pontuacao.
    const cx = coin.x, cy = coin.y;
    coin.destroy();
    this.state.score += this.cfg.coinScore;
    this.state.fuel = Math.min(100, this.state.fuel + this.cfg.coinFuelBonus);
    this.playSound("coin", { volume: 0.6 });
    this.addParticleBurst(cx, cy, 0x00dd88, 8);
    this.centerHint.setText(this.t("coinCollected"));
    this.time.delayedCall(500, () => {
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updatePhaseByScore();
    this.updateHud();
  }

  onCollectLife(_player, life) {
    // Vida extra so aparece quando o jogador tem uma vida.
    const lx = life.x, ly = life.y;
    life.destroy();
    this.activeLifePickup = null;
    this.state.lives = Math.min(3, this.state.lives + 1);
    this.playSound("coin", { volume: 0.65 });
    this.addParticleBurst(lx, ly, 0xff6699, 8);
    this.centerHint.setText(this.t("lifeCollected"));
    this.time.delayedCall(600, () => {
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updateHud();
  }

  onCollectShield(_player, shield) {
    // Escudo limitado a uma carga para ajudar sem tornar o jogo trivial.
    const sx = shield.x, sy = shield.y;
    shield.destroy();
    this.activeShieldPickup = null;
    this.state.shield = Math.min(1, this.state.shield + 1);
    this.playSound("coin", { volume: 0.6 });
    this.addParticleBurst(sx, sy, 0x66d9ff, 8);
    this.centerHint.setText(this.t("shieldCollected"));
    this.player.setTint(0x66d9ff);
    this.time.delayedCall(550, () => {
      this.player.clearTint();
      if (!this.levelFinished && !this.isPaused) this.centerHint.setText(`${this.t("targetScore")}: ${this.cfg.targetScore}`);
    });
    this.updateHud();
  }

  awardNearMiss(obstacle) {
    // Bonus por "rasar" um obstaculo: exige troca de pista recente
    // e passagem por uma pista adjacente.
    const obstacleLane = obstacle.getData("lane");
    if (Math.abs(obstacleLane - this.currentLane) !== 1) return;
    if (this.time.now - this.lastLaneChangeTime > (this.cfg.nearMissWindowMs ?? 850)) return;

    this.state.combo = Math.min(this.state.combo + 1, 9);
    this.state.bestCombo = Math.max(this.state.bestCombo, this.state.combo);
    this.state.nearMisses += 1;

    const multiplier = Math.min(this.state.combo, this.cfg.nearMissComboCap ?? 3);
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
    // Texto temporario para feedback imediato de combos e bonus.
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
    // Ajuda de recuperacao: so aparece quando o jogador esta com uma vida.
    if (this.state.lives !== 1) return;
    if (this.activeLifePickup && this.activeLifePickup.active) return;
    if (now - this.lastLifeSpawnTime < this.cfg.lifeRespawnDelay) return;

    const order = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    const lane = order.find((idx) => this.hasLaneSpace(this.obstacles, idx, 220) && this.hasLaneSpace(this.coins, idx, 160));
    if (lane === undefined) return;

    const life = this.lifePickups.create(this.lanes[lane], -36, "lifeSprite").setDepth(8);
    this.setBodyBox(life, 0.82, 0.82);
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
    // Escudo aparece quando ainda nao existe escudo e a tentativa esta apertada.
    if (this.state.shield > 0) return;
    if (this.activeShieldPickup && this.activeShieldPickup.active) return;
    if (now - this.lastShieldSpawnTime < this.cfg.shieldRespawnDelay) return;
    if (this.state.fuel > 70 && this.state.lives > 2) return;

    const order = Phaser.Utils.Array.Shuffle([0, 1, 2]);
    const lane = order.find((idx) => this.hasLaneSpace(this.obstacles, idx, 220) && this.hasLaneSpace(this.coins, idx, 150));
    if (lane === undefined) return;

    const shield = this.shieldPickups.create(this.lanes[lane], -40, "shieldSprite").setDepth(8);
    this.setBodyBox(shield, 0.70, 0.78);
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
    // Ao concluir a sala, limpamos objetos ativos e guardamos o estado para a proxima.
    this.levelFinished = true;
    this._transitioning = true;
    this.obstacles.clear(true, true);
    this.coins.clear(true, true);
    this.lifePickups.clear(true, true);
    this.shieldPickups.clear(true, true);

    this.playSound("levelClear", { volume: 0.8 });
    this.centerHint.setText(this.t("levelClear"));

    this.registry.set("runState", {
      ...this.state,
      level: this.cfg.roomNumber,
      phase: 1,
      shield: Math.min(1, this.state.shield),
      fuel: Math.max(35, this.state.fuel)
    });

    this.time.delayedCall(900, () => {
      if (this.engineAudio) this.engineAudio.stop();
      if (this.cfg.final) {
        this._transitioning = false; // deixa endRun gerir a sua propria transicao
        this.endRun(true);
      } else {
        this.cameras.main.fadeOut(400, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.stopBackgroundMusic();
          this.scene.start(this.cfg.nextScene);
        });
      }
    });
  }

  endRun(victory, loseReason = "lives") {
    // Transicao unica para o ecra final. _transitioning evita abrir duas cenas.
    if (this._transitioning) return;
    this._transitioning = true;
    this.levelFinished = true;
    if (this.engineAudio) this.engineAudio.stop();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.stopBackgroundMusic();
      this.registry.set("runState", this.state);
      this.scene.start("EndScene", {
        victory,
        loseReason,
        score: this.state.score,
        phase: this.state.phase,
        level: this.cfg.roomNumber,
        elapsed: this.state.elapsed,
        bestCombo: this.state.bestCombo,
        nearMisses: this.state.nearMisses
      });
    });
  }

  restartRun() {
    // Recomeca do primeiro nivel a partir do menu de pausa.
    if (this._transitioning) return;
    this._transitioning = true;
    if (this.engineAudio) this.engineAudio.stop();
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.stopBackgroundMusic();
      this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, shield: 0, combo: 0, bestCombo: 0, nearMisses: 0, elapsed: 0 });
      this.scene.start("Room1Scene");
    });
  }

  goToMenu() {
    // Volta ao menu e limpa o progresso da tentativa atual.
    if (this._transitioning) return;
    this._transitioning = true;
    if (this.engineAudio) this.engineAudio.stop();
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.stopBackgroundMusic();
      this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, shield: 0, combo: 0, bestCombo: 0, nearMisses: 0, elapsed: 0 });
      this.scene.start("MenuScene");
    });
  }

  tryMoveLane(dir) {
    // Movimento por pistas: nunca deixa o carro entre duas linhas.
    if (this.levelFinished || this.isPaused || this.isStarting) return;
    const nextLane = Phaser.Math.Clamp(this.currentLane + dir, 0, 2);
    if (nextLane === this.currentLane) return;

    this.currentLane = nextLane;
    this.lastLaneChangeTime = this.time.now;

    this.tweens.add({
      targets: this.player,
      x: this.lanes[this.currentLane],
      duration: 110,
      ease: "Sine.Out"
    });
  }

  togglePause() {
    // Pausa a fisica e mostra a interface de pausa.
    if (this.levelFinished || this._transitioning) return;
    this.isPaused = !this.isPaused;
    this.physics.world.isPaused = this.isPaused;

    // --- Visibilidade do overlay e painel ---
    this.pauseOverlay.setVisible(this.isPaused);
    this.pausePanel.setVisible(this.isPaused);
    this.pauseTitle.setVisible(this.isPaused);

    // --- Visibilidade dos botoes ---
    this.pauseContinueBtn.container.setVisible(this.isPaused);
    this.pauseContinueBtn.text.setVisible(this.isPaused);
    this.pauseRestartBtn.container.setVisible(this.isPaused);
    this.pauseRestartBtn.text.setVisible(this.isPaused);
    this.pauseMenuBtn.container.setVisible(this.isPaused);
    this.pauseMenuBtn.text.setVisible(this.isPaused);

    // --- Visibilidade dos controlos de audio ---
    if (this.pauseAudioElements) {
      this.pauseAudioElements.forEach((el) => el.setVisible(this.isPaused));
    }

    // --- Atualizacao do HUD ---
    if (!this.isPaused) this.updateHud();
  }

  update() {
    // Loop por frame: input, pausa, spawns e movimento dos objetos.
    if (this._transitioning) return;

    if (Phaser.Input.Keyboard.JustDown(this.langKey)) {
      const c = this.registry.get("lang") || "pt";
      const langs = ["pt", "en", "es"];
      this.registry.set("lang", langs[(langs.indexOf(c) + 1) % langs.length]);
      this.pauseTitle.setText(this.t("paused"));
      this.pauseContinueBtn.text.setText(this.t("pauseContinue"));
      this.pauseRestartBtn.text.setText(this.t("pauseRestart"));
      this.pauseMenuBtn.text.setText(this.t("pauseMenu"));
      this.updateHud();
    }

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause();
      
      // Audio na pausa: trava ou retoma o motor conforme o estado do jogo.
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

      // --- Dinamica do som do motor ---
      if (this.engineAudio) {
        if (this.engineAudio.isPaused) this.engineAudio.resume();
        
        const currentScore = this.state.score || 0;
        const targetRate = Math.min(2, 1 + (currentScore * 0.002));
        
        this.engineAudio.setRate(targetRate);
      }
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
    const key = this.cache.audio.has("bgMusic") ? "bgMusic" : "engineStart";
    this.bgMusic = this.sound.add(key, { loop: true, volume: 0.18 });
    this.bgMusic.play();
  }

  stopBackgroundMusic() {
    if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
  }
}
