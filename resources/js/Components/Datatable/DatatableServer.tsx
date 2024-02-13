'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { FormValidation } from '@/types/form-validation';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { ColumnDef, PaginationState, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import axios from 'axios';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, Loader2Icon, Trash2 } from 'lucide-react';
import { ReactElement, Ref, forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import ConfirmationDeleteDialog from '../ConfirmationDeleteDialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from '../ui/use-toast';

export interface ColumnsDatatableType {
    data: string;
    name: string;
    searchable: boolean;
    orderable: boolean;
    search: {
        value: string;
        regex: boolean;
    };
}

interface DatatableOptionsType {
    draw: number;
    columns: ColumnsDatatableType[];
    order?: {
        column: number;
        dir: 'asc' | 'desc';
    }[];
    start: number;
    length: number;
    search?: {
        value: string;
        regex: boolean;
    };
}

interface DatatableResponse<TResponse> {
    data: TResponse;
    draw: number;
    input: [];
    recordsFiltered: number;
    recordsTotal: number;
}

interface DataTableProps<TResponse, TColumnDef> {
    columns: ColumnDef<TResponse, TColumnDef>[];
    deleteBulkRoute?: string;
    deleteBulkCallback?: () => void;
    routes: string;
    foreignKey?: keyof TResponse;
}

export interface DataTableServerRef {
    fetch: () => void;
}

export const DataTableServerOriginal = <TResponse, TColumnDef>(
    { columns, deleteBulkRoute, deleteBulkCallback, routes, foreignKey }: DataTableProps<TResponse, TColumnDef>,
    ref: Ref<DataTableServerRef>
) => {
    const page = 1; // page param
    const perPage = 5; // length param
    const datatableColumns: ColumnsDatatableType[] = columns
        .filter((obj) => {
            const { accessorKey } = obj as { accessorKey: string };
            return accessorKey;
        })
        .map((obj) => {
            const { accessorKey } = obj as { accessorKey: string };
            return {
                data: accessorKey,
                name: accessorKey,
                searchable: true,
                orderable: true,
                search: {
                    regex: false,
                    value: ''
                }
            };
        });

    const defaultOptions = {
        draw: 1,
        columns: datatableColumns,
        start: 0,
        length: perPage
    };

    const openDeleteBulkDialog = useState(false);

    const [rowSelection, setRowSelection] = useState({});
    // const [columnVisibility] = useState<VisibilityState>({});
    // const [columnFilters] = useState<ColumnFiltersState>([]);
    // const [sorting] = useState<SortingState>([]);
    const [loading, setLoading] = useState(false);
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: page - 1,
        pageSize: perPage
    });

    const [tableOptions, setTableOption] = useState<DatatableOptionsType>(defaultOptions);
    const [data, setResponse] = useState<TResponse[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [dataCount, setResponseCount] = useState(0);

    const fetch = async (opt: { draw: number; columns: ColumnsDatatableType[]; start: number; length: number } | null = tableOptions) => {
        // const controller = new AbortController();
        // controller.abort();
        try {
            setLoading(true);
            const get = await axios.post<DatatableResponse<TResponse[]>>(routes, opt, {
                // signal: controller.signal
            });
            const res = get.data;
            setResponse(res.data);
            setResponseCount(res.recordsFiltered);
            if (opt) {
                setPageCount(Math.ceil(res.recordsFiltered / opt.length) || 0);
            } else {
                setPageCount(0);
            }
            return res;
        } catch (e) {
            toast({
                title: 'Whoops! Something went wrong',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
        return null;
    };

    // useEffect(() => {
    //     console.log('table option changed');
    //     fetch();
    // }, [tableOptions]);

    function findColumnIndex(data: DatatableOptionsType, columnName: string) {
        for (let i = 0; i < data.columns.length; i++) {
            if (data.columns[i].name === columnName) {
                return i;
            }
        }
        return -1; // Column not found
    }

    const search = (column_name: string, value: string) => {
        const column_index = findColumnIndex(tableOptions, column_name);

        if (column_index !== -1) {
            const newOpt = tableOptions;
            newOpt.columns[column_index].search.value = value;
            setTableOption(newOpt);
            fetch();
        }
    };

    useImperativeHandle(ref, () => ({
        fetch
    }));

    // Fetch when page on change
    useEffect(() => {
        const opt = {
            draw: tableOptions.draw + 1,
            columns: datatableColumns,
            start: pageIndex * tableOptions.length,
            length: pageSize
        };
        setTableOption(opt);
        fetch(opt);
    }, [pageIndex, pageSize]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        pageCount: pageCount,
        state: {
            pagination: {
                pageIndex,
                pageSize
            },
            rowSelection: rowSelection
        },
        onPaginationChange: setPagination,
        manualPagination: true,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getRowId: (row: TResponse) => {
            if (foreignKey) {
                return row[foreignKey] as string;
            } else {
                throw new Error('Rows doesnt have id');
            }
        }
    });

    const onDeleteBulk = async () => {
        if (deleteBulkRoute) {
            setLoading(true);
            try {
                const ids = Object.keys(rowSelection);
                await axios.delete(deleteBulkRoute, { data: { ids } });
                await fetch();

                if (deleteBulkCallback) {
                    deleteBulkCallback();
                } else {
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

                openDeleteBulkDialog[1](false);
                setRowSelection({});
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
        } else {
            toast({
                title: 'deleteBulkRoute not provided.',
                variant: 'destructive'
            });
            throw new Error('deleteBulkRoute not provided');
        }
    };

    return (
        <div className="relative">
            <div className="space-y-4">
                {/* <DataTableToolbar table={table} /> */}
                {Object.keys(rowSelection).length > 0 && deleteBulkRoute && (
                    <ConfirmationDeleteDialog action={onDeleteBulk} loading={loading} openState={openDeleteBulkDialog}>
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
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan} className="px-1 bg-secondary">
                                                {header.column.getCanFilter() && (
                                                    <Input
                                                        type="search"
                                                        onChange={(e) => search(header.id, e.target.value)}
                                                        placeholder={
                                                            typeof header.column.columnDef.header === 'string'
                                                                ? `Search by ${header.column.columnDef.header?.toString().toLowerCase()}...`
                                                                : ''
                                                        }
                                                    />
                                                )}
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

                {/* pagination */}
                <div className="flex items-start justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        <p>
                            Showing {pageIndex * pageSize + 1} to {(pageIndex + 1) * pageSize > dataCount ? dataCount : (pageIndex + 1) * pageSize} of{' '}
                            {dataCount} entries
                        </p>
                        {Object.keys(rowSelection).length > 0 && <p className="text-sm">{Object.keys(rowSelection).length} row(s) selected.</p>}
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 25, 50, 100, 1000].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {pageIndex + 1} of {table.getPageCount()}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Go to first page</span>
                                <DoubleArrowLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeftIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                <span className="sr-only">Go to next page</span>
                                <ChevronRightIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Go to last page</span>
                                <DoubleArrowRightIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {loading && (
                <div className="loader w-full h-full flex items-center justify-center absolute top-0 left-0 bg-black/10">
                    <div className="bg-white flex space-x-2 p-6 shadow-lg">
                        <Loader2Icon className="animate-spin" />
                        <p>Please Wait...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const DataTableServer = forwardRef(DataTableServerOriginal) as <TResponse, TColumnDef>(
    p: DataTableProps<TResponse, TColumnDef> & { ref?: Ref<DataTableServerRef> }
) => ReactElement;
