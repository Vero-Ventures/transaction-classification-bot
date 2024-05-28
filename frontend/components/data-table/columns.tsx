import { Column, ColumnDef, Row, Table } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { CategorizedTransaction, Transaction } from '@/types/Transaction';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Category } from '@/types/Category';

// Define button for a sortable header
const sortableHeader = (
  column:
    | Column<Transaction, unknown>
    | Column<CategorizedTransaction, unknown>,
  title: string
) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="p-0">
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

const commonColumns = [
  // Select column
  {
    id: 'select',
    header: ({
      table,
    }: {
      table: Table<Transaction> | Table<CategorizedTransaction>;
    }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({
      row,
    }: {
      row: Row<Transaction> | Row<CategorizedTransaction>;
    }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // Date column
  {
    accessorKey: 'date',
    header: ({
      column,
    }: {
      column:
        | Column<Transaction, unknown>
        | Column<CategorizedTransaction, unknown>;
    }) => sortableHeader(column, 'Date'),
    cell: ({
      row,
    }: {
      row: Row<Transaction> | Row<CategorizedTransaction>;
    }) => {
      const formattedDate = format(
        new Date(row.getValue('date')),
        'MM/dd/yyyy'
      );
      return <div>{formattedDate}</div>;
    },
    // Filter function for date column
    filterFn: (
      row: Row<Transaction> | Row<CategorizedTransaction>,
      _: string,
      filterValue: string
    ) => {
      // Get start and end date from filter value
      const [startDate, endDate] = filterValue
        .split(' to ')
        .map((date: string) => {
          return date ? new Date(date) : null;
        });

      // Return true if the row date is within the range
      const rowDate = new Date(row.getValue('date'));
      return (
        (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate)
      );
    },
  },
  // Type column
  {
    accessorKey: 'transaction_type',
    header: ({
      column,
    }: {
      column:
        | Column<Transaction, unknown>
        | Column<CategorizedTransaction, unknown>;
    }) => sortableHeader(column, 'Type'),
    cell: ({ row }: { row: Row<Transaction> | Row<CategorizedTransaction> }) =>
      row.getValue('transaction_type'),
  },
  // Payee column
  {
    accessorKey: 'name',
    header: ({
      column,
    }: {
      column:
        | Column<Transaction, unknown>
        | Column<CategorizedTransaction, unknown>;
    }) => sortableHeader(column, 'Payee'),
    cell: ({ row }: { row: Row<Transaction> | Row<CategorizedTransaction> }) =>
      row.getValue('name'),
  },
  // Account column
  {
    accessorKey: 'account',
    header: ({
      column,
    }: {
      column:
        | Column<Transaction, unknown>
        | Column<CategorizedTransaction, unknown>;
    }) => sortableHeader(column, 'Account'),
    cell: ({ row }: { row: Row<Transaction> | Row<CategorizedTransaction> }) =>
      row.getValue('account'),
  },
  // Amount column
  {
    accessorKey: 'amount',
    header: ({
      column,
    }: {
      column:
        | Column<Transaction, unknown>
        | Column<CategorizedTransaction, unknown>;
    }) => sortableHeader(column, 'Amount'),
    cell: ({
      row,
    }: {
      row: Row<Transaction> | Row<CategorizedTransaction>;
    }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
      }).format(amount);
      return <div>{formatted}</div>;
    },
  },
];

export const selectionColumns: ColumnDef<Transaction>[] = [
  commonColumns[0],
  commonColumns[1],
  commonColumns[2],
  commonColumns[3],
  commonColumns[4],
  // Category column
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => row.getValue('category'),
  },
  commonColumns[5],
];

export const reviewColumns = (
  selectedCategories: Record<string, string>,
  handleCategoryChange: (transaction_ID: string, category: string) => void
): ColumnDef<CategorizedTransaction>[] => [
  commonColumns[0],
  commonColumns[1],
  commonColumns[2],
  commonColumns[3],
  commonColumns[4],
  {
    accessorKey: 'categories',
    header: 'Categories',
    cell: ({ row }) => {
      const categories: Category[] = row.getValue('categories');
      return categories.length > 0 ? (
        <select
          className="border border-gray-700 rounded-lg px-2 py-1"
          onClick={e => e.stopPropagation()}
          onChange={e => {
            handleCategoryChange(row.original.transaction_ID, e.target.value);
          }}
          value={selectedCategories[row.original.transaction_ID]}>
          {categories.map((category, index) => (
            <option key={index} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-red-500">No Categories Found</span>
      );
    },
  },
  commonColumns[5],
];
