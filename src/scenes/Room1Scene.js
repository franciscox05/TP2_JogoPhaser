import { BaseRoomScene } from "./BaseRoomScene.js";

export class Room1Scene extends BaseRoomScene {
  constructor() {
    super("Room1Scene", {
      roomNumber: 1,
      nextScene: "Room2Scene",
      final: false,
      targetScore: 900,
      phase2Score: 300,
      phase3Score: 650,
      baseSpeed: 240,
      phaseSpeedBoost: 65,
      baseSpawnDelay: 980,
      coinSpawnDelay: 1300,
      coinScore: 50,
      fuelDrainPerTick: 0.22,
      coinFuelBonus: 8,
      hitFuelPenalty: 14
    });
  }
}
