import Phaser from "phaser";
import { Button } from "../ui/Button";
import { getLevel } from "../data/levels";
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

    const level = getLevel(levelId);
    if (!level) {
      this.scene.start("LevelSelect");
      return;
    }

    const order = level.orders[0];
    const route = level.routes.find((r) => r.id === selectedRoute);
    const bird = level.birds[0];

    const result = evaluateDelivery(
      order.traits,
      selectedMaterials,
      route?.hazards || [],
      route?.distance || 0,
      bird?.speed || 10,
      order.deadline,
    );

    this.add.text(640, 50, "运输结算", {
      fontSize: "36px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.rectangle(640, 120, 600, 60, 0xf5eed6).setStrokeStyle(2, 0x8b7355);
    this.add.text(640, 120, `${order.goods}  →  ${order.recipient}  |  路线：${route?.name || "未知"}`, {
      fontSize: "18px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const statusY = 220;
    if (result.success) {
      this.add.text(640, statusY, "✅ 包裹完好抵达！", {
        fontSize: "32px", color: "#27ae60", fontFamily: "serif",
      }).setOrigin(0.5);
    } else {
      this.add.text(640, statusY, "❌ 投递失败", {
        fontSize: "32px", color: "#c0392b", fontFamily: "serif",
      }).setOrigin(0.5);
    }

    const stars = [
      this.formatStar("安全星", level.starConditions.safe, result.safe),
      this.formatStar("准时星", level.starConditions.onTime, result.onTime),
      this.formatStar("巧思星", level.starConditions.clever, result.clever),
    ];

    this.add.text(640, 280, stars.join("   "), {
      fontSize: "18px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    if (result.failReasons.length > 0) {
      const reasons = result.failReasons.map((r, i) =>
        this.add.text(640, 340 + i * 30, `- ${r}`, {
          fontSize: "18px", color: "#c0392b", fontFamily: "serif",
        }).setOrigin(0.5)
      );
      reasons[0]?.setY(340);
    }

    this.add.text(640, 460, "提示：更换包装材料或选择不同路线可改变结果", {
      fontSize: "14px", color: "#8b7355", fontFamily: "serif",
    }).setOrigin(0.5);

    new Button(this, 480, 540, "重试", () => {
      this.scene.start("PostOffice", { levelId });
    });

    new Button(this, 800, 540, "返回选关", () => {
      this.scene.start("LevelSelect");
    });
  }

  private formatStar(label: string, enabled: boolean, earned: boolean): string {
    if (!enabled) return `${label} —`;
    return `${label} ${earned ? "✓" : "✗"}`;
  }
}
