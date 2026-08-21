import Phaser from "phaser";
import { Button } from "../ui/Button";
import { getLevel } from "../data/levels";
import { MATERIALS } from "../data/materials";

export class PostOfficeScene extends Phaser.Scene {
  private selectedMaterials: Set<string> = new Set();

  constructor() {
    super({ key: "PostOffice" });
  }

  create(): void {
    const levelId = (this.scene.settings.data as Record<string, unknown>)?.levelId as number || 1;
    const level = getLevel(levelId);
    if (!level) {
      this.scene.start("LevelSelect");
      return;
    }

    const order = level.orders[0];
    this.selectedMaterials = new Set();

    this.add.text(640, 40, "邮局 — 包装阶段", {
      fontSize: "36px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.rectangle(640, 110, 500, 70, 0xf5eed6).setStrokeStyle(2, 0x8b7355);
    this.add.text(640, 100, `📦 ${order.goods}  →  ${order.recipient}`, {
      fontSize: "22px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);
    this.add.text(640, 130, `目的地：${order.destination}  |  时限：${order.deadline}`, {
      fontSize: "14px", color: "#8b7355", fontFamily: "serif",
    }).setOrigin(0.5);

    order.traits.forEach((t, i) => {
      this.add.text(640, 165 + i * 22, `⚠ 特性：${t}`, {
        fontSize: "16px", color: "#c0392b", fontFamily: "serif",
      }).setOrigin(0.5);
    });

    this.add.text(640, 230, "选择包装材料：", {
      fontSize: "20px", color: "#5c4a32", fontFamily: "serif",
    }).setOrigin(0.5);

    const materialIds = level.availableMaterials;
    const cols = 4;
    const spacingX = 240;
    const startX = 640 - ((Math.min(materialIds.length, cols) - 1) * spacingX) / 2;
    const cellY = 360;

    materialIds.forEach((id, i) => {
      const mat = MATERIALS[id];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * spacingX;
      const y = cellY + row * 200;

      const card = this.add.container(x, y);

      const bg = this.add.rectangle(0, 0, 200, 150, 0xf5eed6)
        .setStrokeStyle(2, 0x8b7355)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(0, -50, mat.name, {
        fontSize: "22px", color: "#5c4a32", fontFamily: "serif",
      }).setOrigin(0.5);

      const props = this.add.text(0, 10, this.formatProps(mat), {
        fontSize: "13px", color: "#8b7355", fontFamily: "serif", align: "center",
      }).setOrigin(0.5);

      card.add([bg, nameText, props]);
      this.add.existing(card);

      bg.on("pointerdown", () => {
        if (this.selectedMaterials.has(id)) {
          this.selectedMaterials.delete(id);
          bg.setFillStyle(0xf5eed6);
          bg.setStrokeStyle(2, 0x8b7355);
        } else {
          this.selectedMaterials.add(id);
          bg.setFillStyle(0xd4e6c3);
          bg.setStrokeStyle(3, 0x27ae60);
        }
      });
    });

    new Button(this, 640, 560, "确认发件", () => {
      if (this.selectedMaterials.size === 0) return;
      this.scene.start("Route", {
        levelId,
        selectedMaterials: Array.from(this.selectedMaterials),
      });
    });

    new Button(this, 640, 640, "返回选关", () => {
      this.scene.start("LevelSelect");
    }, 160, 50);
  }

  private formatProps(mat: { waterproof: number; shockproof: number; lightproof: number; breathability: number; weight: number }): string {
    return `防水 ${mat.waterproof}  防震 ${mat.shockproof}\n遮光 ${mat.lightproof}  透气 ${mat.breathability}\n重量 ${mat.weight}`;
  }
}