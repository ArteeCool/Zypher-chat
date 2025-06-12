import { use } from "react";
import { Resend } from "resend";
import chatsService from "./chats";

class AuthService {
  private baseUrl = "https://109.95.33.158:5678/api/";
  public currentUser: any = null;

  initFromLocalStorage() {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        this.setCurrentUserFromToken(token);
      }
    }
  }

  async register(
    email: string,
    username: string,
    password: string
  ): Promise<{
    status: boolean;
    data: { email: string; confirmationToken: string } | string;
  }> {
    try {
      const res = await fetch(this.baseUrl + "auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      console.log(data);
      if (!res.ok || data.error) {
        return {
          status: false,
          data: data.msg || "Registration failed",
        };
      }

      const loginResult = await this.login(email, password);

      await this.confirmation(data.data.email, data.data.confirmationToken);

      return loginResult;
    } catch (error) {
      return {
        status: false,
        data: "Registration error: " + (error as Error).message,
      };
    }
  }

  async confirmation(userEmail: string, token: string) {
    try {
      const confirmUrl = `https://arteecool.com.ua/confirm-email?token=${token}`;

      const result = await fetch(this.baseUrl + "send-confirmation-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          subject: "Email Confirmation",
          text: `Please confirm your email by visiting the following link: ${confirmUrl}`,
          html: `
              <div>
                <h1>Please confirm your email</h1>
                <p>Click <a href="${confirmUrl}">here</a> to confirm your email address.</p>
              </div>
            `,
        }),
      });

      return result;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      throw error;
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    status: boolean;
    data: { email: string; confirmationToken: string } | string;
  }> {
    try {
      const res = await fetch(this.baseUrl + "auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        return {
          status: false,
          data: data.error || "Invalid email or password",
        };
      }

      localStorage.setItem("token", data.token);

      this.setCurrentUserFromToken(data.token);

      return {
        status: true,
        data: { email: data.email, confirmationToken: data.confirmationToken },
      };
    } catch (error) {
      return {
        status: false,
        data: "Login error: " + (error as Error).message,
      };
    }
  }

  logout() {
    localStorage.removeItem("token");
  }

  async validateToken(): Promise<{ status: boolean; message: string }> {
    const token = localStorage.getItem("token");
    if (!token) {
      return { status: false, message: "No token found" };
    }

    try {
      const res = await fetch(this.baseUrl + "protected", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        this.setCurrentUserFromToken(token);
        return { status: true, message: "Token is valid" };
      } else {
        return { status: false, message: "Token is invalid" };
      }
    } catch (error) {
      return {
        status: false,
        message: "Token validation error: " + (error as Error).message,
      };
    }
  }

  private setCurrentUserFromToken(token: string) {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = this.base64UrlDecode(payload);
      const decoded = JSON.parse(decodedPayload);
      this.currentUser = decoded;
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  private base64UrlDecode(str: string): string {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return atob(padded);
  }

  async sendResetPassword(userEmail: string, passwordUrl: string) {
    try {
      const result = await fetch(this.baseUrl + "send-confirmation-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          subject: "Reset password",
          text: `To reset your password visit the following link: ${passwordUrl}`,
          html: `
              <div>
                <h1>Reset password link</h1>
                <p>Click <a href="${passwordUrl}">here</a> to reset your password.</p>
              </div>
            `,
        }),
      });

      return result;
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error;
    }
  }

  async isEmailConfirmed() {
    const user = await chatsService.getUserById(this.currentUser._id);
    console.log(user);
    if (user.confirmationToken === null) {
      console.log("Email is confirmed");
      return true;
    }
    return false;
  }
}

export const authService = new AuthService();
