/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IAuthLoginData {
  email: string
  password: string
}

export interface IAuthSignupData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}

export interface IVerificationData {
  code: string
  email: string
}

export enum UserRole {
  Client = 'CLIENT',
  Agent = 'AGENT',
  Freelancer = 'FREELANCER',
  Manager = 'MANAGER',
  Admin = 'ADMIN',
}
