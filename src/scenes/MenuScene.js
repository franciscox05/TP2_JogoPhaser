export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.toggleLangKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.drawBackground();

    const panel = this.add.rectangle(480, 280, 620, 350, 0x05070b, 0.76);
    panel.setStrokeStyle(2, 0x3fb0ff, 0.9);

    this.titleText = this.add.text(480, 155, "", {
      fontSize: "66px",
      color: "#66d1ff",
      fontStyle: "bold",
      stroke: "#0a1f33",
      strokeThickness: 6
    }).setOrigin(0.5);

    this.subtitle = this.add.text(480, 225, "3 LANES - 3 LEVELS - 1 ESCAPE", {
      fontSize: "20px",
      color: "#cdefff",
      letterSpacing: 2
    }).setOrigin(0.5);

    this.startText = this.add.text(480, 305, "", {
      fontSize: "30px",
      color: "#ffffff",
      backgroundColor: "#14608a",
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5);

    this.langHintText = this.add.text(480, 366, "", {
      fontSize: "19px",
      color: "#d7ebff"
    }).setOrigin(0.5);

    this.langCurrentText = this.add.text(480, 408, "", {
      fontSize: "18px",
      color: "#b6d9ff"
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.startText,
      scale: { from: 1, to: 1.04 },
      alpha: { from: 1, to: 0.75 },
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.refreshTexts();
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0a111c, 0x0a111c, 0x15263d, 0x15263d, 1);
    g.fillRect(0, 0, 960, 540);

    g.fillStyle(0x232323, 1);
    g.fillRect(200, 0, 560, 540);

    g.fillStyle(0xffffff, 0.2);
    g.fillRect(382, 0, 8, 540);
    g.fillRect(570, 0, 8, 540);

    for (let i = 0; i < 9; i += 1) {
      const y = i * 80;
      this.add.rectangle(386, y, 6, 45, 0xffffff, 0.55);
      this.add.rectangle(574, y + 35, 6, 45, 0xffffff, 0.55);
    }

    // Headlights/glow
    this.add.circle(430, 445, 120, 0x66d1ff, 0.14);
    this.add.circle(530, 445, 120, 0x66d1ff, 0.14);

    // Car silhouette hint
    this.add.rectangle(480, 445, 120, 52, 0x0f2b45, 0.95).setStrokeStyle(2, 0x66d1ff, 0.8);
  }

  refreshTexts() {
    const lang = this.registry.get("lang") || "pt";
    const dict = this.registry.get("i18n")[lang];

    this.titleText.setText(dict.gameTitle);
    this.startText.setText(dict.menuStart);
    this.langHintText.setText(dict.menuLang);
    this.langCurrentText.setText(`${dict.menuCurrentLang}: ${lang.toUpperCase()}`);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.toggleLangKey)) {
      const current = this.registry.get("lang") || "pt";
      this.registry.set("lang", current === "pt" ? "en" : "pt");
      this.refreshTexts();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, elapsed: 0 });
      this.sound.play("engineStart");
      this.scene.start("Room1Scene");
    }
  }
}
