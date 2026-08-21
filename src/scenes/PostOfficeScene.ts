import Phaser from "phaser";
import { Button } from "../ui/Button";

export class PostOfficeScene extends Phaser.Scene {
  constructor() {
    super({ key: "PostOffice" });
  }

  create(): void {
    this.add.text(640, 100, "邮局 — 包装阶段", {
      fontSize: "36px",
      color: "#5c4a32",
      fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 220, "（占位）选择容器、外层和填充材料", {
      fontSize: "20px",
      color: "#8b7355",
      fontFamily: "serif",
    }).setOrigin(0.5);

    new Button(this, 640, 400, "确认发件", () => {
      this.scene.start("Route", { levelId: 1, packing: { container: "纸盒", outer: null, filling: null, totalWeight: 2 } });
    });

    new Button(this, 640, 520, "返回选关", () => {
      this.scene.start("LevelSelect");
    });
  }
}