// src/auth/auth.dto.ts
export class LoginDto {
  email!: string;
  password!: string;
}

export class RegisterDto {
  name!: string;      // New field required by your Schema
  email!: string;
  password!: string;
}