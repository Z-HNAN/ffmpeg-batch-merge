import hello from '../src/index';

test('test hello function', () => {
  expect(hello('world')).toBe('hello world');
});
