import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface Params {
    url: string;
    children?: ReactNode;
}

const EditButtonAction = ({ url, children }: Params) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children ? (
                        children
                    ) : (
                        <Button variant="link" size="sm">
                            <Link href={url} className="flex items-center text-blue-400">
                                <Pencil />
                                <span className="ml-2">Edit</span>
                            </Link>
                        </Button>
                    )}
                </TooltipTrigger>
                <TooltipContent>
                    <p>Edit</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default EditButtonAction;
