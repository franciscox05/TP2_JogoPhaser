import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { Room1Scene } from "./scenes/Room1Scene.js";
import { Room2Scene } from "./scenes/Room2Scene.js";
import { Room3Scene } from "./scenes/Room3Scene.js";
import { EndScene } from "./scenes/EndScene.js";

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  backgroundColor: "#1a1410",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [BootScene, MenuScene, Room1Scene, Room2Scene, Room3Scene, EndScene]
};

new Phaser.Game(config);
