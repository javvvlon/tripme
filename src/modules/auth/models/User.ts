import { Model } from '~/shared/helpers/model'
import { UserRole } from '~/modules/auth/contracts/auth'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IUserRaw {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: UserRole
  is_verified: boolean
}

export interface IUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: UserRole | null
  isVerified: boolean
}

export class User extends Model<IUser> {
  protected static override mapRaw(raw: IUserRaw): IUser {
    return {
      id: raw.id,
      firstName: raw.first_name,
      lastName: raw.last_name,
      email: raw.email,
      phoneNumber: raw.phone_number,
      role: raw.role,
      isVerified: raw.is_verified,
    }
  }

  public isVerified(): boolean {
    return this.get('isVerified') ?? false
  }

  public isAgent(): boolean {
    return this.get('role') === UserRole.Agent || this.get('role') === UserRole.Freelancer
  }

  public isFreelancer(): boolean {
    return this.get('role') === UserRole.Freelancer
  }

  public canSeeAllClients(): boolean {
    const role = this.get('role')
    return role === UserRole.Manager || role === UserRole.Admin
  }

  public canAccessWorkspace(): boolean {
    return this.isAgent() || this.canSeeAllClients()
  }

  public fullName(): string {
    return [this.get('firstName'), this.get('lastName')].filter(Boolean).join(' ')
  }
}
