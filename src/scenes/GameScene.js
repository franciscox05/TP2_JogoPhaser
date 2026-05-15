export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  create() {
    this.createTextures();
    this.drawDungeonBackground();

    this.physics.world.setBounds(20, 40, 920, 460);

    this.roomStates = [
      { solved: false, hasKey: false, keyTaken: false, answer: "4791", type: "code" },
      { solved: false, hasKey: false, keyTaken: false, answer: "vida", type: "word" },
      { solved: false, hasKey: false, keyTaken: false, answer: "tcqs", type: "symbol" }
    ];

    this.player = this.physics.add.sprite(90, 270, "playerTex").setDepth(7);
    this.player.setCollideWorldBounds(true);

    this.walls = this.physics.add.staticGroup();
    this.createWallsAndDoors();

    this.puzzleObjects = this.physics.add.staticGroup();
    this.createPuzzleObjects();

    this.keys = this.physics.add.staticGroup();
    this.spawnedKeys = [];

    this.finalDoor = this.physics.add.staticSprite(900, 270, "finalDoorTex").setDepth(6);

    this.enemies = this.physics.add.group();
    this.createEnemies();

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.enemies);

    this.physics.add.overlap(this.player, this.keys, this.handleCollectKey, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handleEnemyHit, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.langKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.backspaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.puzzleTypingKeys = this.input.keyboard.addKeys("ZERO,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,T,C,Q,S,V,I,D,A");

    this.lives = 3;
    this.timeLeft = 180;
    this.collectedKeys = 0;
    this.hitCooldown = false;

    this.activePuzzle = null;
    this.puzzleInput = "";

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.activePuzzle) return;
        this.timeLeft -= 1;
        this.refreshHud();
        if (this.timeLeft <= 0) this.endGame(false);
      },
      loop: true
    });

    this.createHud();
    this.createPuzzleOverlay();
    this.refreshHud();
  }

  createTextures() {
    const g = this.add.graphics();
    g.fillStyle(0xf2b46f, 1);
    g.fillCircle(14, 14, 14);
    g.fillStyle(0x6d3a1f, 1);
    g.fillCircle(14, 14, 5);
    g.generateTexture("playerTex", 28, 28);
    g.clear();

    g.fillStyle(0x5f1f1f, 1);
    g.fillRoundedRect(0, 0, 28, 28, 6);
    g.fillStyle(0xc05858, 1);
    g.fillRoundedRect(4, 4, 20, 20, 4);
    g.generateTexture("enemyTex", 28, 28);
    g.clear();

    g.fillStyle(0xd6ab3d, 1);
    g.fillCircle(11, 11, 11);
    g.fillStyle(0x6b4e1a, 1);
    g.fillRect(10, 4, 12, 4);
    g.generateTexture("keyTex", 24, 24);
    g.clear();

    g.fillStyle(0x5b402d, 1);
    g.fillRoundedRect(0, 0, 40, 40, 3);
    g.fillStyle(0x7a5638, 1);
    g.fillRect(0, 0, 40, 5);
    g.fillRect(0, 20, 40, 4);
    g.generateTexture("wallTex", 40, 40);
    g.clear();

    g.fillStyle(0x5e3f2a, 1);
    g.fillRoundedRect(0, 0, 34, 88, 5);
    g.fillStyle(0x8b633d, 1);
    g.fillRect(15, 24, 4, 44);
    g.generateTexture("doorTex", 34, 88);
    g.clear();

    g.fillStyle(0x2f5d2f, 1);
    g.fillRoundedRect(0, 0, 40, 92, 6);
    g.fillStyle(0x9aca6d, 1);
    g.fillRect(18, 32, 4, 24);
    g.generateTexture("finalDoorTex", 40, 92);
    g.clear();

    g.fillStyle(0x7a4b25, 1);
    g.fillRoundedRect(0, 0, 48, 30, 4);
    g.fillStyle(0x3d2412, 1);
    g.fillRect(0, 22, 48, 8);
    g.generateTexture("chestTex", 48, 30);
    g.clear();

    g.fillStyle(0x8a8a8a, 1);
    g.fillRoundedRect(0, 0, 30, 30, 3);
    g.fillStyle(0x404040, 1);
    g.fillCircle(15, 15, 6);
    g.generateTexture("riddleTex", 30, 30);
    g.clear();

    g.fillStyle(0xff3ad8, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x2d1a2c, 1);
    g.fillCircle(16, 16, 7);
    g.generateTexture("symbolTex", 32, 32);
    g.destroy();
  }

  drawDungeonBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x2f1f16, 0x2f1f16, 0x4a3021, 0x4a3021, 1);
    g.fillRect(0, 0, 960, 540);
    g.fillStyle(0x6c4a31, 0.85);
    for (let y = 45; y < 500; y += 40) {
      for (let x = 20; x < 940; x += 40) {
        g.fillRect(x, y, 38, 38);
      }
    }
    g.fillStyle(0x090706, 0.22);
    g.fillRect(20, 40, 920, 460);
    g.fillStyle(0x0f0a08, 0.24);
    g.fillRect(320, 40, 8, 460);
    g.fillRect(620, 40, 8, 460);

    [90, 280, 390, 580, 690, 880].forEach((x) => this.createTorch(x, 80));
  }

  createTorch(x, y) {
    const glow = this.add.circle(x, y, 60, 0xff8f2c, 0.2).setDepth(2);
    this.add.circle(x, y, 9, 0xff4df0, 0.8).setDepth(3);
    this.tweens.add({ targets: glow, alpha: { from: 0.25, to: 0.11 }, duration: 400, yoyo: true, repeat: -1 });
  }

  createWallsAndDoors() {
    for (let x = 40; x <= 920; x += 40) {
      this.walls.create(x, 40, "wallTex").setDepth(5);
      this.walls.create(x, 500, "wallTex").setDepth(5);
    }
    for (let y = 80; y <= 460; y += 40) {
      this.walls.create(20, y, "wallTex").setDepth(5);
      this.walls.create(940, y, "wallTex").setDepth(5);
    }

    this.roomDividers = [
      this.physics.add.staticSprite(320, 270, "doorTex").setDepth(6),
      this.physics.add.staticSprite(620, 270, "doorTex").setDepth(6)
    ];

    this.walls.add(this.roomDividers[0]);
    this.walls.add(this.roomDividers[1]);
  }

  createPuzzleObjects() {
    this.puzzleObjects.create(180, 270, "chestTex").setDepth(6);
    this.puzzleObjects.create(470, 270, "riddleTex").setDepth(6);
    this.puzzleObjects.create(770, 270, "symbolTex").setDepth(6);
  }

  createEnemies() {
    const e1 = this.enemies.create(120, 180, "enemyTex");
    const e2 = this.enemies.create(450, 380, "enemyTex");
    const e3 = this.enemies.create(820, 170, "enemyTex");
    e1.setVelocityX(90).setBounce(1, 1).setCollideWorldBounds(true);
    e2.setVelocityY(100).setBounce(1, 1).setCollideWorldBounds(true);
    e3.setVelocityX(-120).setBounce(1, 1).setCollideWorldBounds(true);
  }

  createHud() {
    const panel = this.add.rectangle(250, 38, 470, 54, 0x100c09, 0.68).setDepth(30);
    panel.setStrokeStyle(1, 0xb67a32, 0.9);
    this.hudText = this.add.text(18, 20, "", { fontSize: "19px", color: "#f2e6d8" }).setDepth(31);
    this.infoText = this.add.text(18, 50, "", { fontSize: "15px", color: "#e0b884" }).setDepth(31);
    this.interactHintText = this.add.text(480, 510, "", {
      fontSize: "18px",
      color: "#f6ddb4",
      backgroundColor: "#3f2a1a",
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setDepth(31);
  }

  createPuzzleOverlay() {
    this.overlayBg = this.add.rectangle(480, 270, 620, 330, 0x060504, 0.88).setDepth(50).setVisible(false);
    this.overlayBg.setStrokeStyle(2, 0xc68542, 1);
    this.overlayTitle = this.add.text(480, 170, "", { fontSize: "34px", color: "#f2d2a2", fontStyle: "bold" }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.overlayPrompt = this.add.text(480, 225, "", { fontSize: "22px", color: "#f2e6d8", align: "center", wordWrap: { width: 540 } }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.overlayInput = this.add.text(480, 285, "", { fontSize: "32px", color: "#ffd38a", backgroundColor: "#291c12", padding: { left: 12, right: 12, top: 8, bottom: 8 } }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.overlayFeedback = this.add.text(480, 335, "", { fontSize: "20px", color: "#b6f09b" }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.overlayClose = this.add.text(480, 385, "", { fontSize: "16px", color: "#d4c5aa" }).setOrigin(0.5).setDepth(51).setVisible(false);
  }

  t(key) {
    const lang = this.registry.get("lang") || "pt";
    return (this.registry.get("i18n")[lang] || {})[key] ?? key;
  }

  getCurrentRoom() {
    if (this.player.x < 320) return 1;
    if (this.player.x < 620) return 2;
    return 3;
  }

  refreshHud() {
    this.hudText.setText(`${this.t("hudLives")}: ${this.lives}   ${this.t("hudTime")}: ${this.timeLeft}   ${this.t("hudRoom")}: ${this.getCurrentRoom()}   ${this.t("hudKeys")}: ${this.collectedKeys}/3`);
    this.infoText.setText("WASD/Setas mover | E interagir | L idioma | ENTER confirmar");
  }

  showHint(text) {
    this.interactHintText.setText(text);
    this.time.delayedCall(1700, () => {
      if (!this.activePuzzle) this.interactHintText.setText("");
    });
  }

  openPuzzle(index) {
    const state = this.roomStates[index];
    if (state.solved) return this.showHint(this.t("puzzleSuccess"));

    this.activePuzzle = index;
    this.puzzleInput = "";

    const titleByType = { code: this.t("puzzleCodeTitle"), word: this.t("puzzleWordTitle"), symbol: this.t("puzzleSymbolTitle") };
    const promptByType = { code: this.t("puzzleCodePrompt"), word: this.t("puzzleWordPrompt"), symbol: `${this.t("puzzleSymbolPrompt")} (T C Q S)` };

    this.overlayTitle.setText(titleByType[state.type]);
    this.overlayPrompt.setText(promptByType[state.type]);
    this.overlayInput.setText(`${this.t("puzzleInput")}: _`);
    this.overlayFeedback.setText("");
    this.overlayClose.setText(this.t("closePuzzle"));

    [this.overlayBg, this.overlayTitle, this.overlayPrompt, this.overlayInput, this.overlayFeedback, this.overlayClose].forEach((el) => el.setVisible(true));
  }

  closePuzzle() {
    this.activePuzzle = null;
    [this.overlayBg, this.overlayTitle, this.overlayPrompt, this.overlayInput, this.overlayFeedback, this.overlayClose].forEach((el) => el.setVisible(false));
    this.interactHintText.setText("");
  }

  submitPuzzle() {
    if (this.activePuzzle === null) return;
    const idx = this.activePuzzle;
    const expected = this.roomStates[idx].answer;

    if (this.puzzleInput.toLowerCase() === expected) {
      this.roomStates[idx].solved = true;
      this.overlayFeedback.setColor("#b6f09b");
      this.overlayFeedback.setText(this.t("puzzleSuccess"));
      this.spawnRoomKey(idx);
      this.unlockDoor(idx);
      this.refreshHud();
      this.time.delayedCall(650, () => this.closePuzzle());
    } else {
      this.overlayFeedback.setColor("#ff9d9d");
      this.overlayFeedback.setText(this.t("puzzleFail"));
    }
  }

  spawnRoomKey(index) {
    if (this.spawnedKeys[index]) return;
    const positions = [[240, 330], [520, 330], [820, 330]];
    const [x, y] = positions[index];
    this.spawnedKeys[index] = this.keys.create(x, y, "keyTex").setDepth(8);
  }

  unlockDoor(index) {
    if (index === 0 && this.roomDividers[0].active) {
      this.roomDividers[0].disableBody(true, true);
      this.showHint(this.t("doorOpen"));
    }
    if (index === 1 && this.roomDividers[1].active) {
      this.roomDividers[1].disableBody(true, true);
      this.showHint(this.t("doorOpen"));
    }
    if (index === 2) this.showHint(this.t("finalDoorOpen"));
  }

  handleCollectKey(_player, keyObj) {
    keyObj.disableBody(true, true);
    this.collectedKeys += 1;
    this.refreshHud();
    this.cameras.main.shake(120, 0.0025);
  }

  handleEnemyHit() {
    if (this.hitCooldown || this.activePuzzle !== null) return;
    this.hitCooldown = true;
    this.lives -= 1;
    this.player.setPosition(90, 270);
    this.refreshHud();
    this.player.setTint(0xff0000);
    this.cameras.main.shake(140, 0.005);
    this.time.delayedCall(250, () => {
      this.player.clearTint();
      this.hitCooldown = false;
    });
    if (this.lives <= 0) this.endGame(false);
  }

  tryInteract() {
    const p = this.player;
    if (Phaser.Math.Distance.Between(p.x, p.y, 180, 270) < 70) return this.openPuzzle(0);
    if (Phaser.Math.Distance.Between(p.x, p.y, 470, 270) < 70) return this.openPuzzle(1);
    if (Phaser.Math.Distance.Between(p.x, p.y, 770, 270) < 70) return this.openPuzzle(2);

    if (Phaser.Math.Distance.Between(p.x, p.y, 900, 270) < 60) {
      if (this.collectedKeys >= 3) this.endGame(true);
      else this.showHint(this.t("finalDoorLocked"));
      return;
    }

    if (this.roomDividers[0].active && Phaser.Math.Distance.Between(p.x, p.y, 320, 270) < 65) return this.showHint(this.t("doorLocked"));
    if (this.roomDividers[1].active && Phaser.Math.Distance.Between(p.x, p.y, 620, 270) < 65) return this.showHint(this.t("doorLocked"));
  }

  endGame(victory) {
    this.scene.start("EndScene", { victory });
  }

  handlePuzzleTyping() {
    const map = {
      ZERO: "0", ONE: "1", TWO: "2", THREE: "3", FOUR: "4", FIVE: "5", SIX: "6", SEVEN: "7", EIGHT: "8", NINE: "9",
      T: "t", C: "c", Q: "q", S: "s", V: "v", I: "i", D: "d", A: "a"
    };
    Object.entries(map).forEach(([key, value]) => {
      if (Phaser.Input.Keyboard.JustDown(this.puzzleTypingKeys[key])) {
        if (this.puzzleInput.length < 8) this.puzzleInput += value;
      }
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.langKey)) {
      const current = this.registry.get("lang") || "pt";
      this.registry.set("lang", current === "pt" ? "en" : "pt");
      this.refreshHud();
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.activePuzzle === null) this.tryInteract();

    if (this.activePuzzle !== null) {
      if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) this.closePuzzle();
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) this.submitPuzzle();
      if (Phaser.Input.Keyboard.JustDown(this.backspaceKey)) this.puzzleInput = this.puzzleInput.slice(0, -1);
      this.handlePuzzleTyping();
      this.overlayInput.setText(`${this.t("puzzleInput")}: ${this.puzzleInput || "_"}`);
      this.player.setVelocity(0, 0);
      return;
    }

    const speed = 180;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    this.player.setVelocity(vx, vy);
    this.refreshHud();
  }
}
