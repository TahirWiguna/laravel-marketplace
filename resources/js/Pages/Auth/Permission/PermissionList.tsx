'use client';

import DeleteButtonAction from '@/Components/Action/DeleteButtonAction';
import EditButtonAction from '@/Components/Action/EditButtonAction';
import ViewButtonAction from '@/Components/Action/ViewButtonAction';
import { DataTableServer, DataTableServerRef } from '@/Components/Datatable/DatatableServer';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { PermissionType } from '@/types/permission';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { RefreshCcw } from 'lucide-react';
import moment from 'moment';
import { useRef } from 'react';

type Permission = {
    id: number;
    name: string;
    description: string;
    created_at: Date;
};

type Test = {
    searchable?: boolean;
};

const ColumnTable: ColumnDef<Permission>[] & Test = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => {
                    return row.toggleSelected(!!value);
                }}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false
    },
    {
        accessorKey: 'id',
        header: 'Action',
        cell(props) {
            const value = props.getValue() as string;
            return (
                <div className="divide-x">
                    <DeleteButtonAction url={route('permission.destroy', value)} />
                    <EditButtonAction url={route('permission.edit', value)} />
                    <ViewButtonAction url={route('permission.show', value)} />
                </div>
            );
        },
        enableColumnFilter: false
    },
    {
        accessorKey: 'name',
        header: 'Name'
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell(props) {
            const date = props.getValue() as string;
            return moment(date).format('LLL');
        },
        enableColumnFilter: false
    },
    {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell(props) {
            const date = props.getValue() as string;
            return moment(date).format('LLL');
        },
        enableColumnFilter: false
    }
];

export default function PermissionList({ auth, permissions }: PageProps<{ permission_data: Permission[]; permissions: PermissionType }>) {
    const dataTableServerRef = useRef<DataTableServerRef>(null);
    const refreshTable = () => {
        if (dataTableServerRef.current) {
            dataTableServerRef.current.fetch();
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="List Permission" />
            <Card>
                <CardHeader>Permission Data</CardHeader>
                <CardContent>
                    <div className="flex justify-between space-x-2 mb-4">
                        <div className="flex justify-between space-x-2">
                            {permissions.create && (
                                <Link href={route('permission.create')}>
                                    <Button variant="default" size="sm" className="h-8 border-dashed">
                                        Add Data
                                    </Button>
                                </Link>
                            )}
                        </div>
                        <Button variant="default" size="sm" onClick={refreshTable}>
                            <RefreshCcw />
                        </Button>
                    </div>
                    <DataTableServer
                        ref={dataTableServerRef}
                        columns={ColumnTable}
                        foreignKey="id"
                        routes={route('permission.datatables')}
                        deleteBulkRoute={route('permission.destroys')}
                    />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
