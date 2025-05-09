import { useState, useCallback } from 'react';
import { useSignMessage, useConnect } from 'wagmi';

// This custom hook provides a way to sign messages that works properly with ConnectKit
export function useConnectKitSign() {
  const [isSigning, setIsSigning] = useState(false);
  const { signMessageAsync } = useSignMessage();
  const { connectors } = useConnect();

  // This function ensures the ConnectKit modal is properly displayed
  const signWithConnectKit = useCallback(
    async (message: string) => {
      try {
        setIsSigning(true);
        
        // First, ensure the DOM is fully loaded and stable
        // This is crucial for ConnectKit's modal system
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force a browser repaint to ensure UI elements are properly rendered
        // This can help with modal visibility issues
        document.body.getBoundingClientRect();
        
        // Try multiple approaches to sign the message
        try {
          // First try with Wagmi's signMessageAsync which should work with any wallet
          const signature = await signMessageAsync({ message });
          setIsSigning(false);
          return signature;
        } catch (wagmiError) {
          console.warn('Failed to sign with Wagmi, trying alternative methods:', wagmiError);
          
          // If that fails, try to use the ConnectKit connector directly
          // This approach doesn't force the user to use MetaMask
          const connectKitConnector = connectors.find(c => c.name === 'ConnectKit');
          
          if (connectKitConnector) {
            try {
              // Add another delay to ensure the modal is fully visible
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Get the provider from the connector
              const provider = await connectKitConnector.getProvider();
              
              // Try to sign the message with the provider
              // Cast provider to any to avoid TypeScript errors
              const ethProvider = provider as any;
              if (ethProvider && typeof ethProvider.request === 'function') {
                const accounts = await ethProvider.request({ method: 'eth_accounts' });
                const signature = await ethProvider.request({
                  method: 'personal_sign',
                  params: [message, accounts[0]],
                });
                
                setIsSigning(false);
                return signature;
              }
            } catch (connectorError) {
              console.error('Failed to sign with ConnectKit connector:', connectorError);
              // Continue to the next approach
            }
          }
          
          // If all else fails, throw the original error
          throw wagmiError;
        }
      } catch (error) {
        setIsSigning(false);
        throw error;
      }
    },
    [signMessageAsync, connectors]
  );

  return {
    signWithConnectKit,
    isSigning
  };
}
