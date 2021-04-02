import { _decorator, Component, Node, Prefab, instantiate, Vec2, Vec3, UITransform, director, math, Label } from 'cc';
const { ccclass, property } = _decorator;

import { Game_Status } from './constants/Status';
import { Block as BlockCtrl } from './Block';
import { Player } from './Player';

@ccclass('Game')
export class Game extends Component {
  @property({ type: Prefab, tooltip: '障碍物' })
  block: Prefab = null!;
  @property({ type: Node, tooltip: '地面' })
  ground: Node = null!;
  @property({ type: Node, tooltip: '玩家' })
  player: Node = null!;
  @property({ type: Label, tooltip: '分数' })
  score: Label = null!;
  @property({ type: Node, tooltip: '结果' })
  result: Node = null!;

  private len: number = 10;
  private blocks: Node[] = [];
  private moveSpeed: number = 5;
  private blockSize: math.Size = null!;
  private groundPos: Vec3 = null!;
  private groundSize: Readonly<math.Size> = null!;
  private status: Game_Status = Game_Status.Init;
  private _score: number = 0;

  onLoad() {
    this.groundPos = this.ground.getPosition();
    this.groundSize = this.ground.getComponent(UITransform)!.contentSize;

    this.initBlock();

    this.player.on('onGameOver', () => {
      console.log('游戏结束');
      this.status = Game_Status.Ended;
      this.result.active = true;
    });
  }

  start() {
    // [3]
  }

  reset() {
    this._score = 0;
    this.status = Game_Status.Init;
    this.score.string = '分数：0';
    this.result.active = false;

    this.player.getComponent(Player)?.onLoad();
    this.initBlock();
  }

  // 随机生成正负号
  generateSign() {
    return Math.random() > 0.5 ? 1 : -1;
  }

  generatePostion(prePos: Vec3) {
    const winSize = this.node.getComponent(UITransform)?.contentSize!;
    const random = Math.random() * 3 + 2.5;
    const randomY = Math.random() * 3 + 2;
    const intervalX = this.blockSize.width * random;
    const intervalY = this.blockSize.height * randomY * this.generateSign();
    const x = prePos.x + intervalX;
    let y = Math.max(prePos.y + intervalY, this.groundPos.y);
    y = Math.min(y, winSize.height / 2);

    // console.log('intervalY:', prePos.y, intervalY, winSize.height / 2);
    console.log('x,y', x, y);
    return new Vec3(x, y, 0);
  }

  initBlock() {
    // 移除先前的节点
    this.blocks.forEach((node) => this.node.removeChild(node));
    this.blocks = [];

    for (let i = 0; i < this.len; i++) {
      const block = instantiate(this.block);
      this.blockSize = block.getComponent(UITransform)!.contentSize;
      const lastBlock = this.blocks[this.blocks.length - 1];
      const pos = this.generatePostion(lastBlock?.getPosition() || new Vec3(0, 0, 0));

      block.setPosition(pos);
      this.blocks.push(block);
      this.node.addChild(block);
    }
  }

  // 更新移动个位置
  updatePosition() {
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const pos = block.getPosition();

      block.setPosition(new Vec3(pos.x - this.moveSpeed, pos.y, pos.z));
      this.loopBlock(block, i);
    }
  }

  loopBlock(block: Node, index: number) {
    const pos = block.getPosition();
    const blockSize = block.getComponent(UITransform)?.contentSize!;
    const winSize = this.node.getComponent(UITransform)?.contentSize!;

    if (pos.x < -(winSize.width / 2 + blockSize.width)) {
      //   console.log('loopBlock:', index, block, '不见了');
      this.blocks.splice(index, 1);

      const lastBlock = this.blocks[this.blocks.length - 1];
      const lastPos = lastBlock.getPosition();
      const pos = this.generatePostion(lastPos);

      block.setPosition(pos);
      this.blocks.push(block);
      // 获得分数
      this.gainScore();
    }
  }

  gainScore() {
    this.score.string = `分数：${this._score}`;
    this._score += 1;
  }

  update(deltaTime: number) {
    if (this.status === Game_Status.Ended) return;
    this.updatePosition();
  }
}
