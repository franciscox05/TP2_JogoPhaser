import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room1Scene extends BaseRoomScene {
  constructor() {
    // Nivel 1: introducao. Velocidade e spawn sao mais suaves,
    // com menos ondas duplas e mais margem de combustivel.
    super("Room1Scene", {
      // Fluxo da campanha.
      roomNumber: 1,
      nextScene: "Room2Scene",
      final: false,

      // Pontuacao necessaria e pontos onde a fase de dificuldade sobe.
      previousTargetScore: 0,
      targetScore: 900,
      phase2Score: 320,
      phase3Score: 660,

      // Ritmo base do nivel: velocidade dos carros e frequencia de spawn.
      baseSpeed: 235,
      phaseSpeedBoost: 62,
      baseSpawnDelay: 980,
      phaseSpawnReduction: 95,
      levelSpawnReduction: 20,
      minSpawnDelay: 650,
      obstacleMinGap: 330,

      // Dificuldade dos obstaculos: ondas duplas, pressao na pista atual e camioes.
      doubleObstacleChance: 0.12,
      doubleObstaclePhaseBoost: 0.08,
      doubleObstacleLevelBoost: 0.04,
      maxDoubleObstacleChance: 0.42,
      playerLanePressureChance: 0.52,
      playerLanePressurePhaseBoost: 0.08,
      playerLanePressureLevelBoost: 0.04,
      maxPlayerLanePressureChance: 0.76,
      maxLaneIdleMs: 2200,
      truckChance: 0.10,

      // Recompensas e risco: moedas, near miss, combustivel, vida e escudo.
      coinSpawnDelay: 1300,
      coinScore: 30,
      nearMissScore: 5,
      nearMissComboCap: 2,
      nearMissWindowMs: 850,
      fuelDrainPerTick: 0.22,
      coinFuelBonus: 10,
      hitFuelPenalty: 10,
      lifeRespawnDelay: 13000,
      lifeVisibleMs: 6000,
      shieldRespawnDelay: 9000,
      shieldVisibleMs: 5200
    });
  }
}
