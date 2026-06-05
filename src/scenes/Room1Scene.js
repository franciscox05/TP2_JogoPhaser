import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room1Scene extends BaseRoomScene {
  constructor() {
    super("Room1Scene", {
      roomNumber: 1,
      nextScene: "Room2Scene",
      final: false,
      previousTargetScore: 0,
      targetScore: 900,
      phase2Score: 320,
      phase3Score: 660,
      baseSpeed: 220,
      phaseSpeedBoost: 55,
      baseSpawnDelay: 1080,
      minSpawnDelay: 720,
      obstacleMinGap: 300,
      coinSpawnDelay: 1300,
      coinScore: 50,
      nearMissScore: 18,
      fuelDrainPerTick: 0.2,
      coinFuelBonus: 10,
      hitFuelPenalty: 10,
      lifeRespawnDelay: 13000,
      lifeVisibleMs: 6000,
      shieldRespawnDelay: 9000,
      shieldVisibleMs: 5200
    });
  }
}
