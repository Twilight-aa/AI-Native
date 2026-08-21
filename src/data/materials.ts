import { MaterialData } from "../types/game";

export const MATERIALS: Record<string, MaterialData> = {
  paper_box: {
    id: "paper_box",
    name: "纸盒",
    waterproof: 0,
    shockproof: 2,
    lightproof: 0,
    breathability: 5,
    weight: 1,
    slot: "container",
  },
  wooden_box: {
    id: "wooden_box",
    name: "木箱",
    waterproof: 2,
    shockproof: 5,
    lightproof: 3,
    breathability: 2,
    weight: 3,
    slot: "container",
  },
  wax_paper: {
    id: "wax_paper",
    name: "蜡纸",
    waterproof: 5,
    shockproof: 0,
    lightproof: 2,
    breathability: 1,
    weight: 0.5,
    slot: "outer",
  },
  feather_pad: {
    id: "feather_pad",
    name: "羽毛垫",
    waterproof: 0,
    shockproof: 3,
    lightproof: 0,
    breathability: 4,
    weight: 1.5,
    slot: "filling",
  },
};

export const TRAIT_REQUIREMENTS: Record<string, { waterproof?: number; shockproof?: number; lightproof?: number; breathable?: boolean }> = {
  "怕水": { waterproof: 3 },
  "易碎": { shockproof: 3 },
  "怕光": { lightproof: 3 },
  "需要透气": { breathable: true },
};

export const TRAIT_FAIL_MESSAGES: Record<string, string> = {
  "怕水": "包裹被雨淋湿",
  "易碎": "包裹因颠簸破碎",
  "怕光": "包裹因强光损坏",
  "需要透气": "包裹无法呼吸",
};