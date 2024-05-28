import { fetchCustomSearch } from './customsearch';
import { google } from 'googleapis';

jest.mock('googleapis');

describe('fetchCustomSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array of search results if the request is successful', async () => {
    const mockResponseData = {
      data: {
        items: [
          {
            title: 'Mock Title 1',
            link: 'https://example.com/1',
            snippet: 'Mock snippet 1',
          },
          {
            title: 'Mock Title 2',
            link: 'https://example.com/2',
            snippet: 'Mock snippet 2',
          },
        ],
      },
    };

    // Mock the customsearch method
    (google.customsearch as jest.Mock).mockReturnValue({
      cse: {
        list: jest.fn().mockResolvedValueOnce(mockResponseData),
      },
    });

    process.env.GOOGLE_API_KEY = 'mock-api-key';
    process.env.GOOGLE_CSE_CX = 'mock-cse-cx';

    const results = await fetchCustomSearch('mock query');

    expect(google.customsearch).toHaveBeenCalledWith('v1');
    expect(google.customsearch('v1').cse.list).toHaveBeenCalledWith({
      auth: 'mock-api-key',
      cx: 'mock-cse-cx',
      q: 'mock query',
      num: 3,
    });
    expect(results).toEqual([
      {
        title: 'Mock Title 1',
        link: 'https://example.com/1',
        snippet: 'Mock snippet 1',
      },
      {
        title: 'Mock Title 2',
        link: 'https://example.com/2',
        snippet: 'Mock snippet 2',
      },
    ]);
  });

  it('should return an empty array if no items are found in the response', async () => {
    const mockResponseData = {
      data: {},
    };

    (google.customsearch as jest.Mock).mockReturnValue({
      cse: {
        list: jest.fn().mockResolvedValueOnce(mockResponseData),
      },
    });

    process.env.GOOGLE_API_KEY = 'mock-api-key';
    process.env.GOOGLE_CSE_CX = 'mock-cse-cx';

    const results = await fetchCustomSearch('mock query');

    expect(results).toEqual([]);
  });

  it('should log an error if the request fails', async () => {
    (google.customsearch as jest.Mock).mockReturnValue({
      cse: {
        list: jest.fn().mockRejectedValueOnce(new Error('Mock error')),
      },
    });

    process.env.GOOGLE_API_KEY = 'mock-api-key';
    process.env.GOOGLE_CSE_CX = 'mock-cse-cx';

    console.error = jest.fn();

    await fetchCustomSearch('mock query');

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching custom search:',
      expect.any(Error)
    );
  });
});
