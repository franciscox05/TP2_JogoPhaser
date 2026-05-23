import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room1Scene extends BaseRoomScene {
  constructor() {
    super("Room1Scene", {
      roomNumber: 1,
      nextScene: "Room2Scene",
      final: false,
      targetScore: 900,
      phase2Score: 320,
      phase3Score: 660,
      baseSpeed: 220,
      phaseSpeedBoost: 55,
      baseSpawnDelay: 1080,
      coinSpawnDelay: 1300,
      coinScore: 50,
      fuelDrainPerTick: 0.16,
      coinFuelBonus: 10,
      hitFuelPenalty: 10,
      lifeRespawnDelay: 13000,
      lifeVisibleMs: 6000
    });
  }
}
