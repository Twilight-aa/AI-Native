import { MATERIALS, TRAIT_REQUIREMENTS, TRAIT_FAIL_MESSAGES } from "../data/materials";
import { PackingResult, DeliveryResult } from "../types/game";

function getMaterialStats(materialIds: string[]): PackingResult {
  let waterproof = 0, shockproof = 0, lightproof = 0, breathability = 0, totalWeight = 0;
  let hasMaterial = false;

  for (const id of materialIds) {
    const m = MATERIALS[id];
    if (m) {
      waterproof += m.waterproof;
      shockproof += m.shockproof;
      lightproof += m.lightproof;
      breathability = hasMaterial
        ? Math.min(breathability, m.breathability)
        : m.breathability;
      totalWeight += m.weight;
      hasMaterial = true;
    }
  }

  return { materialIds, waterproof, shockproof, lightproof, breathability, totalWeight, issues: [] };
}

export function evaluatePacking(traits: string[], materialIds: string[]): PackingResult {
  const result = getMaterialStats(materialIds);
  const hasContainer = materialIds.some((id) => MATERIALS[id]?.slot === "container");

  if (!hasContainer) {
    result.issues.push("包裹缺少容器");
  }

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
  traits: string[],
  hazards: string[],
  packing: PackingResult,
): string[] {
  const failReasons: string[] = [];

  for (const hazard of hazards) {
    if (hazard === "雨" && traits.includes("怕水") && packing.waterproof < 3) {
      failReasons.push(TRAIT_FAIL_MESSAGES["怕水"]);
    }
    if (hazard === "颠簸" && traits.includes("易碎") && packing.shockproof < 3) {
      failReasons.push(TRAIT_FAIL_MESSAGES["易碎"]);
    }
    if (hazard === "强光" && traits.includes("怕光") && packing.lightproof < 3) {
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
  deadline: number,
): DeliveryResult {
  const packing = evaluatePacking(traits, materialIds);
  const routeFailReasons = evaluateRoute(traits, routeHazards, packing);

  const failReasons = [...packing.issues, ...routeFailReasons];
  const safe = failReasons.length === 0;
  const travelTime = birdSpeed > 0 ? routeDistance / birdSpeed : Number.POSITIVE_INFINITY;
  const onTime = travelTime <= deadline;

  if (!onTime) {
    failReasons.push("投递超时");
  }

  const clever = safe && onTime && materialIds.length === 1;

  return {
    safe,
    onTime,
    clever,
    success: safe && onTime,
    failReasons,
  };
}
