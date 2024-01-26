import { UserRepository } from "../repository/user.repository";
import SecurityService from "./security.service";
import { ISignInData, ISignUpData } from "src/core/interfaces/user.interfaces";
import authMailService from "./auth-mail.service";

class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository()
    }

    async signUp(data: ISignUpData): Promise<void> {
        const alreadySignedUp = await this.userRepository.findOne({ email: data.email })

        if (alreadySignedUp) {
            throw new Error('User already exists')
        }

        const hashedPassword = await SecurityService.hashPassword(data.password);
        data.password = hashedPassword

        const userCreated = await this.userRepository.create(data);

        // const accountActivationToken = SecurityService.generateToken()

        // authMailService.accountActivation({
        //     to: userCreated.email,
        //     templateData: {
        //         firstName: userCreated.firstName,
        //         email: userCreated.email,
        //         activationUrl: 'for a while nothing to be rendered'
        //     }
        // })

        return
    }

    async signIn(data: ISignInData): Promise<object>{
        const userData = await this.userRepository.findOne({ email: data.email })

        if(!userData) {
            throw new Error('User does not exists');
        }

        const passwordMatch = await SecurityService.verifyPassword(data.password, userData.password);

        if(!passwordMatch) {
            throw new Error('Wrong credentials');
        }

        const token = SecurityService.createToken(userData.id, userData.email);
        
        return {token, firstName: userData.firstName, email: userData.email};
    }
}

export default new UserService();