import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room3Scene extends BaseRoomScene {
  constructor() {
    super("Room3Scene", {
      roomNumber: 3,
      objectTex: "symbolTex",
      titleKey: "puzzleSymbolTitle",
      promptKey: "puzzleSymbolPrompt",
      answer: "1234",
      nextScene: "EndScene",
      final: true,
      enemies: [
        { x: 150, y: 150, vx: 130 },
        { x: 420, y: 390, vy: 120 }
      ]
    });
  }
}
