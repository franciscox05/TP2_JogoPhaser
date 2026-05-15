import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room2Scene extends BaseRoomScene {
  constructor() {
    super("Room2Scene", {
      roomNumber: 2,
      objectTex: "riddleTex",
      titleKey: "puzzleWordTitle",
      promptKey: "puzzleWordPrompt",
      answer: "vida",
      nextScene: "Room3Scene",
      final: false,
      enemies: [
        { x: 150, y: 180, vx: 110 },
        { x: 420, y: 360, vy: 110 }
      ]
    });
  }
}
