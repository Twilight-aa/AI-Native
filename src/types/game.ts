export interface LevelData {
  id: number;
  chapter: number;
  timeLimit: number;
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
}

export interface StarConditions {
  safe: boolean;
  onTime: boolean;
  clever: boolean;
}

export interface PackingState {
  container: string | null;
  outer: string | null;
  filling: string | null;
  totalWeight: number;
}

export interface RouteSelection {
  routeId: string;
  birdId: string;
}

export interface DeliveryResult {
  safe: boolean;
  onTime: boolean;
  clever: boolean;
  failReasons: string[];
}