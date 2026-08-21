import Phaser from "phaser";
import { Button } from "../ui/Button";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "Menu" });
  }

  create(): void {
    this.add.text(640, 200, "风邮局", {
      fontSize: "64px",
      color: "#5c4a32",
      fontFamily: "serif",
    }).setOrigin(0.5);

    this.add.text(640, 280, "山顶邮局的奇幻旅程", {
      fontSize: "20px",
      color: "#8b7355",
      fontFamily: "serif",
    }).setOrigin(0.5);

    new Button(this, 640, 420, "开始游戏", () => {
      this.scene.start("LevelSelect");
    });
  }
}