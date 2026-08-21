import { MATERIALS, TRAIT_REQUIREMENTS, TRAIT_FAIL_MESSAGES, HAZARD_TRAIT_MAP } from "../data/materials";
import { PackingResult, DeliveryResult } from "../types/game";

function getMaterialStats(container: string | null, outer: string | null, filling: string | null): PackingResult {
  const materialIds = [container, outer, filling].filter((id): id is string => id !== null);

  let waterproof = 0, shockproof = 0, lightproof = 0, totalWeight = 0;
  let breathability = Infinity;

  for (const id of materialIds) {
    const m = MATERIALS[id];
    if (m) {
      waterproof += m.waterproof;
      shockproof += m.shockproof;
      lightproof += m.lightproof;
      totalWeight += m.weight;
      breathability = Math.min(breathability, m.breathability);
    }
  }

  if (breathability === Infinity) breathability = 0;

  const issues: string[] = [];
  if (!container) {
    issues.push("必须选择容器");
  }

  return { materialIds, waterproof, shockproof, lightproof, breathability, totalWeight, issues };
}

export function evaluatePacking(
  traits: string[],
  container: string | null,
  outer: string | null,
  filling: string | null,
): PackingResult {
  const result = getMaterialStats(container, outer, filling);

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
    const requiredTrait = HAZARD_TRAIT_MAP[hazard];
    if (!requiredTrait || !traits.includes(requiredTrait)) continue;

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
  container: string | null,
  outer: string | null,
  filling: string | null,
  routeHazards: string[],
  routeDistance: number,
  birdSpeed: number,
  birdLoadCapacity: number,
  deadline: number,
): DeliveryResult {
  const packing = evaluatePacking(traits, container, outer, filling);
  const routeFailReasons = evaluateRoute(traits, routeHazards, packing);

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
  const clever = container !== null && (outer === null || filling === null);

  return {
    safe,
    onTime,
    clever,
    success: safe && onTime,
    failReasons,
  };
}