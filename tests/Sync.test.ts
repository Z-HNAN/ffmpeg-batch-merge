import syncCreator from '../src/Sync';

test('Create synchronise actions and action types', () => {
  const action = syncCreator({
    prefix: 'pageA',
    actions: [
      'sync-action-A',
      'syncActionB',
    ],
  });


  expect(action).toHaveProperty('sync-action-A');
  expect(action).toHaveProperty('syncActionB');

  expect(action.syncActionB).toHaveProperty('TYPE');

  expect(action.syncActionB.TYPE).toEqual('PAGE_A/SYNC_ACTION_B');
});
