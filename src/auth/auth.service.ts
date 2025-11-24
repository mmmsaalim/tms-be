import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    console.log(`Attempting login for: ${email} with pass: ${password}`);

    // 1. First, try to find the user just by email to see if the connection works
    const userByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log("User found by email:", userByEmail);

    if (!userByEmail) {
      console.log("User does not exist in the database table that Prisma is looking at.");
      return null;
    }

    // 2. Check if password matches (Basic string comparison)
    if (userByEmail.password !== password) {
      console.log(`Password mismatch. DB: '${userByEmail.password}' vs Input: '${password}'`);
      return null;
    }

    return { token: "dummy-token", user: userByEmail };
  }
}