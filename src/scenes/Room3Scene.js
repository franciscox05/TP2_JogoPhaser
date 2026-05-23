import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room3Scene extends BaseRoomScene {
  constructor() {
    super("Room3Scene", {
      roomNumber: 3,
      nextScene: "EndScene",
      final: true,
      targetScore: 3600,
      phase2Score: 2650,
      phase3Score: 3250,
      baseSpeed: 330,
      phaseSpeedBoost: 85,
      baseSpawnDelay: 860,
      coinSpawnDelay: 1100,
      coinScore: 75,
      fuelDrainPerTick: 0.3,
      coinFuelBonus: 6,
      hitFuelPenalty: 19
    });
  }
}
