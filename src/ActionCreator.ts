// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { camelize, decamelize } from 'humps';

// ActionCreator类构造函数参数类型
export type ConstructorParams<T> = {
  prefix: string;
  actions: T[];
};

// ActionCreateor类配置
type NormalisedOptions = {
  prefix: string;
  actions: string[];
};

// action返回类型
export type Action = {
  type: string;
  payload: any;
};

// ActionCreator类型
type ActionCreatorFN = (payload?: any) => Action;

// ActionElement
type ActionElement = {
  PREFIX_ACTION_TYPE: string;
  actionCreator: ActionCreatorFN;
};

export default class ActionCreator<T extends string> {
  // async suffix
  protected asyncSuffixes: string[];

  // ActionCreator Config
  private $$normalisedOptions: NormalisedOptions;

  /**
   * Transform string to String.
   */
  static capitalise(string: string): string {
    return string[0].toUpperCase() + string.slice(1);
  }

  /**
   * Create ACTION_TYPE, PREFIX/ACTION_TYPE and action creator.
   */
  static createActionElements(prefix: string, actionName: string, suffix: string): ActionElement {
    /* PREFIX, actionName, suffix => PREFIX/ACTION_NAME_SUFFIX. */
    let ACTION_TYPE = ActionCreator.toUnderscoreUpperCase(actionName);

    /* Append suffix to TYPE. */
    if (suffix) {
      const SUFFIX = ActionCreator.toUnderscoreUpperCase(suffix);
      ACTION_TYPE = `${ACTION_TYPE}_${SUFFIX}`;
    }

    const PREFIX_ACTION_TYPE = `${prefix}/${ACTION_TYPE}`;

    return {
      PREFIX_ACTION_TYPE,
      actionCreator: (payload): Action => ({
        type: PREFIX_ACTION_TYPE,
        payload,
      }),
    };
  }

  /**
   * Process fault tolarent prefix and actions.
   */
  static normaliseOptions(prefix: string, actions: string[]): NormalisedOptions {
    return {
      /* Prefix takes the form of SOME_PREFIX. */
      prefix: ActionCreator.toUnderscoreUpperCase(prefix),
      /* Actions takes the form of someActions. */
      // actions: actions.map((action) => camelize(action)),
      /* Action保留原样不做改变 */
      actions,
    };
  }

  /**
   * Transform string from actionName to ACTION_NAME.
   */
  static toUnderscoreUpperCase(string: string): string {
    return decamelize(string, { separator: '_' }).toUpperCase();
  }

  constructor(options: ConstructorParams<T>) {
    const { prefix, actions } = options;

    this.asyncSuffixes = [];

    this.$$normalisedOptions = ActionCreator.normaliseOptions(prefix, actions);
  }

  protected bindInstanceWithActions(): void {
    const { prefix, actions } = this.$$normalisedOptions;

    actions.forEach((action) => {
      const {
        PREFIX_ACTION_TYPE,
        actionCreator,
      } = ActionCreator.createActionElements(prefix, action, undefined);

      this.bindSyncAction(action, PREFIX_ACTION_TYPE, actionCreator);

      this.bindAsyncActions(prefix, action);
    });
  }

  /**
   * Bind sync action creator and action type on instance.
   */
  // eslint-disable-next-line max-len
  private bindSyncAction(action: string, PREFIX_ACTION_TYPE: string, actionCreator: ActionCreatorFN): void {
    /* Expose action creator on lower-cased property. */
    this[action] = actionCreator;
    /* Expose action type on TYPE property. */
    this[action].TYPE = PREFIX_ACTION_TYPE;
  }

  /* Bind bind async actions (i.e. success, failure) for an sync action. */
  private bindAsyncActions(prefix: string, action: string): void {
    this.asyncSuffixes.forEach((suffix) => {
      const {
        PREFIX_ACTION_TYPE: PREFIX_ASYNC_ACTION_TYPE,
        actionCreator: asyncActionCreator,
      } = ActionCreator.createActionElements(prefix, action, suffix);

      this.bindAsyncAction(action, suffix, PREFIX_ASYNC_ACTION_TYPE, asyncActionCreator);
    });
  }

  /**
   * Bind async action creator and action type on instance.
   * i.e. someActionSuccess, PREFIX/SOME_ACTION_SUCCESS.
   */
  // eslint-disable-next-line max-len
  private bindAsyncAction(action: string, suffix: string, PREFIX_ASYNC_ACTION_TYPE: string, asyncActionCreator: ActionCreatorFN): void {
    const SUFFIX = suffix.toUpperCase();

    /* Expose action creator on lower-cased property. */
    this[action][suffix] = asyncActionCreator;
    /* Expose action type on upper-cased property. */
    this[action][SUFFIX] = PREFIX_ASYNC_ACTION_TYPE;
  }
}
