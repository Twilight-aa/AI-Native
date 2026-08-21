import Phaser from "phaser";
import { Button } from "../ui/Button";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: "Result" });
  }

  create(): void {
    this.add.text(640, 100, "运输结算", {
      fontSize: "36px",
      color: "#5c4a32",
      fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 220, "（占位）包裹完好抵达！", {
      fontSize: "20px",
      color: "#8b7355",
      fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 280, "安全星 ✓  准时星 ✓  巧思星 ✓", {
      fontSize: "18px",
      color: "#5c4a32",
      fontFamily: "serif",
    }).setOrigin(0.5);

    new Button(this, 480, 450, "重试", () => {
      this.scene.start("PostOffice", { levelId: 1 });
    });

    new Button(this, 800, 450, "下一关", () => {
      this.scene.start("LevelSelect");
    });

    new Button(this, 640, 560, "返回选关", () => {
      this.scene.start("LevelSelect");
    }, 160, 50);
  }
}