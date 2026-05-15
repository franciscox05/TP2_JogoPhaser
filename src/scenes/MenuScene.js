export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.toggleLangKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.titleText = this.add.text(480, 160, "", {
      fontSize: "56px",
      color: "#f7d9a8",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.startText = this.add.text(480, 270, "", {
      fontSize: "28px",
      color: "#f2e6d8"
    }).setOrigin(0.5);

    this.langHintText = this.add.text(480, 320, "", {
      fontSize: "22px",
      color: "#cbb89d"
    }).setOrigin(0.5);

    this.langCurrentText = this.add.text(480, 390, "", {
      fontSize: "20px",
      color: "#b3e5ff"
    }).setOrigin(0.5);

    this.refreshTexts();
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
      this.scene.start("GameScene");
    }
  }
}
