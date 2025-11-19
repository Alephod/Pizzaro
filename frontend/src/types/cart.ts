export interface CartItem {
    name: string;
    sectionId: number;
    description: string;
    imageUrl: string;
    count: number;
    removedIngredients: string[];
    addons: string[];
}
