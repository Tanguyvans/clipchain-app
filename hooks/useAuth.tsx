"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useConnect } from "wagmi";

interface UserData {
  fid: number;
  issuedAt?: number;
  expiresAt?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  address?: string;
}

interface AuthContextType {
  token: string | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
  walletAddress: string | undefined;
  isWalletConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      // Connect wallet if not already connected
      if (!isWalletConnected && connectors.length > 0) {
        connect({ connector: connectors[0] });
      }

      // Get the context first (provides instant access to user info)
      const context = await sdk.context;

      // Get the JWT token from Quick Auth
      const { token: authToken } = await sdk.quickAuth.getToken();
      setToken(authToken);

      // Use the token to authenticate with your backend
      const response = await sdk.quickAuth.fetch(`${BACKEND_ORIGIN}/api/auth`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();

      // Merge backend authenticated data with context data
      // Use the Wagmi wallet address (from Base app) as the primary address
      if (data.success && data.user) {
        setUserData({
          ...data.user,
          username: context.user?.username,
          displayName: context.user?.displayName,
          pfpUrl: context.user?.pfpUrl,
          // Use the connected Base wallet address from Wagmi
          address: walletAddress,
        });
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setToken(null);
      setUserData(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isWalletConnected, walletAddress, connectors, connect]);

  const signOut = useCallback(() => {
    setToken(null);
    setUserData(null);
  }, []);

  const isAuthenticated = !!token && !!userData;

  return (
    <AuthContext.Provider
      value={{
        token,
        userData,
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
        walletAddress,
        isWalletConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
