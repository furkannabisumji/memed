import { createWalletClient, custom, http } from 'viem';
import { mainnet } from 'viem/chains';

/**
 * Signs a message using a compatible approach with ConnectKit
 * This helps prevent the "Family integrated modal is not visible" error
 */
export async function signMessageWithConnectKit(message: string, address: string): Promise<string> {
  try {
    // First, ensure any existing modals are fully rendered
    // This is important for ConnectKit's modal system
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the wagmi config from the window object
    const wagmiConfig = (window as any).__WAGMI_CONFIG;
    
    if (!wagmiConfig) {
      throw new Error("Wagmi config not found. Please ensure ConnectKit is properly initialized.");
    }
    
    // Create a function to sign the message that works with ConnectKit
    const signMessage = async () => {
      // Use the ConnectKit's signMessage function if available
      if (wagmiConfig.signMessage) {
        return await wagmiConfig.signMessage({ message, account: address });
      }
      
      // Fallback to using the window.ethereum provider
      const ethereum = (window as any).ethereum;
      
      if (!ethereum) {
        throw new Error("No ethereum provider found. Please install a wallet extension.");
      }
      
      // Create a wallet client using viem
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(ethereum)
      });
      
      // Sign the message using the wallet client
      return await walletClient.signMessage({
        account: address as `0x${string}`,
        message,
      });
    };
    
    // Try to sign the message with a retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
    
    while (attempts < maxAttempts) {
      try {
        // Add increasing delays between attempts
        if (attempts > 0) {
          await new Promise(resolve => setTimeout(resolve, 300 * attempts));
        }
        
        const signature = await signMessage();
        return signature;
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempts + 1} failed:`, error);
        attempts++;
      }
    }
    
    // If all attempts fail, throw the last error
    throw lastError;
  } catch (error) {
    console.error("Error signing message with ConnectKit:", error);
    throw error;
  }
}
