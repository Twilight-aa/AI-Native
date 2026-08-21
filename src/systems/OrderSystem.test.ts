import { describe, it, expect } from "vitest";
import { evaluatePacking, evaluateRoute, evaluateDelivery } from "./OrderSystem";

describe("evaluatePacking", () => {
  it("纸盒 + 怕水 parcel → 无固有冲突", () => {
    const result = evaluatePacking(["怕水"], ["paper_box"]);
    expect(result.waterproof).toBe(0);
    expect(result.issues).toHaveLength(0);
  });

  it("蜡纸 + 需要透气 parcel → 包裹无法呼吸", () => {
    const result = evaluatePacking(["需要透气"], ["wax_paper"]);
    expect(result.breathability).toBeLessThan(3);
    expect(result.issues).toContain("包裹无法呼吸");
  });

  it("木箱+羽毛垫 + 易碎 → 防震达标", () => {
    const result = evaluatePacking(["易碎"], ["wooden_box", "feather_pad"]);
    expect(result.shockproof).toBeGreaterThanOrEqual(3);
    expect(result.issues).toHaveLength(0);
  });
});

describe("evaluateRoute", () => {
  it("纸盒 + 雨区 → 包裹被雨淋湿", () => {
    const packing = evaluatePacking(["怕水"], ["paper_box"]);
    const reasons = evaluateRoute(["雨"], packing);
    expect(reasons).toContain("包裹被雨淋湿");
  });

  it("纸盒+蜡纸 + 雨区 → 无问题", () => {
    const packing = evaluatePacking(["怕水"], ["paper_box", "wax_paper"]);
    const reasons = evaluateRoute(["雨"], packing);
    expect(reasons).toHaveLength(0);
  });

  it("纸盒 + 颠簸区 → 包裹因颠簸破碎", () => {
    const packing = evaluatePacking(["易碎"], ["paper_box"]);
    const reasons = evaluateRoute(["颠簸"], packing);
    expect(reasons).toContain("包裹因颠簸破碎");
  });

  it("木箱 + 颠簸区 → 无问题", () => {
    const packing = evaluatePacking(["易碎"], ["wooden_box"]);
    const reasons = evaluateRoute(["颠簸"], packing);
    expect(reasons).toHaveLength(0);
  });

  it("纸盒 + 强光区 → 包裹因强光损坏", () => {
    const packing = evaluatePacking(["怕光"], ["paper_box"]);
    const reasons = evaluateRoute(["强光"], packing);
    expect(reasons).toContain("包裹因强光损坏");
  });

  it("木箱 + 强光区 → 无问题", () => {
    const packing = evaluatePacking(["怕光"], ["wooden_box"]);
    const reasons = evaluateRoute(["强光"], packing);
    expect(reasons).toHaveLength(0);
  });
});

describe("evaluateDelivery", () => {
  it("纸盒 + 晴天 → 成功", () => {
    const result = evaluateDelivery(["怕水"], ["paper_box"], [], 5, 10, 5, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("纸盒 + 下雨 → 失败：包裹被雨淋湿", () => {
    const result = evaluateDelivery(["怕水"], ["paper_box"], ["雨"], 3, 10, 5, 8);
    expect(result.success).toBe(false);
    expect(result.failReasons).toContain("包裹被雨淋湿");
  });

  it("纸盒+蜡纸 + 下雨 → 成功", () => {
    const result = evaluateDelivery(["怕水"], ["paper_box", "wax_paper"], ["雨"], 3, 10, 5, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("需要透气 + 蜡纸 → 失败：包裹无法呼吸", () => {
    const result = evaluateDelivery(["需要透气"], ["wax_paper"], [], 3, 10, 5, 8);
    expect(result.success).toBe(false);
    expect(result.failReasons).toContain("包裹无法呼吸");
  });

  it("超重 → 失败：邮鸟超重", () => {
    const result = evaluateDelivery(["怕水"], ["wooden_box", "wooden_box"], [], 3, 10, 5, 8);
    expect(result.failReasons).toContain("邮鸟超重");
  });

  it("超时 → 失败：超过送达时限", () => {
    const result = evaluateDelivery(["怕水"], ["paper_box"], [], 50, 5, 5, 4);
    expect(result.failReasons).toContain("超过送达时限");
  });

  it("木箱 + 羽毛垫 + 颠簸 → 成功（防震达标）", () => {
    const result = evaluateDelivery(["易碎"], ["wooden_box", "feather_pad"], ["颠簸"], 3, 10, 5, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("木箱 + 强光 → 成功（遮光达标）", () => {
    const result = evaluateDelivery(["怕光"], ["wooden_box"], ["强光"], 3, 10, 5, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });
});