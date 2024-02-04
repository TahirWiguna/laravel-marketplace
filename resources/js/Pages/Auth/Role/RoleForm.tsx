import DeleteButtonAction from '@/Components/Action/DeleteButtonAction';
import ButtonLoading from '@/Components/ButtonLoading';
import Container from '@/Components/Container';
import FormError from '@/Components/FormError';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { toast } from '@/Components/ui/use-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { FormValidation } from '@/types/form-validation';
import { PermissionType } from '@/types/permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { CheckIcon, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const FormSchema = z.object({
    id: z.number().nullable(),
    name: z.string().min(1)
});
type FormValues = z.infer<typeof FormSchema>;

const defaultValues: FormValues = {
    id: null,
    name: ''
};

interface Params extends PageProps {
    type: 'create' | 'edit' | 'show';
    role_data?: FormValues;
    permissions: PermissionType;
}

const Create = ({ auth, type, role_data, permissions }: Params) => {
    if (role_data === undefined) {
        role_data = defaultValues;
    }

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [formError, setFormError] = useState<FormValidation | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: role_data
    });

    async function onSubmit(data: FormValues) {
        setLoading(true);
        setFormError(null);
        console.log('submit');

        try {
            if (type === 'create') {
                await axios.post(route('role.store'), data);
            } else if (type === 'edit') {
                if (role_data?.id) {
                    await axios.put(route('role.update', role_data.id), data);
                }
            }
            router.visit(route('role.index'), {
                onFinish: () => {
                    toast({
                        action: (
                            <div className="flex items-center w-full">
                                <CheckIcon className="mr-2" />
                                <span>Role has been {type === 'create' ? 'created' : 'updated'}!</span>
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
            setLoading(false);
        }
    }

    async function onSubmitMore(data: FormValues) {
        setLoadingMore(true);
        setFormError(null);
        console.log('submit');

        try {
            if (type === 'create') {
                await axios.post(route('role.store'), data);
            } else if (type === 'edit') {
                if (role_data?.id) {
                    await axios.put(route('role.update', role_data.id), data);
                }
            }
            form.reset();
            setLoadingMore(false);

            toast({
                title: 'Role has been created!',
                variant: 'success',
                duration: 3000
            });
        } catch (error) {
            if (axios.isAxiosError<FormValidation>(error)) {
                if (error.response?.data.errors) {
                    setFormError(error.response?.data || null);
                    toast({
                        title: error.response?.data.message || 'Whoops! Something went wrong.',
                        variant: 'destructive'
                    });
                } else {
                    toast({
                        title: 'Whoops! Something went wrong.',
                        variant: 'destructive'
                    });
                }
            } else {
                toast({
                    title: 'Whoops! Something went wrong.',
                    variant: 'destructive'
                });
            }
            setLoadingMore(false);
        }
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={type.toUpperCase() + ' Role'} />
            <Container className="max-w-[500px]">
                {type === 'show' && role_data?.id && (
                    <div className="my-2 flex justify-end gap-2">
                        {permissions.delete && (
                            <DeleteButtonAction url={route('role.edit', role_data.id)}>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2" size={20} />
                                    Delete
                                </Button>
                            </DeleteButtonAction>
                        )}
                        {permissions.update && (
                            <Link href={route('role.edit', role_data.id)}>
                                <Button size="sm">
                                    <Pencil className="mr-2" size={20} />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>{type.toUpperCase()} ROLE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled={type === 'show'} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2">
                                    {type === 'create' && (loading ? <ButtonLoading /> : <Button type="submit">Create</Button>)}
                                    {type === 'create' &&
                                        (loadingMore ? (
                                            <ButtonLoading variant="outline" />
                                        ) : (
                                            <Button variant="outline" type="button" onClick={form.handleSubmit(onSubmitMore)}>
                                                Create Again
                                            </Button>
                                        ))}
                                    {type === 'edit' && (loading ? <ButtonLoading /> : <Button type="submit">Update</Button>)}
                                    <Button type="button" variant="secondary" onClick={() => router.visit(route('role.index'))}>
                                        Back to list
                                    </Button>
                                </div>
                            </form>
                        </Form>
                        <FormError className="mt-2 rounded-sm" errors={formError} />
                    </CardContent>
                </Card>
            </Container>
        </AuthenticatedLayout>
    );
};

export default Create;
