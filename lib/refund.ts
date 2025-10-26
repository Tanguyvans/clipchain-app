// Refund helper - logs refund requests for manual processing
// In production, you could integrate with a payment processor or smart contract

import fs from 'fs'
import path from 'path'

interface RefundRequest {
  transactionHash: string
  userWalletAddress: string
  amount: string
  reason: string
  timestamp: string
  status: 'pending' | 'processed'
}

const REFUNDS_FILE = path.join(process.cwd(), 'refunds.json')

export async function requestRefund(
  transactionHash: string,
  userWalletAddress: string,
  reason: string
): Promise<void> {
  const refundRequest: RefundRequest = {
    transactionHash,
    userWalletAddress,
    amount: "0.25 USDC",
    reason,
    timestamp: new Date().toISOString(),
    status: 'pending'
  }

  console.log("====================================")
  console.log("🔄 REFUND REQUEST")
  console.log("====================================")
  console.log("Transaction Hash:", transactionHash)
  console.log("User Wallet:", userWalletAddress)
  console.log("Amount:", "0.25 USDC")
  console.log("Reason:", reason)
  console.log("Timestamp:", refundRequest.timestamp)
  console.log("====================================")

  // Save to file for tracking
  try {
    let refunds: RefundRequest[] = []

    // Read existing refunds
    if (fs.existsSync(REFUNDS_FILE)) {
      const data = fs.readFileSync(REFUNDS_FILE, 'utf-8')
      refunds = JSON.parse(data)
    }

    // Add new refund
    refunds.push(refundRequest)

    // Write back to file
    fs.writeFileSync(REFUNDS_FILE, JSON.stringify(refunds, null, 2))
    console.log("💾 Refund request saved to refunds.json")
  } catch (error) {
    console.error("Error saving refund request:", error)
  }

  // TODO: In production, you would:
  // 1. Store this in a database (Postgres, MongoDB, etc.)
  // 2. Trigger an automated refund via smart contract or payment processor
  // 3. Send notification to admin dashboard
  // 4. Email/notify the user about the refund
}
