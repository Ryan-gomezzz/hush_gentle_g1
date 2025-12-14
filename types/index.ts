export type Profile = {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    is_admin: boolean;
};

export type Product = {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    stock: number;
    images: string[];
    attributes: {
        ingredients?: string[];
        benefits?: string;
        usage?: string;
    };
    category_id?: string;
    is_featured?: boolean;
    is_archived?: boolean;
};

export type Category = {
    id: string;
    name: string;
    slug: string;
};
