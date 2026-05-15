export class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  init(data) {
    this.victory = Boolean(data?.victory);
  }

  create() {
    this.drawBackground();

    const lang = this.registry.get("lang") || "pt";
    const dict = this.registry.get("i18n")[lang];

    const title = this.victory ? dict.winTitle : dict.loseTitle;
    const subtitle = this.victory ? dict.winSubtitle : dict.loseSubtitle;

    const panel = this.add.rectangle(480, 270, 620, 290, 0x080604, 0.74);
    panel.setStrokeStyle(2, this.victory ? 0x57b348 : 0xc45858, 1);

    this.add.text(480, 190, title, {
      fontSize: "62px",
      color: this.victory ? "#8de969" : "#ff8b8b",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(480, 275, subtitle, {
      fontSize: "30px",
      color: "#f2e6d8"
    }).setOrigin(0.5);

    this.add.text(480, 352, dict.restartHint, {
      fontSize: "24px",
      color: "#e7be85",
      backgroundColor: "#44291a",
      padding: { left: 12, right: 12, top: 7, bottom: 7 }
    }).setOrigin(0.5);

    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x140d09, 0x140d09, 0x341f14, 0x341f14, 1);
    g.fillRect(0, 0, 960, 540);
    g.fillStyle(0x3b2518, 1);
    for (let y = 40; y < 500; y += 44) {
      for (let x = 20; x < 940; x += 68) {
        g.fillRoundedRect(x + Phaser.Math.Between(-3, 3), y, 60, 28, 4);
      }
    }
    g.fillStyle(0x050403, 0.45);
    g.fillRect(0, 0, 960, 540);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.start("MenuScene");
    }
  }
}
