import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        userId?: string;
        accessToken?: string;
        refreshToken?: string;
        realmId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        accessToken?: string;
        refreshToken?: string;
        realmId?: string;
    }
}
