import pt from "../data/pt.json" with { type: "json" };
import en from "../data/en.json" with { type: "json" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.registry.set("lang", "pt");
    this.registry.set("i18n", { pt, en });
    this.registry.set("runState", { lives: 3, timeLeft: 180, keys: 0 });
    this.scene.start("MenuScene");
  }
}
