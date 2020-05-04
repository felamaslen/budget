import isValid from 'date-fns/isValid';

function validateString(value: string): void {
  if (!value.length) {
    throw new Error('Required');
  }
}
function validateDate(value: Date): void {
  if (!(value instanceof Date && isValid(value))) {
    throw new Error('Must be a valid date');
  }
}
function validateCost(value: number | null | undefined): void {
  if (typeof value === 'undefined' || value === null) {
    throw new Error('Must be a number');
  }
}

export function validateField(
  item: 'item' | 'category' | 'holiday' | 'social' | 'shop',
  value?: string,
): void;
export function validateField(item: 'date', value?: Date): void;
export function validateField(item: 'cost', value?: number | null | undefined): void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateField(item: string, value?: any): void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateField(item: string, value?: any): void {
  if (['item', 'category', 'holiday', 'social', 'shop'].includes(item)) {
    validateString(value);
  } else if (item === 'date') {
    validateDate(value);
  } else if (item === 'cost') {
    validateCost(value);
  }
}
