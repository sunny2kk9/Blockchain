export interface IBackedInventory {
    category: string;
    productName: string;
    quantity: number;
    ingredientsList: string;
    manufacturingDate: string;
    useByDate: string;
    suggestedTempRange: string;
    humidity: string;
    preOrderFlag: boolean;
    retailerName: string;
}