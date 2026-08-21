import Phaser from "phaser";
import { Button } from "../ui/Button";
import { getLevel } from "../data/levels";
import { MATERIALS } from "../data/materials";

export class RouteScene extends Phaser.Scene {
  private selectedRoute: string | null = null;
  private selectedBird: string | null = null;

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
    this.selectedBird = null;

    const order = level.orders[0];

    this.add.text(640, 30, "路线规划", {
      fontSize: "36px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.rectangle(640, 80, 700, 60, 0xf5eed6).setStrokeStyle(2, 0x8b7355);
    this.add.text(640, 72, `${order.goods}  →  ${order.recipient}  |  包装：${selectedMaterials.map((id: string) => MATERIALS[id]?.name).join(" + ")}`, {
      fontSize: "16px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const packingProps = this.getPackingProps(selectedMaterials);
    this.add.text(640, 98, `防水 ${packingProps.waterproof}  防震 ${packingProps.shockproof}  遮光 ${packingProps.lightproof}  透气 ${packingProps.breathability}  总重 ${packingProps.totalWeight}`, {
      fontSize: "13px", color: "#8b7355", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 140, "选择路线：", {
      fontSize: "18px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const routeCards: Phaser.GameObjects.Container[] = [];

    level.routes.forEach((route, i) => {
      const x = 300 + i * 680;
      const y = 230;

      const card = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 300, 100, 0xf5eed6)
        .setStrokeStyle(2, 0x8b7355)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(0, -30, route.name, {
        fontSize: "22px", color: "#5c4a32", fontFamily: "serif",
      }).setOrigin(0.5);

      const hazardText = route.hazards.length > 0
        ? `⚠ 危险：${route.hazards.join("、")}`
        : "☀ 无危险";
      const hazardLabel = this.add.text(0, 5, hazardText, {
        fontSize: "15px", color: route.hazards.length > 0 ? "#c0392b" : "#27ae60", fontFamily: "serif",
      }).setOrigin(0.5);

      const distText = this.add.text(0, 30, `距离：${route.distance}`, {
        fontSize: "13px", color: "#8b7355", fontFamily: "serif",
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

    this.add.text(640, 330, "选择邮鸟：", {
      fontSize: "18px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const birdCards: Phaser.GameObjects.Container[] = [];

    level.birds.forEach((bird, i) => {
      const x = 350 + i * 580;
      const y = 410;

      const card = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 280, 90, 0xf5eed6)
        .setStrokeStyle(2, 0x8b7355)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(0, -25, bird.name, {
        fontSize: "20px", color: "#5c4a32", fontFamily: "serif",
      }).setOrigin(0.5);

      const stats = this.add.text(0, 10, `速度 ${bird.speed}  负载 ${bird.loadCapacity}`, {
        fontSize: "15px", color: "#8b7355", fontFamily: "serif",
      }).setOrigin(0.5);

      card.add([bg, nameText, stats]);
      this.add.existing(card);

      bg.on("pointerdown", () => {
        birdCards.forEach((c) => {
          const r = c.getAt(0) as Phaser.GameObjects.Rectangle;
          r.setFillStyle(0xf5eed6);
          r.setStrokeStyle(2, 0x8b7355);
        });
        this.selectedBird = bird.id;
        bg.setFillStyle(0xd4e6c3);
        bg.setStrokeStyle(3, 0x27ae60);
      });

      birdCards.push(card);
    });

    new Button(this, 640, 530, "确认路线", () => {
      if (!this.selectedRoute || !this.selectedBird) return;
      this.scene.start("Result", {
        levelId,
        selectedMaterials,
        selectedRoute: this.selectedRoute,
        selectedBird: this.selectedBird,
      });
    });

    new Button(this, 640, 610, "返回包装", () => {
      this.scene.start("PostOffice", { levelId });
    }, 160, 50);
  }

  private getPackingProps(materialIds: string[]): { waterproof: number; shockproof: number; lightproof: number; breathability: number; totalWeight: number } {
    let w = 0, s = 0, l = 0, b = 0, tw = 0;
    for (const id of materialIds) {
      const m = MATERIALS[id];
      if (m) {
        w += m.waterproof;
        s += m.shockproof;
        l += m.lightproof;
        b += m.breathability;
        tw += m.weight;
      }
    }
    return { waterproof: w, shockproof: s, lightproof: l, breathability: b, totalWeight: tw };
  }
}