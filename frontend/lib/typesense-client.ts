import { Client } from 'typesense';

export const typesense = new Client({
  apiKey: 'xyz',
  nodes: [
    {
      host: 'localhost',
      port: 8108,
      protocol: 'http',
    },
  ],
});
