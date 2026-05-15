export class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  init(data) {
    this.victory = Boolean(data?.victory);
  }

  create() {
    const lang = this.registry.get("lang") || "pt";
    const dict = this.registry.get("i18n")[lang];

    const title = this.victory ? dict.winTitle : dict.loseTitle;
    const subtitle = this.victory ? dict.winSubtitle : dict.loseSubtitle;

    this.add.text(480, 200, title, {
      fontSize: "62px",
      color: this.victory ? "#8de969" : "#ff8b8b",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(480, 290, subtitle, {
      fontSize: "28px",
      color: "#f2e6d8"
    }).setOrigin(0.5);

    this.add.text(480, 360, dict.restartHint, {
      fontSize: "24px",
      color: "#cbb89d"
    }).setOrigin(0.5);

    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.start("MenuScene");
    }
  }
}
