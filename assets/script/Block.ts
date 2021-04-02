import { _decorator, Component, Node, color, Collider2D, Contact2DType, Sprite } from 'cc';
const { ccclass, property } = _decorator;

const red = color(218, 25, 25, 255);
const defaultColor = color(31, 197, 204, 255);

@ccclass('Block')
export class Block extends Component {
  private timer: number = null!;

  onLoad() {
    const collider = this.getComponent(Collider2D);
    collider?.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    collider?.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  onBeginContact() {
    const _sprit = this.node.getComponent(Sprite)!;

    this.timer && clearTimeout(this.timer);
    this.node.emit('onGameOver');
    _sprit.color = red;
  }

  onEndContact() {
    const _sprit = this.node.getComponent(Sprite)!;

    this.timer = setTimeout(() => {
      _sprit.color = defaultColor;
    }, 300);
  }

  start() {
    // [3]
  }
}
