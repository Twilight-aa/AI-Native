import Phaser from "phaser";
import { Button } from "../ui/Button";
import { LEVELS } from "../data/levels";

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: "LevelSelect" });
  }

  create(): void {
    this.add.text(640, 60, "选择关卡", {
      fontSize: "36px",
      color: "#5c4a32",
      fontFamily: "serif",
    }).setOrigin(0.5);

    const cols = 5;
    const spacingX = 200;
    const spacingY = 140;
    const startX = 200;
    const startY = 180;

    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % cols;
      const row = Math.floor((i - 1) / cols);
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      const level = LEVELS.find((l) => l.id === i);
      if (level) {
        new Button(this, x, y, `第 ${i} 关`, () => {
          this.scene.start("Shift", { levelId: i });
        }, 160, 80);
      } else {
        this.add.rectangle(x, y, 160, 80, 0xcccccc, 0.5)
          .setStrokeStyle(2, 0xaaaaaa);
        this.add.text(x, y, `第 ${i} 关`, {
          fontSize: "20px",
          color: "#aaaaaa",
          fontFamily: "serif",
        }).setOrigin(0.5);
      }
    }

    new Button(this, 640, 650, "返回", () => {
      this.scene.start("Menu");
    }, 160, 50);
  }
}