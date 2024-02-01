export type PermissionType<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    list: boolean;
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
};
