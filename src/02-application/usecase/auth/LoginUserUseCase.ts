import { User } from '../../../01-domain/entity/User';
import { UserRepository } from '../../../01-domain/repository/UserRepository';
import { LoginUserDTO } from '../../dto/auth/LoginUserDTO';
import { InvalidCredentialsError, UserNotFoundError } from '../../../01-domain/entity/UserErrors';
import { EncryptionInterface } from '../../interface/EncryptionInterface';
import { JWTInterface } from '../../interface/JWTInterface';

export class LoginUserUseCase {
    constructor(
        private userRepository: UserRepository,
        private encryptionService: EncryptionInterface,
        private jwtService: JWTInterface
    ) { }

    async execute(data: LoginUserDTO): Promise<{ token: string; user: User }> {
        // Buscar usuario por email
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new UserNotFoundError('Usuario no encontrado');
        }

        // Verificar si el usuario está activo
        if (!user.getIsActive()) {
            throw new InvalidCredentialsError('Usuario inactivo');
        }

        // Verificar contraseña
        const isPasswordValid = await this.encryptionService.compare(data.password, user.getPassword());
        if (!isPasswordValid) {
            throw new InvalidCredentialsError('Credenciales inválidas');
        }

        // Generar token JWT
        const token = await this.jwtService.generateToken({
            userId: user.getId(),
            email: user.getEmail(),
            role: user.getRole()
        });

        return { token, user };
    }
} 