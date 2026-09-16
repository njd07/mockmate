import { type ReactNode } from "react";
import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";
import { SessionProvider, type User } from "@/store/session";

function ClerkBridgeInner({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const clerk = useClerk();

  const mappedUser: User | null =
    isLoaded && clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "user@example.com",
          name: clerkUser.fullName || clerkUser.username || "Candidate",
          imageUrl: clerkUser.imageUrl,
        }
      : null;

  return (
    <SessionProvider clerkUser={mappedUser} onClerkSignOut={() => clerk.signOut()}>
      {children}
    </SessionProvider>
  );
}

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

  const isConfigured =
    clerkKey &&
    clerkKey.startsWith("pk_") &&
    !clerkKey.includes("your_clerk") &&
    !clerkKey.includes("placeholder") &&
    clerkKey.length > 25;

  // If a valid Clerk publishable key is provided, wrap in ClerkProvider
  if (isConfigured) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ClerkBridgeInner>{children}</ClerkBridgeInner>
      </ClerkProvider>
    );
  }

  // Fallback if Clerk key is not set yet (local developer preview mode)
  return <SessionProvider>{children}</SessionProvider>;
}
