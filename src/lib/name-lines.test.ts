import { expect, test } from 'vitest';
import { nameLines } from './name-lines';

test('balances a long name over two lines', () => {
  expect(nameLines('Tiago Luiz Seuaciuc de Poli')).toEqual(['Tiago Luiz', 'Seuaciuc de Poli']);
  expect(nameLines('Tiago Luiz Poli')).toEqual(['Tiago', 'Luiz Poli']);
});

test('keeps a single word on one line', () => {
  expect(nameLines('Tiago')).toEqual(['Tiago', '']);
});
