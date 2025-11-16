export interface ItemVariant {
    name: string;
    weight: string;
    kkal: string;
    cost: string;
}

export interface Product {
    id: number;
    sectionId: number;
    name: string;
    description: string;
    imageUrl: string;
    order: number;
    data: ItemVariant[];
    createdAt: string;
    updatedAt: string;
}

export type SectionSchema = {
    options: string[];
};

export interface SectionData {
    name: string;
    slug: string;
    schema: SectionSchema | null;
    order?: number;
}

export interface MenuSection {
    id: number;
    name: string;
    slug: string;
    schema: SectionSchema | null;
    order: number;
    items: Product[];
    createdAt: string;
    updatedAt: string;
}
