import ActionCreator, { Action, ConstructorParams } from './ActionCreator';

// 异步类型的Action
type AsyncAction = {
  (payload?: any): Action;
  success: (payload?: any) => Action;
  failure: (payload?: any) => Action;
  TYPE: string;
  SUCCESS: string;
  FAILURE: string;
}

/* Sync actions */
class Async<T extends string> extends ActionCreator<T> {
  constructor(options: ConstructorParams<T>) {
    super(options);

    this.asyncSuffixes = ['success', 'failure'];

    this.bindInstanceWithActions();
  }
}

export default function asyncCreator<T extends string>(
  config: ConstructorParams<T>,
): Record<T, AsyncAction> {
  return new Async(config) as any;
}
