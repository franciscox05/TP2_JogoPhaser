import pt from "../data/pt.json" with { type: "json" };
import en from "../data/en.json" with { type: "json" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.audio("engineStart", "./assets/audio/start.mp3");
    this.load.audio("engineLoop", "./assets/audio/engine_loop.mp3");
    
    this.load.svg("carroSprite", "./assets/images/carro.svg");
    this.load.svg("taxiSprite", "./assets/images/taxi.svg");
    this.load.svg("gasolinaSprite", "./assets/images/gazolina.svg");
    this.load.svg("metaSprite", "./assets/images/meta.svg");
  }

  create() {
    this.registry.set("lang", "pt");
    this.registry.set("i18n", { pt, en });
    this.registry.set("runState", { lives: 3, score: 0, phase: 1, level: 1, fuel: 100, shield: 0, combo: 0, bestCombo: 0, nearMisses: 0, elapsed: 0 });
    this.scene.start("MenuScene");
  }
}