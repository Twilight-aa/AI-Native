export interface LevelData {
  id: number;
  chapter: number;
  shiftDuration: number;
  orders: OrderData[];
  availableMaterials: string[];
  routes: RouteData[];
  birds: BirdData[];
  starConditions: StarConditions;
}

export interface OrderData {
  recipient: string;
  goods: string;
  traits: string[];
  destination: string;
  deadline: number;
  arrivalTime: number;
  patience: number;
}

export interface RouteData {
  id: string;
  name: string;
  distance: number;
  hazards: string[];
}

export interface BirdData {
  id: string;
  name: string;
  speed: number;
  loadCapacity: number;
  flyTime: number;
  returnTime: number;
}

export interface StarConditions {
  safe: boolean;
  onTime: boolean;
  clever: boolean;
}

export interface MaterialData {
  id: string;
  name: string;
  waterproof: number;
  shockproof: number;
  lightproof: number;
  breathability: number;
  weight: number;
  slot: "container" | "outer" | "filling";
}

export interface PackingResult {
  materialIds: string[];
  waterproof: number;
  shockproof: number;
  lightproof: number;
  breathability: number;
  totalWeight: number;
  issues: string[];
}

export interface DeliveryResult {
  safe: boolean;
  onTime: boolean;
  clever: boolean;
  success: boolean;
  failReasons: string[];
}

export interface ShiftState {
  time: number;
  duration: number;
  orders: ShiftOrderState[];
  birds: ShiftBirdState[];
  currentOrderIndex: number | null;
  score: number;
  combo: number;
  satisfaction: number;
  finished: boolean;
}

export interface ShiftOrderState {
  order: OrderData;
  arrived: boolean;
  patienceRemaining: number;
  status: "waiting" | "processing" | "in_transit" | "delivered" | "lost";
  deliveryResult: DeliveryResult | null;
  container: string | null;
  outer: string | null;
  filling: string | null;
  selectedRoute: string | null;
  selectedBird: string | null;
}

export interface ShiftBirdState {
  birdId: string;
  status: "idle" | "flying" | "returning";
  timeRemaining: number;
}