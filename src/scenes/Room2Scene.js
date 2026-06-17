import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room2Scene extends BaseRoomScene {
  constructor() {
    super("Room2Scene", {
      roomNumber: 2,
      nextScene: "Room3Scene",
      final: false,
      previousTargetScore: 900,
      targetScore: 2050,
      phase2Score: 1250,
      phase3Score: 1740,
      baseSpeed: 305,
      phaseSpeedBoost: 82,
      baseSpawnDelay: 850,
      phaseSpawnReduction: 105,
      levelSpawnReduction: 25,
      minSpawnDelay: 560,
      obstacleMinGap: 350,
      doubleObstacleChance: 0.22,
      doubleObstaclePhaseBoost: 0.10,
      doubleObstacleLevelBoost: 0.05,
      maxDoubleObstacleChance: 0.54,
      playerLanePressureChance: 0.60,
      playerLanePressurePhaseBoost: 0.09,
      playerLanePressureLevelBoost: 0.04,
      maxPlayerLanePressureChance: 0.82,
      truckChance: 0.13,
      coinSpawnDelay: 1200,
      coinScore: 38,
      nearMissScore: 7,
      nearMissComboCap: 2,
      nearMissWindowMs: 800,
      fuelDrainPerTick: 0.31,
      coinFuelBonus: 9,
      hitFuelPenalty: 14,
      lifeRespawnDelay: 15000,
      lifeVisibleMs: 5600,
      shieldRespawnDelay: 10500,
      shieldVisibleMs: 5000
    });
  }
}
