export class Product {
    constructor(
        private id: number,
        private name: string,
        private description: string,
        private price: number,
        private quantity: number
    ) { }

    getId() { return this.id; }
    getName() { return this.name; }
    getDescription() { return this.description; }
    getPrice() { return this.price; }
    getQuantity() { return this.quantity; }

    setName(name: string) { this.name = name; }
    setDescription(description: string) { this.description = description; }
    setPrice(price: number) { this.price = price; }
    setQuantity(quantity: number) { this.quantity = quantity; }
}