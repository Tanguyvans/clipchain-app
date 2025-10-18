"use client";
import { useAuth } from "@/hooks/useAuth";
import { AuthButton } from "@/components/auth-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AuthDemo() {
  const { isAuthenticated, userData, token, walletAddress, isWalletConnected } = useAuth();

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Quick Auth Demo</CardTitle>
          <CardDescription>
            Authenticate with Farcaster using Quick Auth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthButton />
        </CardContent>
      </Card>

      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Authentication Details</CardTitle>
            <CardDescription>
              Your authenticated session information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="default">Authenticated</Badge>
              </div>

              {userData?.displayName && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Display Name</span>
                  <p className="text-sm text-muted-foreground">{userData.displayName}</p>
                </div>
              )}

              {userData?.username && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Username</span>
                  <p className="text-sm text-muted-foreground">@{userData.username}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-sm font-medium">Farcaster ID (FID)</span>
                <code className="text-sm bg-muted px-2 py-1 rounded block w-fit">
                  {userData?.fid}
                </code>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Base Wallet</span>
                  {isWalletConnected ? (
                    <Badge variant="default" className="text-xs">Connected</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Not Connected</Badge>
                  )}
                </div>
                {walletAddress ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                    {walletAddress}
                  </code>
                ) : (
                  <p className="text-xs text-muted-foreground">No wallet connected</p>
                )}
              </div>

              {userData?.issuedAt && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Issued At</span>
                  <span className="text-sm text-muted-foreground block">
                    {new Date(userData.issuedAt * 1000).toLocaleString()}
                  </span>
                </div>
              )}

              {userData?.expiresAt && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Expires At</span>
                  <span className="text-sm text-muted-foreground block">
                    {new Date(userData.expiresAt * 1000).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">JWT Token (truncated)</p>
              <code className="text-xs bg-muted p-2 rounded block overflow-hidden text-ellipsis">
                {token?.substring(0, 50)}...
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Sign In with Farcaster" to start authentication</li>
            <li>The SDK obtains a JWT token from Quick Auth</li>
            <li>The token is sent to your backend for verification</li>
            <li>Your backend verifies the token and returns user data</li>
            <li>The app displays your authenticated session</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
