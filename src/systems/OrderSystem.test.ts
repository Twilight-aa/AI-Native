import { describe, it, expect } from "vitest";
import { evaluatePacking, evaluateRoute, evaluateDelivery } from "./OrderSystem";

describe("evaluatePacking", () => {
  it("纸盒 + 怕水 parcel → 无固有冲突（防水依赖路线）", () => {
    const result = evaluatePacking(["怕水"], ["paper_box"]);
    expect(result.waterproof).toBe(0);
    expect(result.issues).toHaveLength(0);
  });

  it("蜡纸 + 需要透气 parcel → 包裹无法呼吸", () => {
    const result = evaluatePacking(["需要透气"], ["wax_paper"]);
    expect(result.breathability).toBeLessThan(3);
    expect(result.issues).toContain("包裹无法呼吸");
  });
});

describe("evaluateRoute", () => {
  it("纸盒packing + 雨区 → 包裹被雨淋湿", () => {
    const packing = evaluatePacking(["怕水"], ["paper_box"]);
    const reasons = evaluateRoute(["雨"], packing);
    expect(reasons).toContain("包裹被雨淋湿");
  });

  it("纸盒+蜡纸 packing + 雨区 → 无问题", () => {
    const packing = evaluatePacking(["怕水"], ["paper_box", "wax_paper"]);
    const reasons = evaluateRoute(["雨"], packing);
    expect(reasons).toHaveLength(0);
  });
});

describe("evaluateDelivery", () => {
  it("纸盒 + 晴天 → 成功", () => {
    const result = evaluateDelivery(["怕水"], ["paper_box"], [], 5, 10, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("纸盒 + 下雨 → 失败：包裹被雨淋湿", () => {
    const result = evaluateDelivery(["怕水"], ["paper_box"], ["雨"], 3, 10, 8);
    expect(result.success).toBe(false);
    expect(result.failReasons).toContain("包裹被雨淋湿");
  });

  it("纸盒 + 蜡纸 + 下雨 → 成功", () => {
    const result = evaluateDelivery(["怕水"], ["paper_box", "wax_paper"], ["雨"], 3, 10, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("需要透气 + 蜡纸 → 失败：包裹无法呼吸", () => {
    const result = evaluateDelivery(["需要透气"], ["wax_paper"], [], 3, 10, 8);
    expect(result.success).toBe(false);
    expect(result.failReasons).toContain("包裹无法呼吸");
  });
});