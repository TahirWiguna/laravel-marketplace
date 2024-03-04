import ButtonLoading from '@/Components/ButtonLoading';
import Container from '@/Components/Container';
import CardHeaderFormTemplate from '@/Components/Form/FormHeaderTemplate';
import FormToolbarTemplate from '@/Components/Form/FormToolbarTemplate';
import FormError from '@/Components/FormError';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/Components/ui/form';
import { Input } from '@/Components/ui/input';
import { toast } from '@/Components/ui/use-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { FormValidation } from '@/types/form-validation';
import { PermissionType } from '@/types/permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const MODULE = 'permission';

// SETUP FORM
const FormSchema = z.object({
    id: z.number().nullable(),
    name: z.string().min(1)
});
type FormValues = z.infer<typeof FormSchema>;
const defaultValues: FormValues = {
    id: null,
    name: ''
};

// COMPONENT
interface Params extends PageProps {
    type: 'create' | 'edit' | 'show';
    permissions: PermissionType;
    form_data?: FormValues;
}

const PermissionForm = ({ auth, type, permissions, form_data }: Params) => {
    if (form_data === undefined) {
        form_data = defaultValues;
    }

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<FormValidation | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: form_data
    });

    async function onSubmit(data: FormValues, submitType: 'NORMAL' | 'MORE') {
        setLoading(true);
        setFormError(null);

        try {
            let res;
            if (type === 'create') {
                res = await axios.post<{ data: { id: number } }>(route(`${MODULE}.store`), data);
            } else if (type === 'edit') {
                if (data?.id) {
                    res = await axios.put<{ data: { id: number } }>(route(`${MODULE}.update`, data.id), data);
                }
            }
            if (submitType === 'NORMAL') {
                router.visit(route(`${MODULE}.show`, res?.data.data.id), {
                    onFinish: () => {
                        toast({
                            action: (
                                <div className="flex items-center w-full">
                                    <CheckIcon className="mr-2" />
                                    <span>User has been {type === 'create' ? 'created' : 'updated'}!</span>
                                </div>
                            ),
                            variant: 'success',
                            duration: 3000
                        });
                    }
                });
            } else {
                form.reset();
                toast({
                    action: (
                        <div className="flex items-center w-full">
                            <CheckIcon className="mr-2" />
                            <span>User has been {type === 'create' ? 'created' : 'updated'}!</span>
                        </div>
                    ),
                    variant: 'success',
                    duration: 3000
                });
            }
        } catch (error) {
            if (!axios.isAxiosError<FormValidation>(error) || !error.response?.data.errors) {
                toast({
                    title: 'Whoops! Something went wrong.',
                    variant: 'destructive'
                });
                return;
            }

            setFormError(error.response?.data || null);
            toast({
                title: error.response?.data.message || 'Whoops! Something went wrong.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }

    function generateForm() {
        return (
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base">Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder={`${MODULE} name`} readOnly={type === 'show'} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }

    function generateFooterButton() {
        return (
            <div className="flex gap-2">
                {type === 'create' && (loading ? <ButtonLoading /> : <Button type="submit">Create</Button>)}
                {type === 'create' &&
                    (loading ? (
                        <ButtonLoading variant="outline" />
                    ) : (
                        <Button variant="outline" type="button" onClick={form.handleSubmit((data) => onSubmit(data, 'MORE'))}>
                            Create Again
                        </Button>
                    ))}
                {type === 'edit' && (loading ? <ButtonLoading /> : <Button type="submit">Update</Button>)}
                <Button type="button" variant="secondary" onClick={() => router.visit(route(`${MODULE}.index`))}>
                    Back to list
                </Button>
            </div>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={type.toUpperCase() + ' ' + MODULE} />
            <Container className="max-w-7xl">
                {type === 'show' && form_data.id && <FormToolbarTemplate id={form_data.id} permissions={permissions} module={MODULE} name={form_data.name} />}
                <Card>
                    <CardHeader>
                        <CardHeaderFormTemplate type={type} module={MODULE} />
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => onSubmit(data, 'NORMAL'))} className="space-y-6">
                                {generateForm()}
                                {generateFooterButton()}
                            </form>
                        </Form>
                        <FormError className="mt-2 rounded-sm" errors={formError} />
                    </CardContent>
                </Card>
            </Container>
        </AuthenticatedLayout>
    );
};

export default PermissionForm;
