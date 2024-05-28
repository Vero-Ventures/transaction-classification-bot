import prisma from './db';
import { PrismaClient } from '@prisma/client';
import mockedEnv from 'mocked-env';

describe('Prisma client setup', () => {
  it('initializes prisma for production environment', () => {
    const restore = mockedEnv({
      NODE_ENV: 'production',
    });

    expect(prisma).toBeInstanceOf(PrismaClient);
    restore();
  });

  it('exports prisma correctly for non-production environment', () => {
    const restore = mockedEnv({
      NODE_ENV: 'development',
    });

    expect(prisma).toEqual(global.prisma);
    restore();
  });
});
