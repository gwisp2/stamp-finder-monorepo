import { ANY, NumberRange, SearchOptions } from 'model';
import { Item } from 'state/api/shops';
import { decodeStamps, RawStamp, Stamp } from 'state/api/stamps';

const createStamp = (data: Partial<RawStamp> & { id?: number }): Stamp => {
  const id = data.id ?? 1;
  return decodeStamps('', {
    [id]: {
      name: '',
      year: 2022,
      page: '',
      image: null,
      value: null,
      categories: [],
      ...data,
    },
  })[id];
};

const createShopItem = (data: Partial<Item>): Item => {
  return {
    name: 'Hello',
    amount: 1,
    shopId: 'shop1',
    stampIds: [1],
    ...data,
  };
};

test('Default options match any recent stamps', () => {
  expect(SearchOptions.Default.matches(createStamp({ year: 2022 }), [])).toBe(true);
});

test('Contains constraint is checked', () => {
  const options = SearchOptions.Default.applyChange({ contains: '1' });
  expect(options.matches(createStamp({ id: 4, name: 'c' }), [])).toBe(false);
  expect(options.matches(createStamp({ id: 4, name: '1' }), [])).toBe(true);
  expect(options.matches(createStamp({ id: 210, name: 'X' }), [])).toBe(true);
});

test('Value constraint is checked', () => {
  const options = SearchOptions.Default.applyChange({ value: NumberRange.exact(4) });
  expect(options.matches(createStamp({ value: 4 }), [])).toBe(true);
  expect(options.matches(createStamp({ value: 5 }), [])).toBe(false);

  const options2 = SearchOptions.Default.applyChange({ value: NumberRange.between(4, 6) });
  expect(options2.matches(createStamp({ value: 4 }), [])).toBe(true);
  expect(options2.matches(createStamp({ value: 5 }), [])).toBe(true);
  expect(options2.matches(createStamp({ value: 6 }), [])).toBe(true);
  expect(options2.matches(createStamp({ value: 7 }), [])).toBe(false);
});

test('Category constraint is checked', () => {
  const options = SearchOptions.Default.applyChange({ category: 'test' });
  expect(options.matches(createStamp({ categories: ['hello'] }), [])).toBe(false);
  expect(options.matches(createStamp({ categories: ['hello', 'test'] }), [])).toBe(true);
  expect(options.matches(createStamp({ categories: ['test'] }), [])).toBe(true);
});

test('Presence constraint is checked', () => {
  const options = SearchOptions.Default.applyChange({ presenceRequired: ANY });
  expect(options.matches(createStamp({}), [])).toBe(false);
  expect(options.matches(createStamp({}), [createShopItem({})])).toBe(true);
  const options2 = SearchOptions.Default.applyChange({ presenceRequired: ['shop2'] });
  expect(options2.matches(createStamp({}), [])).toBe(false);
  expect(options2.matches(createStamp({}), [createShopItem({ shopId: 'shop1' })])).toBe(false);
  expect(
    options2.matches(createStamp({}), [createShopItem({ shopId: 'shop1' }), createShopItem({ shopId: 'shop2' })]),
  ).toBe(true);
});
