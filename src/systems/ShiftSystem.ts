import { LevelData, ShiftState, ShiftOrderState, ShiftBirdState } from "../types/game";
import { evaluateDelivery } from "./OrderSystem";

export function createShiftState(level: LevelData): ShiftState {
  const orders: ShiftOrderState[] = level.orders.map((order) => ({
    order,
    arrived: false,
    patienceRemaining: order.patience,
    status: "waiting" as const,
    deliveryResult: null,
    container: null,
    outer: null,
    filling: null,
    selectedRoute: null,
    selectedBird: null,
  }));

  const birds: ShiftBirdState[] = level.birds.map((bird) => ({
    birdId: bird.id,
    status: "idle" as const,
    timeRemaining: 0,
  }));

  return {
    time: 0,
    duration: level.shiftDuration,
    orders,
    birds,
    currentOrderIndex: null,
    score: 0,
    combo: 0,
    satisfaction: 100,
    finished: false,
  };
}

function deliverOrder(state: ShiftState, level: LevelData, order: ShiftOrderState): void {
  const route = level.routes.find((r) => r.id === order.selectedRoute);
  const birdData = level.birds.find((b) => b.id === order.selectedBird);
  if (!route || !birdData) return;

  const result = evaluateDelivery(
    order.order.traits,
    order.container,
    order.outer,
    order.filling,
    route.hazards,
    route.distance,
    birdData.speed,
    birdData.loadCapacity,
    order.order.deadline,
  );
  order.deliveryResult = result;
  order.status = "delivered";

  if (result.success) {
    state.combo += 1;
    state.score += 100 * state.combo;
    state.satisfaction = Math.min(100, state.satisfaction + 5);
  } else {
    state.combo = 0;
    state.satisfaction = Math.max(0, state.satisfaction - 15);
  }
}

export function tickShift(state: ShiftState, level: LevelData, delta: number): ShiftState {
  if (state.finished) return state;

  const newState: ShiftState = {
    ...state,
    orders: state.orders.map((o) => ({ ...o })),
    birds: state.birds.map((b) => ({ ...b })),
  };
  newState.time += delta;

  for (const order of newState.orders) {
    if (!order.arrived && newState.time >= order.order.arrivalTime) {
      order.arrived = true;
      order.status = "waiting";
    }

    if (order.arrived && order.status === "waiting") {
      order.patienceRemaining -= delta;
      if (order.patienceRemaining <= 0) {
        order.status = "lost";
        newState.combo = 0;
        newState.satisfaction = Math.max(0, newState.satisfaction - 10);
      }
    }
  }

  for (const order of newState.orders) {
    if (order.status !== "in_transit") continue;

    const bird = newState.birds.find((b) => b.birdId === order.selectedBird);
    if (!bird) continue;

    bird.timeRemaining -= delta;
    if (bird.timeRemaining <= 0) {
      deliverOrder(newState, level, order);
      const birdData = level.birds.find((b) => b.id === order.selectedBird);
      if (birdData) {
        bird.status = "returning";
        bird.timeRemaining = birdData.returnTime;
      }
    }
  }

  for (const bird of newState.birds) {
    if (bird.status !== "returning") continue;
    bird.timeRemaining -= delta;
    if (bird.timeRemaining <= 0) {
      bird.status = "idle";
      bird.timeRemaining = 0;
    }
  }

  if (newState.time >= newState.duration) {
    newState.finished = true;
  }

  return newState;
}

export function startProcessing(state: ShiftState, orderIndex: number): ShiftState {
  const newState = { ...state, orders: state.orders.map((o) => ({ ...o })), currentOrderIndex: orderIndex };
  if (newState.orders[orderIndex]) {
    newState.orders[orderIndex].status = "processing";
  }
  return newState;
}

export function sendDelivery(
  state: ShiftState,
  level: LevelData,
  orderIndex: number,
  container: string | null,
  outer: string | null,
  filling: string | null,
  routeId: string,
  birdId: string,
): ShiftState {
  const newState: ShiftState = {
    ...state,
    orders: state.orders.map((o) => ({ ...o })),
    birds: state.birds.map((b) => ({ ...b })),
  };
  const order = newState.orders[orderIndex];
  if (!order) return state;

  const route = level.routes.find((r) => r.id === routeId);
  const birdData = level.birds.find((b) => b.id === birdId);
  if (!route || !birdData) return state;

  order.container = container;
  order.outer = outer;
  order.filling = filling;
  order.selectedRoute = routeId;
  order.selectedBird = birdId;
  order.status = "in_transit";

  const travelTime = route.distance / birdData.speed;
  const bird = newState.birds.find((b) => b.birdId === birdId);
  if (bird) {
    bird.status = "flying";
    bird.timeRemaining = travelTime;
  }

  newState.currentOrderIndex = null;

  return newState;
}