export class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  init(data) {
    this.victory = Boolean(data?.victory);
    this.score = Number(data?.score ?? 0);
    this.phase = Number(data?.phase ?? 1);
    this.level = Number(data?.level ?? 1);
  }

  create() {
    this.drawBackground();

    const lang = this.registry.get("lang") || "pt";
    const dict = this.registry.get("i18n")[lang];

    const title = this.victory ? dict.winTitle : dict.loseTitle;
    const subtitle = this.victory ? dict.winSubtitle : dict.loseSubtitle;

    const panel = this.add.rectangle(480, 270, 640, 380, 0x080604, 0.74);
    panel.setStrokeStyle(2, this.victory ? 0x57b348 : 0xc45858, 1);

    this.add.text(480, 150, title, {
      fontSize: "58px",
      color: this.victory ? "#8de969" : "#ff8b8b",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(480, 215, subtitle, {
      fontSize: "28px",
      color: "#f2e6d8"
    }).setOrigin(0.5);

    this.add.text(
      480,
      265,
      `${dict.hudScore}: ${this.score}  |  ${dict.hudPhase}: ${this.phase}  |  ${dict.hudRoom}: ${this.level}`,
      {
        fontSize: "22px",
        color: "#f2d2a2"
      }
    ).setOrigin(0.5);

    const medal = this.getMedalByScore(this.score);
    this.add.text(480, 314, `${dict.medalLabel}: ${dict[medal.key]}`, {
      fontSize: "24px",
      color: medal.color,
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(480, 390, dict.restartHint, {
      fontSize: "24px",
      color: "#e7be85",
      backgroundColor: "#44291a",
      padding: { left: 12, right: 12, top: 7, bottom: 7 }
    }).setOrigin(0.5);

    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }

  getMedalByScore(score) {
    if (score >= 3600) return { key: "medalGold", color: "#ffd54a" };
    if (score >= 2500) return { key: "medalSilver", color: "#dfe7f2" };
    return { key: "medalBronze", color: "#d68a4d" };
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
      this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, elapsed: 0 });
      this.scene.start("MenuScene");
    }
  }
}
