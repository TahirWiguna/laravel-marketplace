import { cn } from '@/lib/utils';
import { FormValidation } from '@/types/form-validation';

import { Card, CardContent } from './ui/card';

interface FormErrorType {
    errors: FormValidation | null;
    className?: string;
}

const FormError = ({ errors, className = '' }: FormErrorType) => {
    return (
        errors && (
            <Card className={cn('bg-destructive text-white', className)}>
                <CardContent className="py-2">
                    <p className="text-md font-medium text-center mb-2">{errors.message}</p>
                    {Object.keys(errors.errors).map((name) => {
                        return (
                            <div key={'error_' + name}>
                                <p className="capitalize text-sm font-medium leading-none">{name}</p>
                                <ul className="list-disc marker:text-white">
                                    {errors.errors[name].map((val) => {
                                        return (
                                            <li key={'error_' + name + '_' + 'val'}>
                                                <p className="text-sm">{val}</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        )
    );
};

export default FormError;
