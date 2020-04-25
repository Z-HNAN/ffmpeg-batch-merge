# create-redux-action

## 安装

```sh
yarn add create-redux-action
// or
npm install --save create-redux-action
```

## 使用方式


### 命名方式

action最好使用驼峰命名法,书写为`fetchBooks`,并且借助ts的类型提示自动补全。

### Sync

Create a synchronous action to change visibility filter.

```typescript
// action.ts
import { syncCreator } from 'create-redux-action';

export const sync = syncCreator({
  /* Create a name space. */
  prefix: 'users',
  /* Create a synchronous action. */
  actions: ['setVisibilityFilter'],
});

// container.ts
import { sync } from './action.ts';

const {
  /**
   * Signature:
   * (payload) => ({ type: 'USERS/SET_VISIBILITY_FILTER', payload })
   */
  setVisibilityFilter,
} = sync;

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    /**
     * Dispatch an action to update visibility filter as seller.
     * i.e. payload = { role: 'seller' }
     */
    onVisibilityFilterSet: (payload) => {
      dispatch(setVisibilityFilter(payload));
    },
  };
};

// reducer.js
import { sync } from './action.ts';

const { setVisibilityFilter } = sync;

const initialState = {
  users: [{
    id: '1',
    name: 'Alice',
    role: 'admin',
  }, {
    id: '2',
    name: 'Bill',
    role: 'seller',
  }],
  visibilityFilter: '',
};

export default function Reducer(state=initialState, action) {
  switch(action.type) {
    /**
     * Each synchronous action has a property TYPE equal to action name.
     * setVisibilityFilter.TYPE = 'USERS/SET_VISIBILITY_FILTER'
     */
    case setVisibilityFilter.TYPE:
      return {
        ...state,
        visibilityFilter: action.payload.role,
      };
    default:
      return state;
  }
}

```

### Async

```typescript
// action.ts
import { asyncCreator } from 'create-redux-action';

export const async = asyncCreator({
  prefix: 'users',
  /**
   * Create an asynchronous action.
   * Delete a user from redux store only if that user has been deleted from database.
   */
  actions: ['deleteUser'],
});

// container.ts
import { async } from './action.js';

const {
  /**
   * Signature:
   * (payload) => ({ type: 'USERS/DELETE_USER', payload })
   */
  deleteUser,
} = async;

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    /**
     * Dispatch an action to delete a user by user id.
     * i.e. payload = { id: '2' }
     */
    onUserDelete: (payload) => {
      dispatch(deleteUser(payload));
    },
  };
};

// reducer.ts
import { async } from './action.js';

const { deleteUser } = async;

const initialState = {
  users: [{
    id: '1',
    name: 'Alice',
    role: 'admin',
  }, {
    id: '2',
    name: 'Bill',
    role: 'seller',
  }],
  /* API request status. */
  isLoading: false,
};

export default function Reducer(state=initialState, action) {
  switch(action.type) {
    /**
     * Each asynchronous action has a property TYPE equal to action name.
     * deleteUser.TYPE = 'USERS/DELETE_USER'
     */
    case deleteUser.TYPE:
      return {
        ...state,
        /* Toggle API request status. */
        isLoading: true,
      };
    /**
     * Each asynchronous action has a property SUCCESS.
     * deleteUser.TYPE = 'USERS/DELETE_USER_SUCCESS'
     */
    case deleteUser.SUCCESS:
      /* Delete user by user id. */
      const id = action.payload.id;

      return {
        ...state,
        users: state.users.filter((user) => user.id !== id),
        /* Toggle API request status. */
        isLoading: false,
      };
    /**
     * Each asynchronous action has a property FAILURE.
     * deleteUser.TYPE = 'USERS/DELETE_USER_FAILURE'
     */
    case deleteUser.FAILURE:
      return {
        ...state,
        /* Toggle API request status. */
        isLoading: false,
      };
    default:
      return state;
  }
}

// saga.js
import { put, takeLatest } from 'redux-saga/effects';
import { async } from './action.ts';

const { deleteUser } = async;

function* deleteUserById(action) {
  try {
    /* ...AJAX */

    /* User id to delete from redux store. */
    const id = action.payload.id;

    /**
     * Each asynchronous action has a success action.
     * Signature:
     * (payload) => ({ type: 'USERS/DELETE_USER_SUCCESS', payload })
     * Dispatch success action.
     */
    yield put(deleteUser.success({ id }));
  } catch(err) {}
    /**
     * Each asynchronous action has a failure action.
     * Signature:
     * (payload) => ({ type: 'USERS/DELETE_USER_FAILURE', payload })
     * Dispatch failure action.
     */
    yield put(deleteUser.failure(err));
}

export default function* () {
  yield takeLatest(deleteUser.TYPE, deleteUserById);
}
```

## 感谢

项目改进自于[https://github.com/marcosun/redux-action-boilerplate.git](https://github.com/marcosun/redux-action-boilerplate.git)

- 使用`typescript`改写项目
- 由之前的构造函数方式，改进为函数创建的方式
- 去除过时的API