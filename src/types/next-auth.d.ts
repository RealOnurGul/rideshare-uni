import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      university?: string | null;
    };
  }

  interface User {
    university?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
  }
}

