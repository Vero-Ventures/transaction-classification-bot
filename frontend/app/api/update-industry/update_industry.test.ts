import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

import { POST } from './route';

// Mock getServerSession from next-auth
import * as nextAuth from 'next-auth';
jest.mock('next-auth');

describe('POST function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if session is not available', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const response = await POST({} as any);

    expect(getServerSession).toHaveBeenCalled();
    expect(response.status).toBe(401);
    const responseBody = await response.text();
    expect(responseBody).toEqual(JSON.stringify({ message: 'Unauthorized' }));
  });
});
