import batchPerform, { taskType } from '../src/batchPerform';

describe('test batchPerform', () => {
  // 初始化
  const payloads = ['p1', 'p2', 'p3'];
  let tasksResolve: taskType<string>[];
  let tasksReject: taskType<string>[];
  let tasksResolveTimeout: taskType<string>[];
  let tasksIndeterminate: taskType<string>[];


  beforeAll(async () => {
    // 全通过
    tasksResolve = await batchPerform<string>(payloads, async (value) => Promise.resolve(value));

    // 全不通过
    tasksReject = await batchPerform<string>(payloads, async (value) => Promise.reject(Error(value)));

    // 全部超时通过
    // eslint-disable-next-line arrow-body-style
    tasksResolveTimeout = await batchPerform<string>(payloads, async (value) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(value);
        }, 100);
      });
    });

    // 不确定执行结果
    tasksIndeterminate = await batchPerform<string>(payloads, async (value) => {
      const now = Date.now();
      if (now % 2 === 0) {
        return value;
      // eslint-disable-next-line no-else-return
      } else {
        throw Error(value);
      }
    });
  });

  test('test length Be 3', () => {
    console.log('=============================');
    console.log(tasksResolve);

    expect(tasksResolve.length).toBe(3);
    expect(tasksReject.length).toBe(3);
    expect(tasksResolveTimeout.length).toBe(3);
    expect(tasksIndeterminate.length).toBe(3);
  });

  test('test tasksIndeterminate to be Done', () => {
    expect(tasksIndeterminate[0].done).toBe(true);
    expect(tasksIndeterminate[1].done).toBe(true);
    expect(tasksIndeterminate[2].done).toBe(true);
  });

  test('test tasksResolveTimeout to be Done', () => {
    expect(tasksResolveTimeout[0].done).toBe(true);
    expect(tasksResolveTimeout[1].done).toBe(true);
    expect(tasksResolveTimeout[2].done).toBe(true);
  });

  test('test tasksResolveTimeout[2] Be Success ', () => {
    expect(tasksResolveTimeout[2]).toEqual({
      done: true,
      errorInfo: '',
      payload: 'p3',
      success: true,
    });
  });

  test('test tasksResolve[2] Be Success ', () => {
    expect(tasksResolve[2]).toEqual({
      done: true,
      errorInfo: '',
      payload: 'p3',
      success: true,
    });
  });

  test('test tasksReject[2] Be Error ', () => {
    expect(tasksReject[2]).toEqual({
      done: true,
      errorInfo: Error('p3'),
      payload: 'p3',
      success: false,
    });
  });
});
