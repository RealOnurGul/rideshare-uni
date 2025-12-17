"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useRequireOnboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip if loading or not authenticated
    if (status === "loading") return;
    if (status === "unauthenticated") return;

    // Skip if already on onboarding page
    if (pathname === "/onboarding") return;

    // If authenticated but no university set, redirect to onboarding
    if (session?.user && !session.user.university) {
      router.push("/onboarding");
    }
  }, [session, status, router, pathname]);

  return {
    isLoading: status === "loading",
    needsOnboarding: status === "authenticated" && !session?.user?.university,
  };
}

export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { isLoading, needsOnboarding } = useRequireOnboarding();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}




