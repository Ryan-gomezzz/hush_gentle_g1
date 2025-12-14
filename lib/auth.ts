export type AuthState = {
    message: string | null;
    errors?: {
        email?: string[];
        password?: string[];
    };
};
