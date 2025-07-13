import { User } from '../entity/User';

export interface UserRepository {
    create(user: User): Promise<void>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    update(user: User): Promise<void>;
    delete(id: number): Promise<void>;
    findAll(): Promise<User[]>;
} 