"use client"

import { ProfilePage } from "@/components/profile-page"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface VideoGridItem {
  id: string
  videoUrl: string
  likes: number
  comments: number
  shares: number
}

interface UserData {
  fid: number
  username: string
  displayName: string
  bio: string
  avatar: string
  verified: boolean
  followerCount: number
  followingCount: number
  videoCount: number
  recastCount: number
  videos: VideoGridItem[]
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        // TODO: Get actual logged-in user's FID or username
        // For now, using tanguyvans as default
        const response = await fetch("/api/user?username=tanguyvans")
        const data = await response.json()

        if (data.success && data.user) {
          setUserData(data.user)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="text-sm text-white">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <ProfilePage
      username={userData?.username || "tanguyvans"}
      avatar={userData?.avatar}
      bio={userData?.bio || "AI enthusiast | Building the future"}
      displayName={userData?.displayName}
      verified={userData?.verified}
      followerCount={userData?.followerCount}
      followingCount={userData?.followingCount}
      videoCount={userData?.videoCount}
      recastCount={userData?.recastCount}
      videos={userData?.videos || []}
    />
  )
}
