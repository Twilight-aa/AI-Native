import { describe, it, expect } from "vitest";
import { evaluatePacking, evaluateRoute, evaluateDelivery } from "./OrderSystem";

describe("evaluatePacking", () => {
  it("纸盒(容器) + 怕水 → 无固有冲突", () => {
    const result = evaluatePacking(["怕水"], "paper_box", null, null);
    expect(result.waterproof).toBe(0);
    expect(result.issues).toHaveLength(0);
  });

  it("无容器 → 必须选择容器", () => {
    const result = evaluatePacking(["怕水"], null, null, null);
    expect(result.issues).toContain("必须选择容器");
  });

  it("蜡纸(外层) + 需要透气 → 包裹无法呼吸", () => {
    const result = evaluatePacking(["需要透气"], null, "wax_paper", null);
    expect(result.breathability).toBeLessThan(3);
    expect(result.issues).toContain("包裹无法呼吸");
  });

  it("纸盒+蜡纸+羽毛垫 → 透气取最低值(蜡纸1)", () => {
    const result = evaluatePacking(["需要透气"], "paper_box", "wax_paper", "feather_pad");
    expect(result.breathability).toBe(1);
    expect(result.breathability).toBeLessThan(3);
    expect(result.issues).toContain("包裹无法呼吸");
  });

  it("纸盒+羽毛垫 → 透气取最低值(羽毛垫4)", () => {
    const result = evaluatePacking(["需要透气"], "paper_box", null, "feather_pad");
    expect(result.breathability).toBe(4);
    expect(result.issues).toHaveLength(0);
  });
});

describe("evaluateRoute", () => {
  it("纸盒 + 雨区 + 怕水 → 包裹被雨淋湿", () => {
    const packing = evaluatePacking(["怕水"], "paper_box", null, null);
    const reasons = evaluateRoute(["怕水"], ["雨"], packing);
    expect(reasons).toContain("包裹被雨淋湿");
  });

  it("纸盒+蜡纸 + 雨区 + 怕水 → 无问题", () => {
    const packing = evaluatePacking(["怕水"], "paper_box", "wax_paper", null);
    const reasons = evaluateRoute(["怕水"], ["雨"], packing);
    expect(reasons).toHaveLength(0);
  });

  it("纸盒 + 雨区 + 非怕水 → 无问题（危险不匹配特性）", () => {
    const packing = evaluatePacking(["易碎"], "paper_box", null, null);
    const reasons = evaluateRoute(["易碎"], ["雨"], packing);
    expect(reasons).toHaveLength(0);
  });

  it("纸盒 + 颠簸区 + 易碎 → 包裹因颠簸破碎", () => {
    const packing = evaluatePacking(["易碎"], "paper_box", null, null);
    const reasons = evaluateRoute(["易碎"], ["颠簸"], packing);
    expect(reasons).toContain("包裹因颠簸破碎");
  });

  it("木箱 + 颠簸区 + 易碎 → 无问题", () => {
    const packing = evaluatePacking(["易碎"], "wooden_box", null, null);
    const reasons = evaluateRoute(["易碎"], ["颠簸"], packing);
    expect(reasons).toHaveLength(0);
  });
});

describe("evaluateDelivery", () => {
  it("纸盒 + 晴天 + 怕水 → 成功", () => {
    const result = evaluateDelivery(["怕水"], "paper_box", null, null, [], 5, 10, 5, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("纸盒 + 下雨 + 怕水 → 失败：包裹被雨淋湿", () => {
    const result = evaluateDelivery(["怕水"], "paper_box", null, null, ["雨"], 3, 10, 5, 8);
    expect(result.success).toBe(false);
    expect(result.failReasons).toContain("包裹被雨淋湿");
  });

  it("纸盒+蜡纸 + 下雨 + 怕水 → 成功", () => {
    const result = evaluateDelivery(["怕水"], "paper_box", "wax_paper", null, ["雨"], 3, 10, 5, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });

  it("蜡纸(无容器) + 需要透气 → 失败：必须选择容器", () => {
    const result = evaluateDelivery(["需要透气"], null, "wax_paper", null, [], 3, 10, 5, 8);
    expect(result.success).toBe(false);
    expect(result.failReasons).toContain("必须选择容器");
  });

  it("超重 → 失败：邮鸟超重", () => {
    const result = evaluateDelivery(["怕水"], "wooden_box", null, "feather_pad", [], 3, 10, 3, 8);
    expect(result.failReasons).toContain("邮鸟超重");
  });

  it("超时 → 失败：超过送达时限", () => {
    const result = evaluateDelivery(["怕水"], "paper_box", null, null, [], 50, 5, 5, 4);
    expect(result.failReasons).toContain("超过送达时限");
  });

  it("木箱+羽毛垫 + 颠簸 + 易碎 → 成功", () => {
    const result = evaluateDelivery(["易碎"], "wooden_box", null, "feather_pad", ["颠簸"], 3, 10, 5, 8);
    expect(result.success).toBe(true);
    expect(result.failReasons).toHaveLength(0);
  });
});