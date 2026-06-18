import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room3Scene extends BaseRoomScene {
  constructor() {
    super("Room3Scene", {
      roomNumber: 3,
      nextScene: "EndScene",
      final: true,
      previousTargetScore: 2050,
      targetScore: 3700,
      phase2Score: 2700,
      phase3Score: 3300,
      baseSpeed: 365,
      phaseSpeedBoost: 95,
      baseSpawnDelay: 760,
      phaseSpawnReduction: 115,
      levelSpawnReduction: 30,
      minSpawnDelay: 500,
      obstacleMinGap: 370,
      doubleObstacleChance: 0.32,
      doubleObstaclePhaseBoost: 0.11,
      doubleObstacleLevelBoost: 0.05,
      maxDoubleObstacleChance: 0.64,
      playerLanePressureChance: 0.68,
      playerLanePressurePhaseBoost: 0.10,
      playerLanePressureLevelBoost: 0.04,
      maxPlayerLanePressureChance: 0.88,
      maxLaneIdleMs: 1600,
      truckChance: 0.16,
      coinSpawnDelay: 1100,
      coinScore: 46,
      nearMissScore: 9,
      nearMissComboCap: 2,
      nearMissWindowMs: 750,
      fuelDrainPerTick: 0.41,
      coinFuelBonus: 8,
      hitFuelPenalty: 17,
      lifeRespawnDelay: 17000,
      lifeVisibleMs: 5200,
      shieldRespawnDelay: 12000,
      shieldVisibleMs: 4700
    });
  }
}
