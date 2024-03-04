import { PermissionType } from '@/types/permission';
import { Link, router } from '@inertiajs/react';
import { CheckIcon, Pencil, Trash2 } from 'lucide-react';

import DeleteButtonAction from '../Action/DeleteButtonAction';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';

interface FormToolbarTemplateProps {
    module: string;
    permissions: PermissionType;
    id: number;
    name?: string;
}

const FormToolbarTemplate = ({ permissions, module, id, name }: FormToolbarTemplateProps) => {
    return (
        <div className="my-2 flex justify-end gap-2">
            {permissions.delete && (
                <DeleteButtonAction
                    url={route(`${module}.destroy`, id)}
                    callback={() => {
                        router.visit(route(`${module}.index`), {
                            onFinish: () => {
                                toast({
                                    action: (
                                        <div className="flex items-center w-full">
                                            <CheckIcon className="mr-2" />
                                            <span>{name || 'Data'} has been deleted!</span>
                                        </div>
                                    ),
                                    variant: 'success',
                                    duration: 3000
                                });
                            }
                        });
                    }}
                >
                    <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2" size={20} />
                        Delete
                    </Button>
                </DeleteButtonAction>
            )}
            {permissions.update && (
                <Link href={route(`${module}.edit`, id)}>
                    <Button size="sm">
                        <Pencil className="mr-2" size={20} />
                        Edit
                    </Button>
                </Link>
            )}
        </div>
    );
};

export default FormToolbarTemplate;
