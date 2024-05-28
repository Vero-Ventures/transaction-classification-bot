import { create_qb_object } from '@/actions/qb_client';
import { getServerSession } from 'next-auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('create_qb_object function', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete process.env.CLIENT_ID;
    delete process.env.CLIENT_SECRET;
  });

  it('Should create a QuickBooks client object with valid session', async () => {
    // Mock a valid session
    const mockSession = {
      accessToken: 'mockAccessToken',
      realmId: 'mockRealmId',
      refreshToken: 'mockRefreshToken',
    };
    (
      getServerSession as jest.MockedFunction<typeof getServerSession>
    ).mockResolvedValue(mockSession);

    // Mock environment variables
    process.env.CLIENT_ID = 'mockClientId';
    process.env.CLIENT_SECRET = 'mockClientSecret';

    // Call the function
    const qbo = await create_qb_object();

    // Assertions
    expect(qbo).toBeDefined();
    // Add more assertions as needed
  });
});
