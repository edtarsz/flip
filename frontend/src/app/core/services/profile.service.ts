import { inject, Injectable } from '@angular/core'
import { ProfileRepository } from '@core/repositories/profile.repository'
import { ProfileInsert, ProfileRow } from '@core/types/user.type'

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private usersRepo = inject(ProfileRepository)

  async getUsers(): Promise<ProfileRow[]> {
    return await this.usersRepo.getAll()
  }
}