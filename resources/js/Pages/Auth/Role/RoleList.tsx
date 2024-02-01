import DeleteButtonAction from '@/Components/Action/DeleteButtonAction';
import EditButtonAction from '@/Components/Action/EditButtonAction';
import ViewButtonAction from '@/Components/Action/ViewButtonAction';
import { DataTable } from '@/Components/Datatable/Datatable';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { PermissionType } from '@/types/permission';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import moment from 'moment';
import { useEffect, useState } from 'react';

type Role = {
    id: number;
    name: string;
    description: string;
    created_at: Date;
};

const ColumnTable: ColumnDef<Role>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'id',
        header: 'Action',
        cell(props) {
            const value = props.getValue() as string;
            return (
                <div className="divide-x">
                    <DeleteButtonAction url={route('role.destroy', value)} />
                    <EditButtonAction url={route('role.edit', value)} />
                    <ViewButtonAction url={route('role.show', value)} />
                </div>
            );
        }
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
        }
    },
    {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell(props) {
            const date = props.getValue() as string;
            return moment(date).format('LLL');
        }
    }
];

export default function RoleList({ auth, role_data, permissions }: PageProps<{ role_data: Role[]; permissions: PermissionType }>) {
    const [data, setData] = useState<Role[]>([]);

    useEffect(() => {
        setData(role_data);
    }, []);

    const filter = (columnName: keyof Role, value: string) => {
        const role_data_filtered = role_data.filter((role: Role) => role[columnName].toString().toLowerCase().includes(value.toLowerCase()));
        setData(role_data_filtered);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="List Role" />
            <Card>
                <CardHeader>Role Data</CardHeader>
                <CardContent>
                    <div className="flex justify-between space-x-2 mb-4">
                        <Input className="h-8 w-[150px] lg:w-[250px]" placeholder="Search by role name..." onChange={(e) => filter('name', e.target.value)} />
                        <div className="flex justify-between space-x-2">
                            {permissions.create && (
                                <Link href={route('role.create')}>
                                    <Button variant="default" size="sm" className="h-8 border-dashed">
                                        Add Data
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                    <DataTable columns={ColumnTable} data={data} delete_bulk_route={route('role.destroys')} />
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
