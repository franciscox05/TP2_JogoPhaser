import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room1Scene extends BaseRoomScene {
  constructor() {
    super("Room1Scene", {
      roomNumber: 1,
      objectTex: "chestTex",
      titleKey: "puzzleCodeTitle",
      promptKey: "puzzleCodePrompt",
      answer: "4791",
      nextScene: "Room2Scene",
      final: false,
      enemies: [
        { x: 140, y: 170, vx: 95 },
        { x: 250, y: 380, vy: 90 }
      ]
    });
  }
}
