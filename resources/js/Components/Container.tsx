import { cn } from '@/lib/utils';
import React, { HTMLAttributes, ReactNode } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
}

const Container = ({ className = '', children, ...props }: ContainerProps) => {
    return (
        <div className={cn('w-full mx-auto', className)} {...props}>
            {children}
        </div>
    );
};

export default Container;
