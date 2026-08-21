import Phaser from "phaser";
import { Button } from "../ui/Button";

export class RouteScene extends Phaser.Scene {
  constructor() {
    super({ key: "Route" });
  }

  create(): void {
    this.add.text(640, 100, "路线规划", {
      fontSize: "36px",
      color: "#5c4a32",
      fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 220, "（占位）选择邮鸟和投递路线", {
      fontSize: "20px",
      color: "#8b7355",
      fontFamily: "serif",
    }).setOrigin(0.5);

    new Button(this, 640, 400, "选择路线", () => {
      this.scene.start("Result", {
        safe: true,
        onTime: true,
        clever: true,
        failReasons: [],
      });
    });

    new Button(this, 640, 520, "返回包装", () => {
      this.scene.start("PostOffice", { levelId: 1 });
    });
  }
}