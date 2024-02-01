import { Loader2 } from 'lucide-react';

import { Button } from './ui/button';

const ButtonLoading = ({ className = '', text = 'Please Wait', ...props }) => {
    return (
        <Button type="submit" className={className} disabled {...props}>
            <Loader2 className="animate-spin mr-2" />
            {text}
        </Button>
    );
};

export default ButtonLoading;
