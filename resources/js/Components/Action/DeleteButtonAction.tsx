import { Button } from '@/Components/ui/button';
import { FormValidation } from '@/types/form-validation';
import axios from 'axios';
import { Loader2, Trash2, XCircle } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { toast } from '../ui/use-toast';

interface Params {
    url: string;
    sample_data?: string;
    children?: ReactNode;
    callback?: () => void;
}

const DeleteButtonAction = ({ url, sample_data, children, callback }: Params) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const onDelete = async () => {
        setLoading(true);

        try {
            await axios.delete(url);
            setOpen(false);
            if (callback) {
                callback();
            } else {
                // router.visit(route('role.index'), {
                //     onFinish: () => {
                //         toast({
                //             action: (
                //                 <div className="flex items-center w-full">
                //                     <CheckIcon className="mr-2" />
                //                     <span>{sample_data ?? 'Data'} has been deleted!</span>
                //                 </div>
                //             ),
                //             variant: 'success',
                //             duration: 3000
                //         });
                //     }
                // });
            }
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
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild onClick={() => setOpen(true)}>
                        {children ?? (
                            <Button variant="link" size="sm" className="text-destructive">
                                <Trash2 />
                                <span className="ml-2">Delete</span>
                            </Button>
                        )}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="mx-auto">
                        <XCircle className="text-destructive" size={80} />
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure want to delete this data?
                        <br />
                        You cannot revert this action after the deletion.
                        {sample_data && <span>{sample_data}</span>}
                        <br />
                        <br />
                    </DialogDescription>
                    <DialogFooter className="sm:justify-center">
                        <DialogClose asChild>
                            <Button variant={'link'} autoFocus={true}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant={'destructive'} onClick={() => onDelete()} disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2" />}
                            Yes, I want to delete this data
                        </Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteButtonAction;
