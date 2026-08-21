import Phaser from "phaser";
import { getLevel } from "../data/levels";
import { MATERIALS } from "../data/materials";
import { createShiftState, tickShift, startProcessing, sendDelivery } from "../systems/ShiftSystem";
import { ShiftState, LevelData } from "../types/game";

export class ShiftScene extends Phaser.Scene {
  private shiftState!: ShiftState;
  private levelId!: number;
  private tickAccumulator = 0;
  private container: string | null = null;
  private outer: string | null = null;
  private filling: string | null = null;
  private selectedRoute: string | null = null;
  private selectedBird: string | null = null;
  private statusTexts: Phaser.GameObjects.Text[] = [];
  private orderTexts: Phaser.GameObjects.Text[] = [];
  private birdTexts: Phaser.GameObjects.Text[] = [];
  private materialCards: Phaser.GameObjects.Container[] = [];
  private routeCards: Phaser.GameObjects.Container[] = [];
  private birdCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: "Shift" });
  }

  create(): void {
    this.levelId = (this.scene.settings.data as Record<string, unknown>)?.levelId as number || 1;
    const level = getLevel(this.levelId);
    if (!level) { this.scene.start("LevelSelect"); return; }

    this.shiftState = createShiftState(level);
    this.tickAccumulator = 0;
    this.container = null;
    this.outer = null;
    this.filling = null;
    this.selectedRoute = null;
    this.selectedBird = null;
    this.statusTexts = [];
    this.orderTexts = [];
    this.birdTexts = [];
    this.materialCards = [];
    this.routeCards = [];
    this.birdCards = [];

    this.drawLayout();
    this.drawStatusBar();
    this.drawOrderQueue(level);
    this.drawPackagingStation(level);
    this.drawRouteSelection(level);
    this.drawBirdSelection(level);
    this.drawBirdStatus(level);
    this.drawSendButton();
  }

  update(_time: number, delta: number): void {
    if (this.shiftState.finished) {
      this.scene.start("Result", { levelId: this.levelId, shiftState: this.shiftState });
      return;
    }

    this.tickAccumulator += delta / 1000;
    if (this.tickAccumulator >= 0.1) {
      const level = getLevel(this.levelId)!;
      this.shiftState = tickShift(this.shiftState, level, this.tickAccumulator);
      this.tickAccumulator = 0;
      this.refreshUI();
    }
  }

  private drawLayout(): void {
    this.add.rectangle(0, 0, 1280, 720, 0xf5f0e6).setOrigin(0);
    this.add.rectangle(0, 0, 1280, 50, 0x8b7355).setOrigin(0);
    this.add.rectangle(0, 50, 300, 400, 0xf5eed6).setOrigin(0).setStrokeStyle(1, 0x8b7355);
    this.add.rectangle(300, 50, 680, 400, 0xf5eed6).setOrigin(0).setStrokeStyle(1, 0x8b7355);
    this.add.rectangle(980, 50, 300, 400, 0xf5eed6).setOrigin(0).setStrokeStyle(1, 0x8b7355);
    this.add.rectangle(0, 450, 1280, 270, 0xf5eed6).setOrigin(0).setStrokeStyle(1, 0x8b7355);

    this.add.text(150, 55, "订单队列", { fontSize: "16px", color: "#5c4a32", fontFamily: "serif" }).setOrigin(0.5, 0);
    this.add.text(640, 55, "包装台", { fontSize: "16px", color: "#5c4a32", fontFamily: "serif" }).setOrigin(0.5, 0);
    this.add.text(1130, 55, "路线与邮鸟", { fontSize: "16px", color: "#5c4a32", fontFamily: "serif" }).setOrigin(0.5, 0);
    this.add.text(640, 455, "邮鸟状态", { fontSize: "16px", color: "#5c4a32", fontFamily: "serif" }).setOrigin(0.5, 0);
  }

  private drawStatusBar(): void {
    this.add.text(20, 12, "风邮局", { fontSize: "20px", color: "#ffffff", fontFamily: "serif" });
    this.statusTexts = [
      this.add.text(200, 14, "时间: 0s", { fontSize: "16px", color: "#ffffff", fontFamily: "serif" }),
      this.add.text(400, 14, "分数: 0", { fontSize: "16px", color: "#ffffff", fontFamily: "serif" }),
      this.add.text(580, 14, "连击: 0", { fontSize: "16px", color: "#ffd700", fontFamily: "serif" }),
      this.add.text(760, 14, "满意度: 100%", { fontSize: "16px", color: "#ffffff", fontFamily: "serif" }),
    ];
  }

  private drawOrderQueue(level: LevelData): void {
    level.orders.forEach((_, i) => {
      const y = 90 + i * 110;
      this.add.rectangle(10, y, 280, 100, 0xffffff).setOrigin(0).setStrokeStyle(1, 0xcccccc);
      const text = this.add.text(20, y + 5, "", { fontSize: "13px", color: "#5c4a32", fontFamily: "serif" });
      this.orderTexts.push(text);
    });
  }

  private drawPackagingStation(level: LevelData): void {
    const materialIds = level.availableMaterials;
    const startX = 340;

    materialIds.forEach((id, i) => {
      const mat = MATERIALS[id];
      const x = startX + i * 220;

      const card = this.add.container(x, 130);
      const bg = this.add.rectangle(0, 0, 200, 150, 0xffffff)
        .setStrokeStyle(2, 0x8b7355)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(0, -55, mat.name, { fontSize: "20px", color: "#5c4a32", fontFamily: "serif" }).setOrigin(0.5);
      const slotText = this.add.text(0, -30, `[${mat.slot === "container" ? "容器" : mat.slot === "outer" ? "外层" : "填充"}]`, {
        fontSize: "12px", color: "#8b7355", fontFamily: "serif",
      }).setOrigin(0.5);
      const props = this.add.text(0, 5, this.formatProps(mat), {
        fontSize: "12px", color: "#8b7355", fontFamily: "serif", align: "center",
      }).setOrigin(0.5);

      card.add([bg, nameText, slotText, props]);
      this.add.existing(card);

      bg.on("pointerdown", () => {
        this.selectMaterial(id, mat.slot, bg);
      });

      this.materialCards.push(card);
    });
  }

  private drawRouteSelection(level: LevelData): void {
    level.routes.forEach((route, i) => {
      const y = 90 + i * 60;
      const card = this.add.container(1020, y);
      const bg = this.add.rectangle(0, 0, 220, 50, 0xffffff)
        .setStrokeStyle(2, 0x8b7355)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(0, 0, route.name, { fontSize: "14px", color: "#5c4a32", fontFamily: "serif" }).setOrigin(0.5);
      card.add([bg, text]);
      this.add.existing(card);

      bg.on("pointerdown", () => {
        this.routeCards.forEach((c) => {
          (c.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0xffffff);
          (c.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x8b7355);
        });
        this.selectedRoute = route.id;
        bg.setFillStyle(0xd4e6c3);
        bg.setStrokeStyle(3, 0x27ae60);
      });

      this.routeCards.push(card);
    });
  }

  private drawBirdSelection(level: LevelData): void {
    level.birds.forEach((bird, i) => {
      const y = 250 + i * 60;
      const card = this.add.container(1020, y);
      const bg = this.add.rectangle(0, 0, 220, 50, 0xffffff)
        .setStrokeStyle(2, 0x8b7355)
        .setInteractive({ useHandCursor: true });
      const text = this.add.text(0, 0, `${bird.name} (速${bird.speed} 载${bird.loadCapacity})`, {
        fontSize: "13px", color: "#5c4a32", fontFamily: "serif",
      }).setOrigin(0.5);
      card.add([bg, text]);
      this.add.existing(card);

      bg.on("pointerdown", () => {
        this.birdCards.forEach((c) => {
          (c.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0xffffff);
          (c.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x8b7355);
        });
        this.selectedBird = bird.id;
        bg.setFillStyle(0xd4e6c3);
        bg.setStrokeStyle(3, 0x27ae60);
      });

      this.birdCards.push(card);
    });
  }

  private drawBirdStatus(level: LevelData): void {
    level.birds.forEach((_bird, i) => {
      const x = 20 + i * 320;
      const text = this.add.text(x, 480, "", { fontSize: "14px", color: "#5c4a32", fontFamily: "serif" });
      this.birdTexts.push(text);
    });
  }

  private drawSendButton(): void {
    const bg = this.add.rectangle(1140, 370, 120, 50, 0x27ae60)
      .setStrokeStyle(2, 0x1e8449)
      .setInteractive({ useHandCursor: true });
    this.add.text(1140, 370, "发件", { fontSize: "20px", color: "#ffffff", fontFamily: "serif" }).setOrigin(0.5);
    bg.on("pointerdown", () => { this.sendPackage(); });
  }

  private selectMaterial(id: string, slot: "container" | "outer" | "filling", _bg: Phaser.GameObjects.Rectangle): void {
    if (slot === "container") {
      this.container = this.container === id ? null : id;
    } else if (slot === "outer") {
      this.outer = this.outer === id ? null : id;
    } else {
      this.filling = this.filling === id ? null : id;
    }

    this.materialCards.forEach((card) => {
      const rect = card.getAt(0) as Phaser.GameObjects.Rectangle;
      rect.setFillStyle(0xffffff);
      rect.setStrokeStyle(2, 0x8b7355);
    });

    [this.container, this.outer, this.filling].forEach((selectedId) => {
      if (selectedId) {
        const idx = getLevel(this.levelId)?.availableMaterials.indexOf(selectedId);
        if (idx !== undefined && idx !== -1 && this.materialCards[idx]) {
          const rect = this.materialCards[idx].getAt(0) as Phaser.GameObjects.Rectangle;
          rect.setFillStyle(0xd4e6c3);
          rect.setStrokeStyle(3, 0x27ae60);
        }
      }
    });
  }

  private sendPackage(): void {
    const level = getLevel(this.levelId);
    if (!level || this.shiftState.currentOrderIndex === null) return;

    const orderIndex = this.shiftState.currentOrderIndex;
    if (!this.selectedRoute || !this.selectedBird) return;

    this.shiftState = sendDelivery(
      this.shiftState, level, orderIndex,
      this.container, this.outer, this.filling,
      this.selectedRoute, this.selectedBird,
    );

    this.container = null;
    this.outer = null;
    this.filling = null;
    this.selectedRoute = null;
    this.selectedBird = null;

    this.materialCards.forEach((card) => {
      const rect = card.getAt(0) as Phaser.GameObjects.Rectangle;
      rect.setFillStyle(0xffffff);
      rect.setStrokeStyle(2, 0x8b7355);
    });
    this.routeCards.forEach((card) => {
      (card.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0xffffff);
      (card.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x8b7355);
    });
    this.birdCards.forEach((card) => {
      (card.getAt(0) as Phaser.GameObjects.Rectangle).setFillStyle(0xffffff);
      (card.getAt(0) as Phaser.GameObjects.Rectangle).setStrokeStyle(2, 0x8b7355);
    });
  }

  private refreshUI(): void {
    const level = getLevel(this.levelId)!;
    const t = this.shiftState.time;

    this.statusTexts[0]?.setText(`时间: ${Math.floor(t)}s / ${this.shiftState.duration}s`);
    this.statusTexts[1]?.setText(`分数: ${this.shiftState.score}`);
    this.statusTexts[2]?.setText(`连击: ${this.shiftState.combo}`);
    this.statusTexts[3]?.setText(`满意度: ${Math.floor(this.shiftState.satisfaction)}%`);

    this.shiftState.orders.forEach((order, i) => {
      const text = this.orderTexts[i];
      if (!text) return;

      const goods = order.order.goods;
      const traits = order.order.traits.join(",");
      const statusMap: Record<string, string> = { waiting: "等待中", processing: "处理中", in_transit: "运输中", delivered: "已送达", lost: "已流失" };
      const status = statusMap[order.status] || order.status;
      const patience = order.status === "waiting" ? ` | 耐心:${Math.ceil(order.patienceRemaining)}s` : "";

      text.setText(`${goods}(${traits}) → ${order.order.recipient}\n[${status}]${patience}`);

      if (order.arrived && order.status === "waiting" && this.shiftState.currentOrderIndex === null) {
        this.shiftState = startProcessing(this.shiftState, i);
      }
    });

    this.shiftState.birds.forEach((bird, i) => {
      const birdData = level.birds[i];
      if (!birdData || !this.birdTexts[i]) return;

      const statusMap: Record<string, string> = { idle: "空闲", flying: "飞行中", returning: "返航中" };
      this.birdTexts[i].setText(
        `${birdData.name}\n${statusMap[bird.status] || bird.status}${bird.status !== "idle" ? " " + Math.ceil(bird.timeRemaining) + "s" : ""}`
      );
    });
  }

  private formatProps(mat: { waterproof: number; shockproof: number; lightproof: number; breathability: number; weight: number }): string {
    return `防水${mat.waterproof} 防震${mat.shockproof}\n遮光${mat.lightproof} 透气${mat.breathability}\n重量${mat.weight}`;
  }
}