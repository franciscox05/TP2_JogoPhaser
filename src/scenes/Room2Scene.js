import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room2Scene extends BaseRoomScene {
  constructor() {
    super("Room2Scene", {
      roomNumber: 2,
      nextScene: "Room3Scene",
      final: false,
      previousTargetScore: 900,
      targetScore: 2000,
      phase2Score: 1250,
      phase3Score: 1720,
      baseSpeed: 275,
      phaseSpeedBoost: 70,
      baseSpawnDelay: 940,
      minSpawnDelay: 680,
      obstacleMinGap: 320,
      coinSpawnDelay: 1200,
      coinScore: 60,
      nearMissScore: 24,
      fuelDrainPerTick: 0.27,
      coinFuelBonus: 9,
      hitFuelPenalty: 14,
      lifeRespawnDelay: 15000,
      lifeVisibleMs: 5600,
      shieldRespawnDelay: 10500,
      shieldVisibleMs: 5000
    });
  }
}
