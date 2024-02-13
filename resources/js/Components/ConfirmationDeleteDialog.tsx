import { Loader2, Trash2, XCircle } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { Button } from './ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface Params {
    action: () => void;
    sample_data?: string;
    loading: boolean;
    children?: ReactNode;
    openState?: [open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>];
}

const ConfirmationDeleteDialog = ({ action, sample_data, loading, children, openState }: Params) => {
    const [open, setOpen] = openState || useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div onClick={() => setOpen(true)}>
                {children ? (
                    children
                ) : (
                    <Button variant="link" size="sm" className="text-destructive">
                        <Trash2 />
                        <span className="ml-2">Delete</span>
                    </Button>
                )}
            </div>
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
                        <Button variant={'destructive'} onClick={action} disabled={loading}>
                            {loading && <Loader2 className="animate-spin mr-2" />}
                            Yes, I want to delete this data
                        </Button>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationDeleteDialog;
