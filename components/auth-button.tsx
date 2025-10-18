"use client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AuthButton() {
  const { isAuthenticated, userData, signIn, signOut, isLoading, walletAddress, isWalletConnected } = useAuth();

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={signIn} className="w-full">
        Sign In with Farcaster
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Authenticated
          {isWalletConnected && <Badge variant="default">Wallet Connected</Badge>}
        </CardTitle>
        <CardDescription>You are signed in with Farcaster</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {userData?.displayName && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Name:</span> {userData.displayName}
            </p>
          )}
          {userData?.username && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Username:</span> @{userData.username}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">FID:</span> {userData?.fid}
          </p>
          {walletAddress && (
            <div className="space-y-1">
              <p className="text-sm font-semibold">Base Wallet Address:</p>
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {walletAddress}
              </code>
            </div>
          )}
          {userData?.issuedAt && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Signed in:</span>{" "}
              {new Date(userData.issuedAt * 1000).toLocaleString()}
            </p>
          )}
          {userData?.expiresAt && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Expires:</span>{" "}
              {new Date(userData.expiresAt * 1000).toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={signOut} variant="outline" className="w-full">
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
