import { Injectable } from '@angular/core'
import { UsersRepository } from '@core/repositories/user.repository'
import { CreateUserDTO, UserInsert, UserRow } from '@core/types/user.type'

@Injectable({
    providedIn: 'root'
})
export class UsersService {

    constructor(private usersRepo: UsersRepository) { }

    async getUsers(): Promise<UserRow[]> {
        return await this.usersRepo.getAll()
    }

    async createUser(user: CreateUserDTO): Promise<UserInsert> {
        const userToInsert: UserInsert = {
            email: user.email,
            username: user.name,
            avatarUrl: ''
        }

        return await this.usersRepo.create(userToInsert)
    }
}