import { Client } from 'typesense';

export const typesense = new Client({
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  nodes: [
    {
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: process.env.TYPESENSE_PORT
        ? Number(process.env.TYPESENSE_PORT)
        : 8108,
      protocol: process.env.TYPESENSE_PROTOCOL || 'http',
    },
  ],
});
