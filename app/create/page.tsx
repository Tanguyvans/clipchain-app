"use client"

import { useRouter } from "next/navigation"
import { CreateModal } from "@/components/create-modal"

export default function Create() {
  const router = useRouter()

  return (
    <CreateModal
      isOpen={true}
      onClose={() => router.back()}
    />
  )
}
