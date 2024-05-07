"use client"
import { typesenseInstantsearchAdapter } from '@/lib/typesense';
import { InstantSearch, Hits } from 'react-instantsearch';

export default function SearchEngine() {
    return (
        <InstantSearch searchClient={typesenseInstantsearchAdapter.searchClient} indexName="users">
            <h1>Search Engine</h1>
            <Hits />
        </InstantSearch>
    );
}