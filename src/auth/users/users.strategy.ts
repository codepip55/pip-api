import {Injectable} from "@nestjs/common";
import {UserValidatorInterface, UserInterface, InvalidUserException} from "nestjs-oauth2-server";

@Injectable()
export class UserValidator implements UserValidatorInterface {
    async validate(username, password): Promise<UserInterface> {
        // check if the user exists with the given username and password
        // ...
        // or
        throw InvalidUserException.withUsernameAndPassword(username, password);
    }
}