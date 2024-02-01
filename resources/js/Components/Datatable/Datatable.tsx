'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { FormValidation } from '@/types/form-validation';
import { router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import axios from 'axios';
import { CheckIcon, Trash2 } from 'lucide-react';
import * as React from 'react';

import ConfirmationDeleteDialog from '../ConfirmationDeleteDialog';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    delete_bulk_route?: string;
}

export function DataTable<TData, TValue>({ columns, data, delete_bulk_route }: Readonly<DataTableProps<TData, TValue>>) {
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [loading, setLoading] = React.useState(false);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues()
    });

    const onDeleteBulk = async () => {
        if (delete_bulk_route) {
            setLoading(true);
            try {
                const ids = Object.keys(rowSelection);
                await axios.delete(delete_bulk_route, { data: { ids } });
                router.visit(route('role.index'), {
                    onFinish: () => {
                        toast({
                            action: (
                                <div className="flex items-center w-full">
                                    <CheckIcon className="mr-2" />
                                    <span>{ids.length} Data has been deleted!</span>
                                </div>
                            ),
                            variant: 'success',
                            duration: 3000
                        });
                    }
                });
            } catch (error) {
                if (!axios.isAxiosError<FormValidation>(error) || !error.response?.data.errors) {
                    toast({
                        title: 'Whoops! Something went wrong.',
                        variant: 'destructive'
                    });
                    return;
                }

                toast({
                    title: error.response?.data.message || 'Whoops! Something went wrong.',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* <DataTableToolbar table={table} /> */}
            {Object.keys(rowSelection).length > 0 && delete_bulk_route && (
                <ConfirmationDeleteDialog action={onDeleteBulk} loading={loading}>
                    <Button variant="destructive" size="sm" className="h-8 border-dashed">
                        <Trash2 className="mr-2" size={20} />
                        Delete {Object.keys(rowSelection).length} Selected Row
                    </Button>
                </ConfirmationDeleteDialog>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}
