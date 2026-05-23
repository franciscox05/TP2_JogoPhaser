import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room2Scene extends BaseRoomScene {
  constructor() {
    super("Room2Scene", {
      roomNumber: 2,
      nextScene: "Room3Scene",
      final: false,
      targetScore: 2000,
      phase2Score: 1250,
      phase3Score: 1720,
      baseSpeed: 275,
      phaseSpeedBoost: 70,
      baseSpawnDelay: 940,
      coinSpawnDelay: 1200,
      coinScore: 60,
      fuelDrainPerTick: 0.22,
      coinFuelBonus: 9,
      hitFuelPenalty: 14,
      lifeRespawnDelay: 15000,
      lifeVisibleMs: 5600
    });
  }
}
