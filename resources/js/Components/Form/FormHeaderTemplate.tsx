interface CardHeaderTemplateProps {
    type: 'create' | 'edit' | 'show';
    module: string;
}

const FormHeaderTemplate = ({ type, module }: CardHeaderTemplateProps) => {
    return (
        <div className="pb-4 border-b">
            <h2 className="text-3xl font-bold tracking-tight capitalize">
                {type} {module}
            </h2>
            {type === 'create' && <p className="text-base text-muted-foreground ">Let&apos;s Get Creative! Craft Your New Entry</p>}
            {type === 'show' && <p className="text-base text-muted-foreground ">Details revealed! Dive into the spesifics.</p>}
            {type === 'edit' && <p className="text-base text-muted-foreground ">Revise & Refine: Edit Details Here</p>}
        </div>
    );
};

export default FormHeaderTemplate;
