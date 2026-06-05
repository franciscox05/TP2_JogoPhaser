export class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  init(data) {
    this.victory = Boolean(data?.victory);
    this.score = Number(data?.score ?? 0);
    this.phase = Number(data?.phase ?? 1);
    this.level = Number(data?.level ?? 1);
    this.elapsed = Number(data?.elapsed ?? 0);
    this.bestCombo = Number(data?.bestCombo ?? 0);
    this.nearMisses = Number(data?.nearMisses ?? 0);
  }

  create() {
    this.drawBackground();

    const lang = this.registry.get("lang") || "pt";
    const dict = this.registry.get("i18n")[lang];

    const title = this.victory ? dict.winTitle : dict.loseTitle;
    const subtitle = this.victory ? dict.winSubtitle : dict.loseSubtitle;
    const bestScore = this.updateBestScore(this.score);

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
      258,
      `${dict.hudScore}: ${this.score}  |  ${dict.hudPhase}: ${this.phase}  |  ${dict.hudRoom}: ${this.level}`,
      {
        fontSize: "22px",
        color: "#f2d2a2"
      }
    ).setOrigin(0.5);

    this.add.text(480, 290, this.format(dict.runStats, {
      time: Math.round(this.elapsed),
      nearMisses: this.nearMisses,
      bestCombo: this.bestCombo
    }), {
      fontSize: "18px",
      color: "#d9e7ff"
    }).setOrigin(0.5);

    const medal = this.getMedalByScore(this.score);
    this.add.text(480, 324, `${dict.medalLabel}: ${dict[medal.key]}`, {
      fontSize: "24px",
      color: medal.color,
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(480, 360, `${bestScore.isNew ? dict.newBest : dict.bestScore}: ${bestScore.value}`, {
      fontSize: "20px",
      color: bestScore.isNew ? "#8de969" : "#d9e7ff",
      fontStyle: bestScore.isNew ? "bold" : "normal"
    }).setOrigin(0.5);

    this.add.text(480, 405, dict.restartHint, {
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

  updateBestScore(score) {
    const storageKey = "roadEscapeBestScore";
    const previous = Number(localStorage.getItem(storageKey) ?? 0);
    const value = Math.max(previous, score);
    if (value !== previous) localStorage.setItem(storageKey, String(value));
    return { value, isNew: value > previous };
  }

  format(template, values) {
    return template.replace(/\{(\w+)\}/g, (_match, key) => values[key] ?? "");
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
      this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, shield: 0, combo: 0, bestCombo: 0, nearMisses: 0, elapsed: 0 });
      this.scene.start("MenuScene");
    }
  }
}
