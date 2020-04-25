import ActionCreator, { Action, ConstructorParams } from './ActionCreator';

// 同步类型的Action
type SyncAction = {
  (payload?: any): Action;
  TYPE: string;
};

/* Sync actions */
class Sync<T extends string> extends ActionCreator<T> {
  constructor(options: ConstructorParams<T>) {
    super(options);

    this.bindInstanceWithActions();
  }
}

export default function syncCreator<T extends string>(
  config: ConstructorParams<T>,
): Record<T, SyncAction> {
  return new Sync(config) as any;
}
