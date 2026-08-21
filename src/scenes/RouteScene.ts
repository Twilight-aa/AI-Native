import Phaser from "phaser";
import { Button } from "../ui/Button";
import { getLevel } from "../data/levels";
import { MATERIALS } from "../data/materials";

export class RouteScene extends Phaser.Scene {
  private selectedRoute: string | null = null;

  constructor() {
    super({ key: "Route" });
  }

  create(): void {
    const data = this.scene.settings.data as Record<string, unknown> || {};
    const levelId = data.levelId as number || 1;
    const selectedMaterials = (data.selectedMaterials as string[]) || [];
    const level = getLevel(levelId);
    if (!level) {
      this.scene.start("LevelSelect");
      return;
    }

    this.selectedRoute = null;

    this.add.text(640, 50, "路线规划", {
      fontSize: "36px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.rectangle(640, 120, 600, 80, 0xf5eed6).setStrokeStyle(2, 0x8b7355);
    this.add.text(640, 108, `已选包装：${selectedMaterials.map((id: string) => MATERIALS[id]?.name).join(" + ")}`, {
      fontSize: "18px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const packingProps = this.getPackingProps(selectedMaterials);
    this.add.text(640, 140, `防水 ${packingProps.waterproof}  防震 ${packingProps.shockproof}  遮光 ${packingProps.lightproof}  透气 ${packingProps.breathability}`, {
      fontSize: "14px", color: "#8b7355", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 220, "选择路线：", {
      fontSize: "20px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const routeCards: Phaser.GameObjects.Container[] = [];

    level.routes.forEach((route, i) => {
      const x = 300 + i * 680;
      const y = 380;

      const card = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 300, 180, 0xf5eed6)
        .setStrokeStyle(2, 0x8b7355)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(0, -60, route.name, {
        fontSize: "24px", color: "#5c4a32", fontFamily: "serif",
      }).setOrigin(0.5);

      const hazardText = route.hazards.length > 0
        ? `⚠ 危险：${route.hazards.join("、")}`
        : "☀ 无危险";
      const hazardLabel = this.add.text(0, -20, hazardText, {
        fontSize: "16px", color: route.hazards.length > 0 ? "#c0392b" : "#27ae60", fontFamily: "serif",
      }).setOrigin(0.5);

      const distText = this.add.text(0, 20, `距离：${route.distance}`, {
        fontSize: "14px", color: "#8b7355", fontFamily: "serif",
      }).setOrigin(0.5);

      card.add([bg, nameText, hazardLabel, distText]);
      this.add.existing(card);

      bg.on("pointerdown", () => {
        routeCards.forEach((c) => {
          const r = c.getAt(0) as Phaser.GameObjects.Rectangle;
          r.setFillStyle(0xf5eed6);
          r.setStrokeStyle(2, 0x8b7355);
        });
        this.selectedRoute = route.id;
        bg.setFillStyle(0xd4e6c3);
        bg.setStrokeStyle(3, 0x27ae60);
      });

      routeCards.push(card);
    });

    new Button(this, 640, 560, "确认路线", () => {
      if (!this.selectedRoute) return;
      const route = level.routes.find((r) => r.id === this.selectedRoute);
      if (!route) return;
      this.scene.start("Result", {
        levelId,
        selectedMaterials,
        selectedRoute: this.selectedRoute,
      });
    });

    new Button(this, 640, 640, "返回包装", () => {
      this.scene.start("PostOffice", { levelId });
    }, 160, 50);
  }

  private getPackingProps(materialIds: string[]): { waterproof: number; shockproof: number; lightproof: number; breathability: number } {
    let w = 0, s = 0, l = 0, b = 0;
    for (const id of materialIds) {
      const m = MATERIALS[id];
      if (m) {
        w += m.waterproof;
        s += m.shockproof;
        l += m.lightproof;
        b += m.breathability;
      }
    }
    return { waterproof: w, shockproof: s, lightproof: l, breathability: b };
  }
}