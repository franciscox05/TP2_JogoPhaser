export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.toggleLangKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.drawBackground();

    const panel = this.add.rectangle(480, 280, 560, 330, 0x090705, 0.72);
    panel.setStrokeStyle(2, 0xb67a32, 0.9);

    this.titleText = this.add.text(480, 170, "", {
      fontSize: "64px",
      color: "#d97a28",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.subtitle = this.add.text(480, 230, "DODGE, COLLECT, SURVIVE", {
      fontSize: "21px",
      color: "#f2d2a2",
      letterSpacing: 3
    }).setOrigin(0.5);

    this.startText = this.add.text(480, 305, "", {
      fontSize: "32px",
      color: "#fff4dd",
      backgroundColor: "#6b3f1d",
      padding: { left: 18, right: 18, top: 10, bottom: 10 }
    }).setOrigin(0.5);

    this.langHintText = this.add.text(480, 370, "", {
      fontSize: "20px",
      color: "#e7be85"
    }).setOrigin(0.5);

    this.langCurrentText = this.add.text(480, 412, "", {
      fontSize: "18px",
      color: "#d7e8ff"
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.startText,
      alpha: { from: 1, to: 0.5 },
      duration: 850,
      yoyo: true,
      repeat: -1
    });

    this.refreshTexts();
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x1a110b, 0x1a110b, 0x3b2418, 0x3b2418, 1);
    g.fillRect(0, 0, 960, 540);

    g.fillStyle(0x4f3323, 1);
    for (let y = 40; y < 500; y += 44) {
      for (let x = 20; x < 940; x += 68) {
        const wobble = Phaser.Math.Between(-4, 4);
        g.fillRoundedRect(x + wobble, y, 60, 28, 4);
      }
    }

    g.fillStyle(0x111111, 0.35);
    g.fillRect(0, 0, 960, 540);

    this.add.circle(140, 120, 80, 0xff9e47, 0.2);
    this.add.circle(820, 140, 75, 0xff9e47, 0.2);
    this.add.circle(130, 120, 26, 0xff55ff, 0.6);
    this.add.circle(820, 140, 26, 0xff55ff, 0.6);
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
      this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, elapsed: 0 });
      this.sound.play("engineStart");
      this.scene.start("Room1Scene");
    }
  }
}
