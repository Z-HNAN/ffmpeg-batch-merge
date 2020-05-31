/**
 * 批量执行任务
 */

// 并发数2
const ConcurrentSize = 2;

export type taskType<T> = {
  done: boolean;
  success: boolean;
  errorInfo: string;
  payload: T;
};

class BatchPerfromer<T> {
  // 当前获得的任务
  tasks: taskType<T>[];

  // 当前未执行的任务
  undoTasks: taskType<T>[];

  // 当前执行的任务回调
  callback: (value: T) => Promise<any>;

  // 当前batcher执行完任务
  resolve: (value?: any) => void;

  // 当前执行的任务
  performWorks: Promise<any>[];

  constructor(tasks: T[], callback: (value: T) => Promise<any>) {
    this.tasks = tasks.map((t) => ({ done: false, success: true, errorInfo: '', payload: t }));
    this.undoTasks = [...this.tasks];
    this.callback = callback;
    this.performWorks = [];
  }

  // 当前是否可以继续放任务
  shouldPerform(): boolean {
    return this.performWorks.length < ConcurrentSize;
  }

  // 启动任务
  async exec(): Promise<any> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.beginWork();
    });
  }

  // 开始批量操作
  async beginWork(): Promise<any> {
    // 出口条件,没有剩余的任务,并且所有任务已经done
    if (this.undoTasks.length <= 0 && this.tasks.every((t) => t.done === true)) {
      this.resolve();
    }

    // 放入任务
    while (this.shouldPerform() === true && this.undoTasks.length > 0) {
      const nextTask = this.undoTasks.shift();
      this.performWork(nextTask);
    }
  }

  // 开始执行任务
  async performWork(task: taskType<T>): Promise<any> {
    // 当前任务压入队列
    const performPromise = this.callback(task.payload);
    this.performWorks.push(performPromise);

    try {
      // 执行任务
      await performPromise;
      // success
      task.success = true;
      task.errorInfo = '';
    } catch (error) {
      // error
      task.success = false;
      task.errorInfo = error;
    } finally {
      task.done = true;
      // 去除该元素
      const currentPromiseIdx = this.performWorks.findIndex((p) => p === performPromise);
      this.performWorks = [
        ...this.performWorks.slice(0, currentPromiseIdx),
        ...this.performWorks.slice(currentPromiseIdx + 1),
      ];
      // 标志此任务完成
      this.beginWork();
    }
  }
}

// 向外界暴露单个方法
async function batchPerform<T>(
  tasks: T[],
  callback: (value: T) => Promise<any>,
): Promise<taskType<T>[]> {
  // 初始化
  const batchPerfromer = new BatchPerfromer<T>(tasks, callback);

  // 执行批量操作
  await batchPerfromer.exec();

  // 返回操作结果
  return batchPerfromer.tasks;
}

export default batchPerform;
