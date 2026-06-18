import pt from "../data/pt.json" with { type: "json" };
import en from "../data/en.json" with { type: "json" };
import es from "../data/es.json" with { type: "json" };

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Se algum asset opcional falhar, mostramos aviso mas o jogo continua.
    this.load.on("loaderror", (file) => {
      console.warn(`[BootScene] Asset nao encontrado, ignorado: ${file.key}`);
    });

    // Sons usados no menu, corrida, colisao, vitoria e derrota.
    this.load.audio("engineStart", "./assets/audio/start.mp3");
    this.load.audio("engineLoop", "./assets/audio/engine_loop.mp3");
    this.load.audio("bgMusic",     "./assets/audio/bgmusic.mp3");
    this.load.audio("collision",   "./assets/audio/collision.mp3");
    this.load.audio("coin",        "./assets/audio/coin.mp3");
    this.load.audio("phaseUp",     "./assets/audio/phase_up.mp3");
    this.load.audio("levelClear",  "./assets/audio/level_clear.mp3");
    this.load.audio("win",         "./assets/audio/win.mp3");
    this.load.audio("lose",        "./assets/audio/lose.mp3");
    
    // Sprites principais. O carro e spritesheet animado; os outros sao imagens.
    this.load.spritesheet("carroSprite", "./assets/images/carro_anim.png", { frameWidth: 465, frameHeight: 518 });
    this.load.image("taxiSprite", "./assets/images/taxi_anim.png");
    this.load.svg("gasolinaSprite", "./assets/images/gazolina.svg");
    this.load.svg("metaSprite", "./assets/images/meta.svg");
  }

  create() {
    // Registry e a memoria global do Phaser entre cenas.
    // Guardamos idioma, dicionarios e estado inicial da tentativa.
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
