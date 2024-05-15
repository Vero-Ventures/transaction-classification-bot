import { Account } from 'next-auth';
import { Purchase } from './purchase';

export interface QuickBooksResponse {
  QueryResponse: {
    Purchase?: Purchase[];
    Account?: Account[];
    startPosition: number;
    maxResults: number;
  };
  time: string;
}
