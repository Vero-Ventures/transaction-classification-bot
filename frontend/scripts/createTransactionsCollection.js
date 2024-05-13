const Typesense = require('typesense');

const transactionsSchema = {
  name: 'transactions',
  fields: [
    { name: 'userId', type: 'string' },
    { name: 'date', type: 'string' },
    { name: 'transaction_type', type: 'string', facet: true },
    { name: 'transaction_ID', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'account', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'amount', type: 'string' },
  ],
};

const typesense = new Typesense.Client({
  // eslint-disable-next-line no-undef
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  connectionTimeoutSeconds: 2,
  nodes: [
    {
      // eslint-disable-next-line no-undef
      host: process.env.TYPESENSE_HOST || 'localhost',
      // eslint-disable-next-line no-undef
      port: process.env.TYPESENSE_PORT
        ? // eslint-disable-next-line no-undef
          Number(process.env.TYPESENSE_PORT)
        : 8108,
      // eslint-disable-next-line no-undef
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
});

// Function to create the collection
const createCollection = async () => {
  try {
    // Check if the collection already exists
    const collections = await typesense.collections().retrieve();
    const collectionExists = collections.some(
      collection => collection.name === 'transactions'
    );

    if (collectionExists) {
      console.log('Collection "transactions" already exists.');
    } else {
      // Create the collection if it doesn't exist
      await typesense.collections().create(transactionsSchema);
      console.log('Collection "transactions" created successfully.');
    }
  } catch (error) {
    console.error('Error creating collection:', error);
  }
};

// Run the function to create the collection
createCollection();
