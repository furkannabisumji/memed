// Simple event system to synchronize account updates across components
type EventCallback = () => void;

class AccountEventEmitter {
  private listeners: Record<string, EventCallback[]> = {};

  // Add a listener for a specific event
  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return a function to remove this listener
    return () => {
      this.off(event, callback);
    };
  }

  // Remove a listener
  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event].indexOf(callback);
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  // Emit an event to all listeners
  emit(event: string) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Create a singleton instance
export const accountEvents = new AccountEventEmitter();

// Define event types
export const ACCOUNT_CREATED = 'account:created';
export const ACCOUNT_UPDATED = 'account:updated';
export const ACCOUNT_SELECTED = 'account:selected';
