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
  {
    id: 2,
    chapter: 1,
    timeLimit: 10,
    orders: [
      {
        recipient: "山顶灯塔",
        goods: "水晶瓶",
        traits: ["易碎"],
        destination: "钟声山谷",
        deadline: 8,
      },
    ],
    availableMaterials: ["paper_box", "wooden_box", "feather_pad"],
    routes: [
      { id: "sunny", name: "晴朗路线", distance: 5, hazards: [] },
      { id: "bumpy", name: "颠簸气流路线", distance: 3, hazards: ["颠簸"] },
    ],
    birds: [
      { id: "swift", name: "轻快信鸽", speed: 10, loadCapacity: 5 },
    ],
    starConditions: { safe: true, onTime: true, clever: false },
  },
  {
    id: 3,
    chapter: 1,
    timeLimit: 10,
    orders: [
      {
        recipient: "暗房画家",
        goods: "感光相纸",
        traits: ["怕光"],
        destination: "迷雾群岛",
        deadline: 8,
      },
    ],
    availableMaterials: ["paper_box", "wax_paper", "wooden_box"],
    routes: [
      { id: "sunny", name: "晴朗路线", distance: 5, hazards: [] },
      { id: "bright", name: "强光路线", distance: 3, hazards: ["强光"] },
    ],
    birds: [
      { id: "swift", name: "轻快信鸽", speed: 10, loadCapacity: 5 },
    ],
    starConditions: { safe: true, onTime: true, clever: false },
  },
  {
    id: 4,
    chapter: 1,
    timeLimit: 10,
    orders: [
      {
        recipient: "温室花匠",
        goods: "鲜花种子",
        traits: ["需要透气"],
        destination: "晴风山谷",
        deadline: 8,
      },
    ],
    availableMaterials: ["paper_box", "wax_paper", "feather_pad"],
    routes: [
      { id: "sunny", name: "晴朗路线", distance: 5, hazards: [] },
      { id: "rainy", name: "下雨路线", distance: 3, hazards: ["雨"] },
    ],
    birds: [
      { id: "swift", name: "轻快信鸽", speed: 10, loadCapacity: 5 },
    ],
    starConditions: { safe: true, onTime: true, clever: false },
  },
  {
    id: 5,
    chapter: 2,
    timeLimit: 8,
    orders: [
      {
        recipient: "节日庆典",
        goods: "魔法烟花",
        traits: ["怕水", "限时"],
        destination: "天空邮路",
        deadline: 4,
      },
    ],
    availableMaterials: ["paper_box", "wax_paper", "wooden_box", "feather_pad"],
    routes: [
      { id: "sunny", name: "晴朗路线", distance: 8, hazards: [] },
      { id: "rainy", name: "下雨路线", distance: 3, hazards: ["雨"] },
    ],
    birds: [
      { id: "swift", name: "轻快信鸽", speed: 10, loadCapacity: 5 },
      { id: "heavy", name: "负重信鸽", speed: 5, loadCapacity: 10 },
    ],
    starConditions: { safe: true, onTime: true, clever: true },
  },
];

export function getLevel(id: number): LevelData | undefined {
  return LEVELS.find((l) => l.id === id);
}