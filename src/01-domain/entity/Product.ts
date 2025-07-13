export class Product {
    constructor(
        private id: number,
        private name: string,
        private description: string,
        private price: number,
        private quantity: number,
        private categoryId: number,
        private location: string,
        private criticalStock: number,
        private isActive: boolean = true,
        private createdAt?: Date,
        private updatedAt?: Date
    ) { }

    // Getters
    getId() { return this.id; }
    getName() { return this.name; }
    getDescription() { return this.description; }
    getPrice() { return this.price; }
    getQuantity() { return this.quantity; }
    getCategoryId() { return this.categoryId; }
    getLocation() { return this.location; }
    getCriticalStock() { return this.criticalStock; }
    getIsActive() { return this.isActive; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }

    // Setters
    setId(id: number) { this.id = id; }
    setName(name: string) { this.name = name; }
    setDescription(description: string) { this.description = description; }
    setPrice(price: number) { this.price = price; }
    setQuantity(quantity: number) { this.quantity = quantity; }
    setCategoryId(categoryId: number) { this.categoryId = categoryId; }
    setLocation(location: string) { this.location = location; }
    setCriticalStock(criticalStock: number) { this.criticalStock = criticalStock; }
    setIsActive(isActive: boolean) { this.isActive = isActive; }
    setCreatedAt(createdAt: Date) { this.createdAt = createdAt; }
    setUpdatedAt(updatedAt: Date) { this.updatedAt = updatedAt; }

    // Business logic methods
    isLowStock(): boolean {
        return this.quantity <= this.criticalStock;
    }

    needsRestock(): boolean {
        return this.quantity === 0;
    }

    isAvailable(): boolean {
        return this.isActive && this.quantity > 0;
    }
}