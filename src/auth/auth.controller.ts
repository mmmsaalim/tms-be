import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() body: any) {
    const { email, password } = body;

    const result = await this.authService.login(email, password);

    if (!result) {
      return { success: false, message: "Invalid email or password" };
    }

    return { success: true, token: result.token };
  }
}
