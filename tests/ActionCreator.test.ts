import ActionCreator from '../src/ActionCreator';

test('Camelize string', () => {
  expect(ActionCreator.toUnderscoreUpperCase('pageA')).toBe('PAGE_A');
});

test('Capitalise', () => {
  expect(ActionCreator.capitalise('pageA')).toBe('PageA');
});

test('generate Action and its creator', () => {
  const result = ActionCreator.createActionElements('PAGE_A', 'actionName', 'success');
  expect(result.PREFIX_ACTION_TYPE).toBe('PAGE_A/ACTION_NAME_SUCCESS');
});

test('Camelise action names', () => {
  expect(ActionCreator.normaliseOptions('pageA', [
    'sync-action-A',
    'sync-Action_b',
    'Sync actionC',
    'syncActionD',
  ])).toEqual({
    prefix: 'PAGE_A',
    actions: ['sync-action-A', 'sync-Action_b', 'Sync actionC', 'syncActionD'],
  });
});
