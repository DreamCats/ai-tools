export class MessageUpdateManager {
  private content: string = '';
  private updateTimeout: NodeJS.Timeout | null = null;
  private readonly batchDelay: number = 32; // 降低到约2帧的时间
  private readonly maxBatchSize: number = 50; // 减小批量大小以提高更新频率
  private lastUpdateTime: number = 0;
  private readonly minUpdateInterval: number = 16; // 最小更新间隔（1帧）

  constructor(private onUpdate: (content: string) => void) {}

  append(chunk: string) {
    this.content += chunk;
    
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;

    // 如果内容长度超过最大批量大小或距离上次更新时间超过最小间隔，立即更新
    if (this.content.length >= this.maxBatchSize || timeSinceLastUpdate >= this.minUpdateInterval) {
      this.flush();
    } else {
      this.scheduleUpdate();
    }
  }

  private scheduleUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  private flush() {
    if (this.content) {
      this.lastUpdateTime = Date.now();
      this.onUpdate(this.content);
      this.content = '';
    }
  }

  reset() {
    this.content = '';
    this.lastUpdateTime = 0;
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
    }
  }
} 