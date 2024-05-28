import { fetchKnowledgeGraph } from './knowledgegraph';
import { google } from 'googleapis';

jest.mock('googleapis');

describe('fetchKnowledgeGraph', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return knowledge graph results if request is successful', async () => {
    // Mocking environment variables
    process.env.GOOGLE_API_KEY = 'your_api_key';

    // Mocking the response from Knowledge Graph API
    const mockResponse = {
      data: {
        itemListElement: [
          {
            result: {
              name: 'Example Organization',
              detailedDescription: {
                articleBody:
                  'This is a detailed description of the organization.',
              },
            },
            resultScore: 90,
          },
        ],
      },
    };

    // Mocking the Knowledge Graph API function
    const mockEntitiesSearch = jest.fn().mockResolvedValue(mockResponse);
    (google.kgsearch as jest.Mock).mockReturnValue({
      entities: { search: mockEntitiesSearch },
    });

    // Call the function with a query
    const results = await fetchKnowledgeGraph('example query');

    // Verify the results
    expect(results).toEqual([
      {
        name: 'Example Organization',
        resultScore: 90,
        detailedDescription:
          'This is a detailed description of the organization.',
      },
    ]);
  });
});
