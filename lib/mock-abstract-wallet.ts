// Mock Abstract wallet service for development
export interface MockWalletData {
  address: string | null
  balance: string | null
  chainId: number | null
  isConnected: boolean
}

class MockAbstractWallet {
  private walletData: MockWalletData = {
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
  }

  private listeners: Array<(data: MockWalletData) => void> = []

  // Simulate wallet connection
  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock wallet data
      const mockAddress = "0x" + Math.random().toString(16).substr(2, 40)
      const mockBalance = (Math.random() * 10).toFixed(4)

      this.walletData = {
        address: mockAddress,
        balance: mockBalance,
        chainId: 11124, // Abstract Testnet
        isConnected: true,
      }

      // Notify listeners
      this.notifyListeners()

      console.log("🔗 Mock Abstract wallet connected:", this.walletData)
      return { success: true }
    } catch (error) {
      console.error("❌ Mock wallet connection failed:", error)
      return { success: false, error: "Connection failed" }
    }
  }

  // Simulate wallet disconnection
  async disconnect(): Promise<void> {
    this.walletData = {
      address: null,
      balance: null,
      chainId: null,
      isConnected: false,
    }

    this.notifyListeners()
    console.log("🔌 Mock Abstract wallet disconnected")
  }

  // Get current wallet data
  getWalletData(): MockWalletData {
    return { ...this.walletData }
  }

  // Subscribe to wallet changes
  subscribe(callback: (data: MockWalletData) => void): () => void {
    this.listeners.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.getWalletData()))
  }

  // Simulate balance refresh
  async refreshBalance(): Promise<void> {
    if (this.walletData.isConnected) {
      // Simulate slight balance change
      const currentBalance = Number.parseFloat(this.walletData.balance || "0")
      const newBalance = (currentBalance + (Math.random() - 0.5) * 0.001).toFixed(4)

      this.walletData.balance = newBalance
      this.notifyListeners()

      console.log("💰 Mock balance refreshed:", newBalance)
    }
  }
}

export const mockAbstractWallet = new MockAbstractWallet()
