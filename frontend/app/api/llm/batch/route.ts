import { fetchKnowledgeGraph } from "@/lib/knowledgegraph";
import { fetchCustomSearch } from "@/lib/customsearch";
import { queryLLM } from "@/lib/llm";
import { Transaction, CategorizedResult } from "@/.next/types/Transaction";

const basePrompt = 'Given a list of categories, What type of business expense would a transaction from $NAME be? Categorys: $CATEGORYS';
const categorys = `Advertising, Automobile, Fuel, Bank Charges, Commission & fees, Disposal Fees, Dues & Subscriptions, 
Equipment Rental, Insurance, Workers Compensation, Job Expenses, Cost of Labour, Installation, Maintenance and Repairs, 
Equipment Rental, Job Materials, Permits, Legal & Professional Fees, Accounting, Bookkeeper, Lawyer, Maintenance and Repair, 
Building Repairs, Computer Repairs, Equipment Repairs, Meals and Entertainment, Office Expenses, Promotional, Purchases, 
Rent or Lease, Stationary & Printing, Supplies, Taxes & Licenses, Unapplied Cash Bill Payment Expense, Uncategorized Expense, 
Utilities, Gas and Electric, Telephone, Depreciation, Miscellaneous, Penalties & Settlements`;
const threshold = 100;

export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json();
        const transactions: Transaction[] = body.transactions || [];

        const contextPromises = transactions.map(async (transaction: Transaction) => {
            const prompt = basePrompt.replace('$NAME', transaction.name).replace('$CATEGORYS', categorys);

            // Fetch detailed descriptions from the Knowledge Graph API
            const kgResults = await fetchKnowledgeGraph(transaction.name) || [];
            const descriptions = kgResults.filter(result => result.resultScore > threshold);

            // Check if descriptions are over threshold, otherwise use Custom Search API snippets
            let description;
            if (descriptions.length > 0) {
                description = descriptions[0].detailedDescription;
            } else {
                const searchResults = await fetchCustomSearch(transaction.name) || [];
                description = searchResults.length > 0
                  ? searchResults.map(result => result.snippet).join(' ')
                  : 'No description available';
            }

            return {
                transaction_ID: transaction.transaction_ID,
                prompt,
                context: `Description: ${description}`
            };
        });
        const contexts = await Promise.all(contextPromises);

        console.log('contexts', contexts);

        const results: CategorizedResult[] = [];
        for (const { transaction_ID, prompt, context } of contexts) {
            const response = await queryLLM(prompt, context);
            results.push({
                transaction_ID,
                possibleCategories: response || []
            });
        }

        return Response.json(
            results,
            { status: 200 }
        );
    } catch (error) {
        console.error('Error handling request:', error);
        return Response.json(
            { error: 'Error fetching data' },
            { status: 400 }
        );
    }
}
