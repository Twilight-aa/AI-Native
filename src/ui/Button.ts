import Phaser from "phaser";

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    width = 200,
    height = 60,
  ) {
    super(scene, x, y);

    this.bg = scene.add.rectangle(0, 0, width, height, 0x8b7355, 0.9)
      .setStrokeStyle(2, 0x5c4a32)
      .setInteractive({ useHandCursor: true });

    this.label = scene.add.text(0, 0, text, {
      fontSize: "24px",
      color: "#ffffff",
      fontFamily: "serif",
    }).setOrigin(0.5);

    this.add([this.bg, this.label]);

    this.bg.on("pointerover", () => {
      this.bg.setFillStyle(0xa0895c);
    });
    this.bg.on("pointerout", () => {
      this.bg.setFillStyle(0x8b7355, 0.9);
    });
    this.bg.on("pointerdown", onClick);

    this.setSize(width, height);
    scene.add.existing(this);
  }
}