import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room3Scene extends BaseRoomScene {
  constructor() {
    super("Room3Scene", {
      roomNumber: 3,
      nextScene: "EndScene",
      final: true,
      previousTargetScore: 2000,
      targetScore: 3600,
      phase2Score: 2650,
      phase3Score: 3250,
      baseSpeed: 330,
      phaseSpeedBoost: 85,
      baseSpawnDelay: 860,
      minSpawnDelay: 640,
      obstacleMinGap: 340,
      coinSpawnDelay: 1100,
      coinScore: 75,
      nearMissScore: 32,
      fuelDrainPerTick: 0.34,
      coinFuelBonus: 8,
      hitFuelPenalty: 17,
      lifeRespawnDelay: 17000,
      lifeVisibleMs: 5200,
      shieldRespawnDelay: 12000,
      shieldVisibleMs: 4700
    });
  }
}
