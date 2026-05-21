export class BaseRoomScene extends Phaser.Scene {
  constructor(key, cfg) {
    super(key);
    this.cfg = cfg;
  }

  create() {
    this.createTextures();
    this.drawBackground();
    this.physics.world.setBounds(20, 0, 920, 540); 

    this.state = this.registry.get("runState") || { lives: 3, timeLeft: 180, keys: 0 };

    // Jogador (o teu Carro SVG)
    this.player = this.physics.add.sprite(480, 450, "carroSprite").setDepth(8); 
    this.player.setCollideWorldBounds(true);

    this.walls = this.physics.add.staticGroup();
    this.keys = this.physics.add.staticGroup();
    this.createRoomLayout();

    // Mudamos o X para 880 (berma da direita) e a textura para a gasolina
    this.puzzleObject = this.physics.add.staticSprite(880, 270, "gasolinaSprite").setDepth(7);
    this.keyItem = null;

    // Inimigos (os Táxis)
    this.enemies = this.physics.add.group();
    this.createEnemies();

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.keys, this.onCollectKey, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyHit, null, this);

    // Controlos
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.langKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.backspaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.typeKeys = this.input.keyboard.addKeys("ZERO,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,V,I,D,A");

    this.hitCooldown = false;
    this.puzzleSolved = false;
    this.puzzleOpen = false;
    this.puzzleInput = "";

    this.createHud();
    this.createPuzzleOverlay();
    this.refreshHud();

    // Temporizador do jogo
    this.timer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.puzzleOpen) return;
        this.state.timeLeft -= 1;
        this.refreshHud();
        if (this.state.timeLeft <= 0) this.endRun(false);
      }
    });
  }

  t(k) {
    const l = this.registry.get("lang") || "pt";
    return (this.registry.get("i18n")[l] || {})[k] ?? k;
  }

  createTextures() {
    if (this.textures.exists("wallTex")) return;
    const g = this.add.graphics();
    g.fillStyle(0x5b402d, 1); g.fillRoundedRect(0, 0, 40, 40, 3); g.fillStyle(0x7a5638, 1); g.fillRect(0, 0, 40, 5); g.fillRect(0, 20, 40, 4); g.generateTexture("wallTex", 40, 40); g.clear();
    g.fillStyle(0xd6ab3d, 1); g.fillCircle(11, 11, 11); g.fillStyle(0x6b4e1a, 1); g.fillRect(10, 4, 12, 4); g.generateTexture("keyTex", 24, 24); g.clear();
    g.fillStyle(0x5e3f2a, 1); g.fillRoundedRect(0, 0, 34, 88, 5); g.fillStyle(0x8b633d, 1); g.fillRect(15, 24, 4, 44); g.generateTexture("doorTex", 34, 88); g.clear();
    g.fillStyle(0x2f5d2f, 1); g.fillRoundedRect(0, 0, 40, 92, 6); g.fillStyle(0x9aca6d, 1); g.fillRect(18, 32, 4, 24); g.generateTexture("finalDoorTex", 40, 92); g.clear();
    g.fillStyle(0x7a4b25, 1); g.fillRoundedRect(0, 0, 48, 30, 4); g.fillStyle(0x3d2412, 1); g.fillRect(0, 22, 48, 8); g.generateTexture("chestTex", 48, 30); g.clear();
    g.fillStyle(0x8a8a8a, 1); g.fillRoundedRect(0, 0, 30, 30, 3); g.fillStyle(0x404040, 1); g.fillCircle(15, 15, 6); g.generateTexture("riddleTex", 30, 30); g.clear();
    g.fillStyle(0xff3ad8, 1); g.fillCircle(16, 16, 14); g.fillStyle(0x2d1a2c, 1); g.fillCircle(16, 16, 7); g.generateTexture("symbolTex", 32, 32); g.destroy();
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillStyle(0x222222, 1); 
    g.fillRect(0, 0, 960, 540);
    
    // Grupo das linhas brancas da estrada
    this.roadLines = this.add.group();
    for (let i = 0; i < 7; i++) {
      let line = this.add.rectangle(480, i * 100, 15, 60, 0xffffff).setDepth(1);
      this.roadLines.add(line);
    }
  }

  createRoomLayout() {
    for (let y = 0; y <= 540; y += 40) { 
      this.walls.create(20, y, "wallTex"); 
      this.walls.create(940, y, "wallTex"); 
    }
    
    // Agora é uma linha de meta, larga e bem posicionada!
    this.exitDoor = this.physics.add.staticSprite(480, 50, "metaSprite").setDepth(7);
    if (!this.cfg.final) this.walls.add(this.exitDoor);
  }

  createEnemies() {
    this.cfg.enemies.forEach((e) => {
      const enemy = this.enemies.create(e.x, e.y, "taxiSprite");
      enemy.setImmovable(true);
    });
  }

  createHud() {
    const panel = this.add.rectangle(260, 38, 500, 54, 0x100c09, 0.68).setDepth(30); panel.setStrokeStyle(1, 0xb67a32, 0.9);
    this.hudText = this.add.text(18, 20, "", { fontSize: "19px", color: "#f2e6d8" }).setDepth(31);
    this.infoText = this.add.text(18, 50, "", { fontSize: "15px", color: "#e0b884" }).setDepth(31);
    this.hintText = this.add.text(480, 510, "", { fontSize: "18px", color: "#f6ddb4", backgroundColor: "#3f2a1a", padding: { left: 10, right: 10, top: 4, bottom: 4 } }).setOrigin(0.5).setDepth(31);
  }

  refreshHud() {
    this.hudText.setText(`${this.t("hudLives")}: ${this.state.lives}   ${this.t("hudTime")}: ${this.state.timeLeft}   ${this.t("hudRoom")}: ${this.cfg.roomNumber}   ${this.t("hudKeys")}: ${this.state.keys}/3`);
    this.infoText.setText("WASD/Setas mover | E interagir | L idioma");
  }

  createPuzzleOverlay() {
    this.ovBg = this.add.rectangle(480, 270, 620, 330, 0x060504, 0.88).setDepth(50).setVisible(false); this.ovBg.setStrokeStyle(2, 0xc68542, 1);
    this.ovTitle = this.add.text(480, 170, "", { fontSize: "34px", color: "#f2d2a2", fontStyle: "bold" }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovPrompt = this.add.text(480, 225, "", { fontSize: "22px", color: "#f2e6d8", align: "center", wordWrap: { width: 540 } }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovInput = this.add.text(480, 285, "", { fontSize: "32px", color: "#ffd38a", backgroundColor: "#291c12", padding: { left: 12, right: 12, top: 8, bottom: 8 } }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovFeedback = this.add.text(480, 335, "", { fontSize: "20px", color: "#b6f09b" }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovClose = this.add.text(480, 385, "", { fontSize: "16px", color: "#d4c5aa" }).setOrigin(0.5).setDepth(51).setVisible(false);
  }

  openPuzzle() {
    if (this.puzzleSolved) return;
    this.puzzleOpen = true;
    this.puzzleInput = "";
    this.ovTitle.setText(this.t(this.cfg.titleKey));
    this.ovPrompt.setText(this.t(this.cfg.promptKey));
    this.ovInput.setText(`${this.t("puzzleInput")}: _`);
    this.ovFeedback.setText("");
    this.ovClose.setText(this.t("closePuzzle"));
    [this.ovBg, this.ovTitle, this.ovPrompt, this.ovInput, this.ovFeedback, this.ovClose].forEach((el) => el.setVisible(true));
  }

  closePuzzle() {
    this.puzzleOpen = false;
    [this.ovBg, this.ovTitle, this.ovPrompt, this.ovInput, this.ovFeedback, this.ovClose].forEach((el) => el.setVisible(false));
    this.hintText.setText("");
  }

  submitPuzzle() {
    if (this.puzzleInput.toLowerCase() === this.cfg.answer) {
      this.puzzleSolved = true;
      this.ovFeedback.setColor("#b6f09b");
      this.ovFeedback.setText(this.t("puzzleSuccess"));
      if (!this.keyItem) this.keyItem = this.keys.create(690, 270, "keyTex").setDepth(8);
      if (!this.cfg.final) this.exitDoor.disableBody(true, true);
      this.time.delayedCall(500, () => this.closePuzzle());
    } else {
      this.ovFeedback.setColor("#ff9d9d");
      this.ovFeedback.setText(this.t("puzzleFail"));
    }
  }

  onCollectKey(_p, k) {
    k.disableBody(true, true);
    this.state.keys += 1;
    this.refreshHud();
  }

  onEnemyHit() {
    if (this.hitCooldown || this.puzzleOpen) return;
    this.hitCooldown = true;
    this.state.lives -= 1;
    this.player.setPosition(480, 450); 
    this.player.setTint(0xff0000);
    this.time.delayedCall(250, () => { this.player.clearTint(); this.hitCooldown = false; });
    this.refreshHud();
    if (this.state.lives <= 0) this.endRun(false);
  }

  endRun(victory) {
    this.registry.set("runState", this.state);
    this.scene.start("EndScene", { victory });
  }

  gotoNextRoom() {
    this.registry.set("runState", this.state);
    this.scene.start(this.cfg.nextScene);
  }

  handleTyping() {
    const map = { ZERO: "0", ONE: "1", TWO: "2", THREE: "3", FOUR: "4", FIVE: "5", SIX: "6", SEVEN: "7", EIGHT: "8", NINE: "9", V: "v", I: "i", D: "d", A: "a" };
    Object.entries(map).forEach(([k, v]) => {
      if (Phaser.Input.Keyboard.JustDown(this.typeKeys[k]) && this.puzzleInput.length < 8) this.puzzleInput += v;
    });
  }

  update() {
    const roadSpeed = 4 + (this.state.keys * 2.5);

    // Movimentação do fundo e inimigos
    if (!this.puzzleOpen && this.roadLines) {
      this.roadLines.getChildren().forEach(line => {
        line.y += roadSpeed; 
        if (line.y > 600) line.y = -50; 
      });

      if (this.enemies) {
        this.enemies.getChildren().forEach(taxi => {
          taxi.y += roadSpeed; 
          
          if (taxi.y > 600) {
            taxi.y = -80; 
            taxi.x = Phaser.Math.Between(60, 900); 
          }
        });
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.langKey)) {
      const c = this.registry.get("lang") || "pt";
      this.registry.set("lang", c === "pt" ? "en" : "pt");
      this.refreshHud();
    }

    if (this.puzzleOpen) {
      if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) this.closePuzzle();
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) this.submitPuzzle();
      if (Phaser.Input.Keyboard.JustDown(this.backspaceKey)) this.puzzleInput = this.puzzleInput.slice(0, -1);
      this.handleTyping();
      this.ovInput.setText(`${this.t("puzzleInput")}: ${this.puzzleInput || "_"}`);
      this.player.setVelocity(0, 0);
      return;
    }

    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.puzzleObject.x, this.puzzleObject.y) < 70) {
      this.hintText.setText(this.t("interactHint"));
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) this.openPuzzle();
    } else if (!this.hintText.text.includes("Porta") && !this.hintText.text.includes("Door")) {
      this.hintText.setText("");
    }

    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exitDoor.x, this.exitDoor.y) < 60 && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this.cfg.final) {
        if (this.state.keys >= 3) this.endRun(true);
        else this.hintText.setText(this.t("finalDoorLocked"));
      } else if (this.puzzleSolved) {
        this.gotoNextRoom();
      } else {
        this.hintText.setText(this.t("doorLocked"));
      }
    }

    // Movimentação do jogador
    const speed = 180;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    this.player.setVelocity(vx, vy);
  }
}