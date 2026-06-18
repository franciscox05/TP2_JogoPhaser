export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    // Evita duplos cliques/duplos Enter durante o fade para o jogo.
    this._transitioning = false;
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.toggleLangKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Menu simples sobre uma estrada para manter identidade visual do jogo.
    this.drawBackground();

    const panel = this.add.rectangle(480, 255, 650, 330, 0x05070b, 0.82).setDepth(5);
    panel.setStrokeStyle(2, 0x69bfff, 0.9);

    const titleGlow = this.add.rectangle(480, 154, 540, 84, 0x66d1ff, 0.08).setDepth(6);
    titleGlow.setStrokeStyle(1, 0x66d1ff, 0.18);

    this.titleText = this.add.text(480, 155, "", {
      fontSize: "58px",
      color: "#66d1ff",
      fontStyle: "bold",
      stroke: "#0a1f33",
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(7);

    this.subtitle = this.add.text(480, 222, "", {
      fontSize: "19px",
      color: "#cdefff",
      align: "center",
      wordWrap: { width: 540 }
    }).setOrigin(0.5).setDepth(7);

    this.startButton = this.add.rectangle(480, 305, 300, 56, 0x14608a, 1).setDepth(7);
    this.startButton.setStrokeStyle(2, 0xbbe6ff, 0.9);
    this.startText = this.add.text(480, 305, "", {
      fontSize: "28px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(8);

    this.startButton.setInteractive({ useHandCursor: true });
    this.startButton.on("pointerover", () => this.setStartButtonHover(true));
    this.startButton.on("pointerout", () => this.setStartButtonHover(false));
    this.startButton.on("pointerdown", () => this.startGame());

    this.langHintText = this.add.text(480, 371, "", {
      fontSize: "17px",
      color: "#d7ebff"
    }).setOrigin(0.5).setDepth(7);

    this.langPill = this.add.rectangle(480, 414, 190, 34, 0x0d2336, 0.92).setDepth(7);
    this.langPill.setStrokeStyle(1, 0x69bfff, 0.75);

    this.langCurrentText = this.add.text(480, 414, "", {
      fontSize: "17px",
      color: "#b6d9ff"
    }).setOrigin(0.5).setDepth(8);

    this.tweens.add({
      targets: this.startButton,
      scale: { from: 1, to: 1.035 },
      duration: 760,
      yoyo: true,
      repeat: -1
    });

    this.refreshTexts();
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  drawBackground() {
    // Fundo desenhado por codigo: estrada, faixas e carro real do jogo.
    const g = this.add.graphics();
    g.fillGradientStyle(0x09111c, 0x09111c, 0x172b3f, 0x172b3f, 1);
    g.fillRect(0, 0, 960, 540);

    g.fillStyle(0x121820, 0.55);
    g.fillRect(0, 0, 960, 540);

    g.fillStyle(0x242424, 1);
    g.fillRect(190, 0, 580, 540);

    g.fillStyle(0x3a3a3a, 1);
    g.fillRect(190, 0, 22, 540);
    g.fillRect(748, 0, 22, 540);

    g.fillStyle(0xf1c40f, 0.92);
    g.fillRect(210, 0, 4, 540);
    g.fillRect(746, 0, 4, 540);

    g.fillStyle(0xffffff, 0.18);
    g.fillRect(382, 0, 8, 540);
    g.fillRect(570, 0, 8, 540);

    for (let i = 0; i < 9; i += 1) {
      const y = i * 78;
      this.add.rectangle(386, y, 6, 42, 0xffffff, 0.48).setDepth(1);
      this.add.rectangle(574, y + 35, 6, 42, 0xffffff, 0.48).setDepth(1);
    }

    this.add.rectangle(480, 492, 260, 34, 0x66d1ff, 0.07).setDepth(2);
    this.menuCar = this.add.sprite(480, 462, "carroSprite", 0).setScale(0.13).setDepth(3);
    this.menuCar.setOrigin(0.324, 0.5);
  }

  refreshTexts() {
    // Todos os textos do menu dependem do idioma atual.
    const lang = this.registry.get("lang") || "pt";
    const dict = this.registry.get("i18n")[lang];

    this.titleText.setText(dict.gameTitle);
    this.subtitle.setText(dict.menuSubtitle);
    this.startText.setText(dict.menuStart);
    this.langHintText.setText(dict.menuLang);
    this.langCurrentText.setText(`${dict.menuCurrentLang}: ${lang.toUpperCase()}`);

    this.fitText(this.titleText, 560);
    this.fitText(this.subtitle, 540);
    this.fitText(this.startText, 250);
    this.fitText(this.langHintText, 520);
    this.fitText(this.langCurrentText, 160);
  }

  fitText(textObject, maxWidth) {
    textObject.setScale(1);
    if (textObject.width <= maxWidth) return;
    textObject.setScale(Math.max(0.72, maxWidth / textObject.width));
  }

  setStartButtonHover(isHovering) {
    this.startButton.setFillStyle(isHovering ? 0x1f7db0 : 0x14608a, 1);
    this.startButton.setStrokeStyle(2, isHovering ? 0xffffff : 0xbbe6ff, 0.95);
  }

  update() {
    // Tecla E troca o idioma; Enter comeca o jogo.
    if (this._transitioning) return;

    if (Phaser.Input.Keyboard.JustDown(this.toggleLangKey)) {
      const current = this.registry.get("lang") || "pt";
      const langs = ["pt", "en", "es"];
      this.registry.set("lang", langs[(langs.indexOf(current) + 1) % langs.length]);
      this.refreshTexts();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.startGame();
    }
  }

  startGame() {
    // Comeca sempre uma tentativa limpa a partir do nivel 1.
    if (this._transitioning) return;
    this._transitioning = true;
    this.registry.set("runState", {
      lives: 3, score: 0, phase: 1, level: 1,
      fuel: 100, shield: 0, combo: 0, bestCombo: 0,
      nearMisses: 0, elapsed: 0
    });
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.sound.play("engineStart");
      this.scene.start("Room1Scene");
    });
  }
}
