import Phaser from "phaser";
import { Button } from "../ui/Button";
import { getLevel, LEVELS } from "../data/levels";
import { MATERIALS } from "../data/materials";
import { evaluateDelivery } from "../systems/OrderSystem";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: "Result" });
  }

  create(): void {
    const data = this.scene.settings.data as Record<string, unknown> || {};
    const levelId = data.levelId as number || 1;
    const selectedMaterials = (data.selectedMaterials as string[]) || [];
    const selectedRoute = data.selectedRoute as string || "";
    const selectedBird = data.selectedBird as string || "";

    const level = getLevel(levelId);
    if (!level) {
      this.scene.start("LevelSelect");
      return;
    }

    const order = level.orders[0];
    const route = level.routes.find((r) => r.id === selectedRoute);
    const bird = level.birds.find((b) => b.id === selectedBird);

    const result = evaluateDelivery(
      order.traits,
      selectedMaterials[0] || null,
      selectedMaterials[1] || null,
      selectedMaterials[2] || null,
      route?.hazards || [],
      route?.distance || 0,
      bird?.speed || 10,
      bird?.loadCapacity || 5,
      order.deadline,
    );

    const travelTime = route ? (route.distance / (bird?.speed || 10)) : 0;

    this.add.text(640, 30, "运输结算", {
      fontSize: "36px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.rectangle(640, 80, 700, 50, 0xf5eed6).setStrokeStyle(2, 0x8b7355);
    this.add.text(640, 80, `${order.goods}  →  ${order.recipient}  |  路线：${route?.name || "未知"}  |  邮鸟：${bird?.name || "未知"}`, {
      fontSize: "16px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const statusY = 150;
    if (result.success) {
      this.add.text(640, statusY, "✅ 包裹完好抵达！", {
        fontSize: "32px", color: "#27ae60", fontFamily: "serif",
      }).setOrigin(0.5);
    } else {
      this.add.text(640, statusY, "❌ 投递失败", {
        fontSize: "32px", color: "#c0392b", fontFamily: "serif",
      }).setOrigin(0.5);
    }

    const stars = [];
    if (result.safe) stars.push("安全星 ✓");
    else stars.push("安全星 ✗");
    if (result.onTime) stars.push("准时星 ✓");
    else stars.push("准时星 ✗");
    if (result.clever) stars.push("巧思星 ✓");
    else stars.push("巧思星 ✗");

    this.add.text(640, 200, stars.join("   "), {
      fontSize: "18px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 240, `包装总重：${this.getTotalWeight(selectedMaterials)}  |  邮鸟负载：${bird?.loadCapacity || 0}  |  运输时间：${travelTime}  |  时限：${order.deadline}`, {
      fontSize: "14px", color: "#8b7355", fontFamily: "serif",
    }).setOrigin(0.5);

    if (result.failReasons.length > 0) {
      this.add.text(640, 300, "失败原因：", {
        fontSize: "18px", color: "#c0392b", fontFamily: "serif",
      }).setOrigin(0.5);

      result.failReasons.forEach((r, i) => {
        this.add.text(640, 330 + i * 30, `- ${r}`, {
          fontSize: "18px", color: "#c0392b", fontFamily: "serif",
        }).setOrigin(0.5);
      });
    }

    this.add.text(640, 470, "提示：更换包装材料、选择不同路线或邮鸟可改变结果", {
      fontSize: "14px", color: "#8b7355", fontFamily: "serif",
    }).setOrigin(0.5);

    new Button(this, 480, 540, "重试", () => {
      this.scene.start("PostOffice", { levelId });
    });

    new Button(this, 800, 540, "下一关", () => {
      const nextLevel = LEVELS.find((l) => l.id === levelId + 1);
      if (nextLevel) {
        this.scene.start("PostOffice", { levelId: levelId + 1 });
      } else {
        this.scene.start("LevelSelect");
      }
    });

    new Button(this, 640, 620, "返回选关", () => {
      this.scene.start("LevelSelect");
    }, 160, 50);
  }

  private getTotalWeight(materialIds: string[]): number {
    let w = 0;
    for (const id of materialIds) {
      const m = MATERIALS[id];
      if (m) w += m.weight;
    }
    return w;
  }
}