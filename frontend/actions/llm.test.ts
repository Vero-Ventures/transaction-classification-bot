import { queryLLM, batchQueryLLM } from './llm';
import { Transaction } from '@/types/Transaction';
import { fetchCustomSearch } from './customsearch';

describe('queryLLM', () => {
  beforeEach(() => {
    // Clear any mocks or setup before each test
    jest.clearAllMocks();
  });

  it('should send query and return response', async () => {
    // Mock fetch function
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ response: 'Some response' }),
    } as any);

    const response = await queryLLM('Test query', 'Test context');

    // Assert fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith(expect.any(String), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': expect.any(String), // Assuming apiKey is present
      },
      body: JSON.stringify({
        prompt: 'Test query',
        context: 'Test context',
      }),
    });

    // Assert response is as expected
    expect(response).toEqual({ response: 'Some response' });
  });

  it('should throw error if context is missing', async () => {
    await expect(queryLLM('Test query', '')).rejects.toThrowError(
      'Context is required'
    );
  });

  it('should throw error if both query and name are missing', async () => {
    await expect(queryLLM('', 'Test context')).rejects.toThrowError(
      'Query or name is required'
    );
  });
});
