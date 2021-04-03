import {
  _decorator,
  Component,
  Node,
  Contact2DType,
  systemEvent,
  SystemEventType,
  Collider2D,
  RigidBody2D,
  PhysicsSystem2D,
  Vec2,
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
  private canJump: boolean = false;
  private speed: number = 26;

  onLoad() {
    // 调整重力
    const grivity = PhysicsSystem2D.instance.gravity;
    PhysicsSystem2D.instance.gravity = new Vec2(grivity.x, -300);

    systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
    systemEvent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this);

    const collider = this.getComponent(Collider2D);

    collider?.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
  }

  // 碰撞开始
  onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
    if (otherCollider.node.name !== 'ceiling') {
      systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this);
      systemEvent.off(SystemEventType.TOUCH_END, this.onTouchEnd, this);

      this.node.emit('onGameOver');
      this.canJump = true;
    }
  }

  // 点击开始
  onTouchStart() {
    // if (this.canJump) {
    // 调整重力
    const grivity = PhysicsSystem2D.instance.gravity;
    PhysicsSystem2D.instance.gravity = new Vec2(grivity.x, -2000);

    const rb = this.getComponent(RigidBody2D);
    const lv = rb!.linearVelocity;

    this.canJump = false;
    lv.y = this.speed * -Math.sign(grivity.y);
    rb!.linearVelocity = lv;
    console.log('onTouchStart:', lv, PhysicsSystem2D.instance.gravity);
    // }
  }

  onTouchEnd() {
    // 调整重力
    const grivity = PhysicsSystem2D.instance.gravity;
    // 调整重力
    PhysicsSystem2D.instance.gravity = new Vec2(grivity.x, -2500);

    console.log('onTouchEnd:', this.canJump, PhysicsSystem2D.instance.gravity);
  }

  start() {}

  //   update(deltaTime: number) {}
}
