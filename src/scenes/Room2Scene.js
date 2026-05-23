import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room2Scene extends BaseRoomScene {
  constructor() {
    super("Room2Scene", {
      roomNumber: 2,
      nextScene: "Room3Scene",
      final: false,
      targetScore: 2000,
      phase2Score: 1200,
      phase3Score: 1700,
      baseSpeed: 300,
      phaseSpeedBoost: 80,
      baseSpawnDelay: 860,
      coinSpawnDelay: 1200,
      coinScore: 60,
      fuelDrainPerTick: 0.27,
      coinFuelBonus: 7,
      hitFuelPenalty: 17
    });
  }
}
