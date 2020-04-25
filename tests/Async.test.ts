import asyncCreator from '../src/Async';

test('Create asynchronise actions and action types', () => {
  const action = asyncCreator({
    prefix: 'pageA',
    actions: [
      'async-action-A',
      'asyncActionB',
    ],
  });

  expect(action).toHaveProperty('async-action-A');
  expect(action).toHaveProperty('asyncActionB');

  expect(action.asyncActionB).toHaveProperty('TYPE');
  expect(action.asyncActionB).toHaveProperty('success');
  expect(action.asyncActionB).toHaveProperty('failure');
  expect(action.asyncActionB.TYPE).toEqual('PAGE_A/ASYNC_ACTION_B');
  expect(action.asyncActionB.SUCCESS).toEqual('PAGE_A/ASYNC_ACTION_B_SUCCESS');
  expect(action.asyncActionB.FAILURE).toEqual('PAGE_A/ASYNC_ACTION_B_FAILURE');
});
