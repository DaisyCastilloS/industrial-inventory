export class User {
    constructor(
        private id: number,
        private email: string,
        private password: string,
        private name: string,
        private role: string,
        private isActive: boolean = true,
        private createdAt?: Date,
        private updatedAt?: Date
    ) { }

    // Getters
    getId(): number { return this.id; }
    getEmail(): string { return this.email; }
    getPassword(): string { return this.password; }
    getName(): string { return this.name; }
    getRole(): string { return this.role; }
    getIsActive(): boolean { return this.isActive; }
    getCreatedAt(): Date | undefined { return this.createdAt; }
    getUpdatedAt(): Date | undefined { return this.updatedAt; }

    // Setters
    setId(id: number): void { this.id = id; }
    setEmail(email: string): void { this.email = email; }
    setPassword(password: string): void { this.password = password; }
    setName(name: string): void { this.name = name; }
    setRole(role: string): void { this.role = role; }
    setIsActive(isActive: boolean): void { this.isActive = isActive; }
    setCreatedAt(createdAt: Date): void { this.createdAt = createdAt; }
    setUpdatedAt(updatedAt: Date): void { this.updatedAt = updatedAt; }

    // Business logic methods
    isAdmin(): boolean {
        return this.role === 'ADMIN';
    }

    isUser(): boolean {
        return this.role === 'USER';
    }

    isViewer(): boolean {
        return this.role === 'VIEWER';
    }

    canCreateProducts(): boolean {
        return this.isAdmin() || this.isUser();
    }

    canUpdateProducts(): boolean {
        return this.isAdmin() || this.isUser();
    }

    canDeleteProducts(): boolean {
        return this.isAdmin();
    }

    canViewProducts(): boolean {
        return this.isAdmin() || this.isUser() || this.isViewer();
    }
} 