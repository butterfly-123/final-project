import { cache } from 'react';
import { sql } from './connect';

export type UserWithPasswordHash = {
  id: number;
  userName: string;
  email: string;
  passwordHash: string;
};

export type User = {
  id: number;
  userName: string;
};

export const getUsersWithPasswordHashByUserName = cache(
  async (userName: string) => {
    const [user] = await sql<UserWithPasswordHash[]>`
    SELECT * FROM users WHERE users.username = ${userName}
 `;
    return user;
  },
);

// export const getUsersById = cache(async (id: number) => {
//   const [user] = await sql<User[]>`
//     SELECT id, username FROM users WHERE users.id = ${id}
//  `;
//   return user;
// });

export const getUsersByUserName = cache(async (userName: string) => {
  const [user] = await sql<User[]>`
    SELECT id, username FROM users WHERE users.username = ${userName.toLowerCase()}
 `;
  return user;
});

export const createUser = cache(
  async (userName: string, email: string, passwordHash: string) => {
    const [user] = await sql<User[]>`
    INSERT INTO users (username, email, password_hash) VALUES(${userName.toLowerCase()}, ${email}, ${passwordHash}) RETURNING id, username
 `;
    return user;
  },
);
