# Quick Auth Integration

This project includes Farcaster Quick Auth for instant, secure user authentication.

## Overview

Quick Auth provides instant authentication by leveraging Farcaster's identity system - no passwords, email verification, or complex OAuth flows required.

## What's Implemented

### Backend (Already Set Up)

- **Auth Route**: [app/api/auth/route.ts](app/api/auth/route.ts)
  - Verifies JWT tokens from Quick Auth
  - Returns authenticated user data (FID, issuance time, expiration)
  - Handles domain verification for security

### Frontend (New)

- **Auth Hook**: [hooks/useAuth.tsx](hooks/useAuth.tsx)
  - `useAuth()` - Access authentication state and methods
  - `AuthProvider` - Context provider for auth state

- **Auth Component**: [components/auth-button.tsx](components/auth-button.tsx)
  - Ready-to-use Sign In/Sign Out button
  - Displays authenticated user information

- **Demo Page**: [app/auth-demo/page.tsx](app/auth-demo/page.tsx)
  - Example implementation showing how to use auth
  - Visit `/auth-demo` to test authentication

## Usage

### Basic Implementation

```tsx
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { isAuthenticated, userData, signIn, signOut } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={signIn}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, FID: {userData?.fid}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Using the Auth Button Component

```tsx
import { AuthButton } from "@/components/auth-button";

export function MyPage() {
  return (
    <div>
      <h1>My App</h1>
      <AuthButton />
    </div>
  );
}
```

### Protecting Routes

```tsx
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

### Making Authenticated API Requests

```tsx
import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { token } = useAuth();

  async function fetchProtectedData() {
    const response = await fetch("/api/protected-route", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  }

  // Use fetchProtectedData...
}
```

## API Reference

### `useAuth()` Hook

Returns:
- `token: string | null` - JWT token from Quick Auth
- `userData: UserData | null` - Authenticated user information
  - `fid: number` - Farcaster ID
  - `issuedAt?: number` - Token issuance timestamp
  - `expiresAt?: number` - Token expiration timestamp (1 hour from issuance)
- `isAuthenticated: boolean` - Whether user is currently authenticated
- `isLoading: boolean` - Whether authentication is in progress
- `signIn: () => Promise<void>` - Function to initiate authentication
- `signOut: () => void` - Function to sign out

## How It Works

1. User clicks "Sign In"
2. `sdk.quickAuth.getToken()` prompts user to sign with their Farcaster account
3. Quick Auth Server verifies the signature and returns a JWT
4. Your frontend sends the JWT to your backend at `/api/auth`
5. Your backend verifies the JWT and returns trusted user data
6. The auth state is stored in React context for easy access

## Security

- JWTs are verified server-side using the `@farcaster/quick-auth` package
- Domain verification ensures tokens are only valid for your app
- Tokens expire after 1 hour
- Sensitive operations should always verify tokens on the backend

## Testing

Visit `/auth-demo` in your app to see a working example and test the authentication flow.

## Environment Variables

Make sure these are set:

```env
NEXT_PUBLIC_URL=https://your-domain.com
# OR
VERCEL_PROJECT_PRODUCTION_URL=your-domain.vercel.app
```

The backend uses these to verify JWT domain matching.
