export const customsData = [
  {
    name: 'Pepperoni',
    price: 100,
    category: 'pizza',
    compounds: 'tomato sauce, cheese, pepperoni',
  },
  {
    name: 'Cheeseburger',
    price: 40,
    category: 'burger',
    compounds: 'bun, cheese, meat, tomato, cucumber, onion, ketchup, mustard',
  },
  {
    name: 'Coca Cola',
    price: 20,
    category: 'drink',
    compounds: 'coca cola',
  },
];

export interface ICustom {
  id: number;
  name: string;
  price: number;
  category: string;
  compounds: string;
}

export function isICustom(object: any): object is ICustom {
  return (
    'id' in object &&
    'name' in object &&
    'category' in object &&
    'compounds' in object
  );
}
