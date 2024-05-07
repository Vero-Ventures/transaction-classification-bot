"use client"
import { typesenseInstantsearchAdapter } from '@/lib/typesense';
import { InstantSearch, Hits, SearchBox } from 'react-instantsearch';

function Hit({ hit }: any) {
    return (
        <tr className="bg-white border-b hover:bg-gray-50">
            <td className="px-4 py-2">{hit.id}</td>
            <td className="px-4 py-2">{hit.email}</td>
        </tr>
    );
}

export default function SearchEngine() {
    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Search Engine (not database users)</h1>
            <InstantSearch searchClient={typesenseInstantsearchAdapter.searchClient} indexName="users">
                <div className="mb-4">
                    <SearchBox
                        className="border border-gray-300 rounded-lg px-4 py-2"
                        placeholder='Search users by email...'
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border-b">ID</th>
                                <th className="px-4 py-2 border-b">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <Hits hitComponent={Hit} />
                        </tbody>
                    </table>
                </div>
            </InstantSearch>
        </div>
    );
}
