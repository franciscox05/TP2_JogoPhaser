import pt from "../data/pt.json" with { type: "json" };
import en from "../data/en.json" with { type: "json" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.audio("engineStart", "./assets/audio/start.mp3");
    this.load.svg("carroSprite", "./assets/images/carro.svg");
    this.load.svg("taxiSprite", "./assets/images/taxi.svg");
    
    // Adiciona estas duas linhas:
    this.load.svg("gasolinaSprite", "./assets/images/gasolina.svg");
    this.load.svg("metaSprite", "./assets/images/meta.svg");
  }

  create() {
    this.registry.set("lang", "pt");
    this.registry.set("i18n", { pt, en });
    this.registry.set("runState", { lives: 3, timeLeft: 180, keys: 0 });
    this.scene.start("MenuScene");
  }
}
