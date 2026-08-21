import { LevelData } from "../types/game";

export const LEVELS: LevelData[] = [
  {
    id: 1,
    chapter: 1,
    timeLimit: 10,
    orders: [
      {
        recipient: "山谷居民",
        goods: "鸟鸣",
        traits: ["怕水"],
        destination: "晴风山谷",
        deadline: 8,
      },
    ],
    availableMaterials: ["paper_box", "wax_paper"],
    routes: [
      { id: "sunny", name: "晴朗路线", distance: 5, hazards: [] },
      { id: "rainy", name: "下雨路线", distance: 3, hazards: ["雨"] },
    ],
    birds: [
      { id: "swift", name: "轻快信鸽", speed: 10, loadCapacity: 5 },
    ],
    starConditions: { safe: true, onTime: true, clever: false },
  },
];

export function getLevel(id: number): LevelData | undefined {
  return LEVELS.find((l) => l.id === id);
}