export const dumpUser = {
  name: 'alex',
  email: 'activated@gmail.com',
  role: 'user',
  password: '12345678',
  passwordConfirm: '12345678',
  active: true,
  activated: true,
};

export const dumpNotActivatedUser = {
  name: 'alex',
  email: 'notactivated@gmail.com',
  role: 'user',
  password: '12345678',
  passwordConfirm: '12345678',
  active: true,
  activated: false,
};

export const dumpDeletedUser = {
  name: 'alex',
  email: 'deactivated@gmail.com',
  role: 'user',
  password: '12345678',
  passwordConfirm: '12345678',
  active: false,
  activated: true,
};

export const dumpAdmin = {
  name: 'alex',
  email: 'admin@gmail.com',
  role: 'admin',
  password: '12345678',
  passwordConfirm: '12345678',
  active: true,
  activated: true,
};

export interface IUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

export function isIUser(object: any): object is IUser {
  return (
    'id' in object &&
    'name' in object &&
    'email' in object &&
    'role' in object &&
    'createdAt' in object
  );
}
