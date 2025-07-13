import { User } from '../../../01-domain/entity/User';
import { UserRepository } from '../../../01-domain/repository/UserRepository';
import { RegisterUserDTO } from '../../dto/auth/RegisterUserDTO';
import { UserAlreadyExistsError } from '../../../01-domain/entity/UserErrors';
import { EncryptionInterface } from '../../interface/EncryptionInterface';

export class RegisterUserUseCase {
    constructor(
        private userRepository: UserRepository,
        private encryptionService: EncryptionInterface
    ) { }

    async execute(data: RegisterUserDTO): Promise<User> {
        // Verificar si el usuario ya existe
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new UserAlreadyExistsError(`Ya existe un usuario con el email ${data.email}`);
        }

        // Encriptar contraseña
        const hashedPassword = await this.encryptionService.hash(data.password);

        // Crear nuevo usuario
        const user = new User(
            0, // ID será asignado por la base de datos
            data.email,
            hashedPassword,
            data.name,
            data.role,
            true, // isActive por defecto
            new Date(), // createdAt
            new Date()  // updatedAt
        );

        // Guardar en base de datos
        await this.userRepository.create(user);

        return user;
    }
} 