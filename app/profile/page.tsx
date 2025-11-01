"use client"

import { ProfilePage } from "@/components/profile-page"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

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
  avatar: string
  verified: boolean
  videoCount: number
  recastCount: number
  videos: VideoGridItem[]
}

export default function Profile() {
  const { walletAddress, userData: authUserData } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [streakData, setStreakData] = useState<{
    current: number
    freeGenerations: number
  }>({ current: 0, freeGenerations: 0 })

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true)
      try {
        let queryParam = ""

        // Try to use wallet address first (from Base app)
        if (walletAddress) {
          queryParam = `address=${walletAddress}`
          console.log("Fetching profile by wallet address:", walletAddress)
        }
        // Fallback to username from auth context
        else if (authUserData?.username) {
          queryParam = `username=${authUserData.username}`
          console.log("Fetching profile by username:", authUserData.username)
        }
        // Last resort: use default username
        else {
          queryParam = "username=tanguyvans"
          console.log("Using default username: tanguyvans")
        }

        const response = await fetch(`/api/user?${queryParam}`)
        const data = await response.json()

        if (data.success && data.user) {
          console.log("User data received:", data.user)
          setUserData(data.user)
        } else {
          console.error("Failed to fetch user:", data.error)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [walletAddress, authUserData])

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      if (!authUserData?.fid) return

      try {
        const response = await fetch(`/api/user/streak?fid=${authUserData.fid}`)
        const data = await response.json()

        if (data.success && data.streak) {
          setStreakData({
            current: data.streak.current || 0,
            freeGenerations: data.streak.freeGenerations || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching streak:", error)
      }
    }

    fetchStreak()
  }, [authUserData?.fid])

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

  const handleStreakUpdate = (newStreak: number, freeGens: number) => {
    setStreakData({
      current: newStreak,
      freeGenerations: freeGens,
    })
  }

  return (
    <ProfilePage
      username={userData?.username || "tanguyvans"}
      avatar={userData?.avatar}
      displayName={userData?.displayName}
      verified={userData?.verified}
      videoCount={userData?.videoCount || 0}
      recastCount={userData?.recastCount || 0}
      videos={userData?.videos || []}
      currentStreak={streakData.current}
      freeGenerations={streakData.freeGenerations}
      userFid={authUserData?.fid}
      onStreakUpdate={handleStreakUpdate}
    />
  )
}
