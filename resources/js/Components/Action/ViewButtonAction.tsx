import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface Params {
    url: string;
    children?: ReactNode;
}

const ViewButtonAction = ({ url, children }: Params) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {children ?? (
                        <Button variant="link" size="sm">
                            <Link href={url} className="flex items-center text-primary">
                                <Eye />
                                <span className="ml-2">View</span>
                            </Link>
                        </Button>
                    )}
                </TooltipTrigger>
                <TooltipContent>
                    <p>View</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default ViewButtonAction;
