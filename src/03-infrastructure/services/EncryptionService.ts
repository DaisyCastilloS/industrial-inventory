import bcrypt from 'bcrypt';
import { EncryptionInterface } from '../../02-application/interface/EncryptionInterface';

export class EncryptionService implements EncryptionInterface {
    private readonly saltRounds = 10;

    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, this.saltRounds);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}
