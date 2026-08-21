import { MATERIALS, TRAIT_REQUIREMENTS, TRAIT_FAIL_MESSAGES } from "../data/materials";
import { PackingResult, DeliveryResult } from "../types/game";

function getMaterialStats(materialIds: string[]): PackingResult {
  let waterproof = 0, shockproof = 0, lightproof = 0, breathability = 0, totalWeight = 0;

  for (const id of materialIds) {
    const m = MATERIALS[id];
    if (m) {
      waterproof += m.waterproof;
      shockproof += m.shockproof;
      lightproof += m.lightproof;
      breathability += m.breathability;
      totalWeight += m.weight;
    }
  }

  return { materialIds, waterproof, shockproof, lightproof, breathability, totalWeight, issues: [] };
}

export function evaluatePacking(traits: string[], materialIds: string[]): PackingResult {
  const result = getMaterialStats(materialIds);

  for (const trait of traits) {
    const req = TRAIT_REQUIREMENTS[trait];
    if (!req) continue;

    if (req.breathable === true && result.breathability < 3) {
      result.issues.push(TRAIT_FAIL_MESSAGES[trait]);
    }
  }

  return result;
}

export function evaluateRoute(
  hazards: string[],
  packing: PackingResult,
): string[] {
  const failReasons: string[] = [];

  for (const hazard of hazards) {
    if (hazard === "雨" && packing.waterproof < 3) {
      failReasons.push(TRAIT_FAIL_MESSAGES["怕水"]);
    }
    if (hazard === "颠簸" && packing.shockproof < 3) {
      failReasons.push(TRAIT_FAIL_MESSAGES["易碎"]);
    }
    if (hazard === "强光" && packing.lightproof < 3) {
      failReasons.push(TRAIT_FAIL_MESSAGES["怕光"]);
    }
  }

  return failReasons;
}

export function evaluateDelivery(
  traits: string[],
  materialIds: string[],
  routeHazards: string[],
  routeDistance: number,
  birdSpeed: number,
  birdLoadCapacity: number,
  deadline: number,
): DeliveryResult {
  const packing = evaluatePacking(traits, materialIds);
  const routeFailReasons = evaluateRoute(routeHazards, packing);

  const failReasons: string[] = [...packing.issues, ...routeFailReasons];

  const travelTime = routeDistance / birdSpeed;
  if (travelTime > deadline) {
    failReasons.push("超过送达时限");
  }

  if (packing.totalWeight > birdLoadCapacity) {
    failReasons.push("邮鸟超重");
  }

  const safe = failReasons.length === 0;
  const onTime = travelTime <= deadline;
  const clever = true;

  return {
    safe,
    onTime,
    clever,
    success: safe && onTime,
    failReasons,
  };
}