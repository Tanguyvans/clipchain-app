// Script to process refunds
// Run with: npx ts-node scripts/process-refunds.ts

import { createPublicClient, createWalletClient, http, parseUnits } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base USDC
const REFUND_AMOUNT = parseUnits('0.25', 6) // 0.25 USDC (6 decimals)

// ERC20 ABI for transfer
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

interface RefundRequest {
  transactionHash: string
  userWalletAddress: string
  amount: string
  reason: string
  timestamp: string
}

// Load refund requests from your database/logs
const pendingRefunds: RefundRequest[] = [
  {
    transactionHash: '0x261b8574012134cae443bb0d50b35db58074c3b3a61dc5b5751f8dfea62d1e65',
    userWalletAddress: '0x0Ce468027aA18f753B11779e7bfeBC102cFeFF9E',
    amount: '0.25 USDC',
    reason: 'Image-to-video generation failed: Unprocessable Entity',
    timestamp: new Date().toISOString(),
  },
]

async function processRefunds() {
  console.log('🔄 Starting refund processing...')
  console.log(`Found ${pendingRefunds.length} pending refunds`)

  // YOU NEED TO SET THIS - Your wallet private key (the one receiving payments)
  const PRIVATE_KEY = process.env.REFUND_PRIVATE_KEY

  if (!PRIVATE_KEY) {
    console.error('❌ Error: REFUND_PRIVATE_KEY not set in environment')
    console.log('Set it with: export REFUND_PRIVATE_KEY=your_private_key')
    return
  }

  const account = privateKeyToAccount(`0x${PRIVATE_KEY}` as `0x${string}`)

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  })

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  })

  for (const refund of pendingRefunds) {
    try {
      console.log('\n====================================')
      console.log(`Processing refund for ${refund.userWalletAddress}`)
      console.log(`Original transaction: ${refund.transactionHash}`)
      console.log(`Amount: ${refund.amount}`)

      // Send USDC back to user
      const hash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [refund.userWalletAddress as `0x${string}`, REFUND_AMOUNT],
      })

      console.log(`✅ Refund transaction sent: ${hash}`)

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      if (receipt.status === 'success') {
        console.log('✅ Refund confirmed on-chain')
        // TODO: Update your database to mark this refund as processed
      } else {
        console.log('❌ Refund transaction failed')
      }

      console.log('====================================')
    } catch (error) {
      console.error(`❌ Error processing refund for ${refund.userWalletAddress}:`, error)
    }
  }

  console.log('\n✅ Refund processing complete')
}

processRefunds()
