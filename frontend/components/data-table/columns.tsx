import { Column, ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Transaction } from '@/types/Transaction';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';

const sortableHeader = (
  column: Column<Transaction, unknown>,
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

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => sortableHeader(column, 'Date'),
    cell: ({ row }) => {
      const formattedDate = format(
        new Date(row.getValue('date')),
        'MM/dd/yyyy'
      );
      return <div>{formattedDate}</div>;
    },
    filterFn: (row, id, filterValue) => {
      // Convert filterValue to an array of start and end dates
      const [startDate, endDate] = filterValue
        .split(' to ')
        .map((date: string) => {
          return date ? new Date(date) : null;
        });

      // Filter rows based on the date range
      const rowDate = new Date(row.getValue('date'));
      return (
        (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate)
      );
    },
  },
  {
    accessorKey: 'transaction_type',
    header: ({ column }) => sortableHeader(column, 'Type'),
    cell: ({ row }) => row.getValue('transaction_type'),
  },
  {
    accessorKey: 'name',
    header: ({ column }) => sortableHeader(column, 'Payee'),
    cell: ({ row }) => row.getValue('name'),
  },
  {
    accessorKey: 'account',
    header: ({ column }) => sortableHeader(column, 'Account'),
    cell: ({ row }) => row.getValue('account'),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => row.getValue('category'),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => sortableHeader(column, 'Amount'),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
      }).format(amount);
      return <div>{formatted}</div>;
    },
  },
];
