import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  avatar?: string;
}

/**
 * Creates a mock user with optional overrides
 */
export function createUser(overrides: Partial<User> = {}): User {
  const firstName = overrides.firstName || faker.person.firstName();
  const lastName = overrides.lastName || faker.person.lastName();
  
  return {
    id: faker.string.uuid(),
    username: faker.internet.userName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    firstName,
    lastName,
    roles: ['USER'],
    permissions: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    lastLogin: faker.date.recent(),
    isActive: true,
    avatar: faker.image.avatar(),
    ...overrides,
  };
}

/**
 * Creates an admin user
 */
export function createAdminUser(overrides: Partial<User> = {}): User {
  return createUser({
    roles: ['USER', 'ADMIN'],
    permissions: ['*'],
    ...overrides,
  });
}

/**
 * Creates a guest user
 */
export function createGuestUser(overrides: Partial<User> = {}): User {
  return createUser({
    roles: ['GUEST'],
    permissions: ['read:public'],
    ...overrides,
  });
}

/**
 * Creates multiple users
 */
export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}

/**
 * Creates a user with specific roles
 */
export function createUserWithRoles(roles: string[], overrides: Partial<User> = {}): User {
  return createUser({
    roles,
    ...overrides,
  });
}