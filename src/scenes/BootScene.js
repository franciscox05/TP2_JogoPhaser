import pt from "../data/pt.json" with { type: "json" };
import en from "../data/en.json" with { type: "json" };
import es from "../data/es.json" with { type: "json" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // --- GESTÃO DE ERROS DE CARREGAMENTO ---
    this.load.on("loaderror", (file) => {
      console.warn(`[BootScene] Asset nao encontrado, ignorado: ${file.key}`);
    });

    // --- CARREGAMENTO DE ÁUDIO ---
    this.load.audio("engineStart", "./assets/audio/start.mp3");
    this.load.audio("engineLoop", "./assets/audio/engine_loop.mp3");
    this.load.audio("bgMusic",     "./assets/audio/bgmusic.mp3");
    this.load.audio("collision",   "./assets/audio/collision.mp3");
    this.load.audio("coin",        "./assets/audio/coin.mp3");
    this.load.audio("phaseUp",     "./assets/audio/phase_up.mp3");
    this.load.audio("levelClear",  "./assets/audio/level_clear.mp3");
    this.load.audio("win",         "./assets/audio/win.mp3");
    this.load.audio("lose",        "./assets/audio/lose.mp3");
    
    // --- CARREGAMENTO DE GRÁFICOS E SPRITESHEETS ---
    this.load.spritesheet("carroSprite", "./assets/images/carro_anim.png", { frameWidth: 389, frameHeight: 465 });
    this.load.image("taxiSprite", "./assets/images/taxi_anim.png");
    this.load.svg("gasolinaSprite", "./assets/images/gazolina.svg");
    this.load.svg("metaSprite", "./assets/images/meta.svg");
  }

  create() {
    // --- INICIALIZAÇÃO DO ESTADO GLOBAL ---
    this.registry.set("lang", "pt");
    this.registry.set("i18n", { pt, en, es });
    this.registry.set("runState", {
      lives: 3, score: 0, phase: 1, level: 1,
      fuel: 100, shield: 0, combo: 0, bestCombo: 0,
      nearMisses: 0, elapsed: 0
    });
    this.scene.start("MenuScene");
  }
}