export interface FormValidation {
    message: string;
    errors: {
        [key: string]: string[];
    };
}
