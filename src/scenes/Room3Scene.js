import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room3Scene extends BaseRoomScene {
  constructor() {
    super("Room3Scene", {
      roomNumber: 3,
      nextScene: "EndScene",
      final: true,
      targetScore: 3600,
      phase2Score: 2600,
      phase3Score: 3200,
      baseSpeed: 360,
      phaseSpeedBoost: 95,
      baseSpawnDelay: 760,
      coinSpawnDelay: 1100,
      coinScore: 75
    });
  }
}
