import { inject, Injectable } from '@angular/core'
import { ProfileRepository } from '@core/repositories/profile.repository'

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileRepository = inject(ProfileRepository)

  async checkUsernameExists(username: string): Promise<boolean> {
    return await this.profileRepository.checkUsernameExists(username);
  }
}