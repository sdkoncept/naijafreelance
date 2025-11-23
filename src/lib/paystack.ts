// Paystack payment integration utilities

export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // in kobo (smallest currency unit)
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  onSuccess?: (response: any) => void;
  onClose?: () => void;
}

// Initialize Paystack payment
export const initializePaystack = (config: PaystackConfig) => {
  if (typeof window === 'undefined' || !(window as any).PaystackPop) {
    throw new Error('Paystack script not loaded');
  }

  const handler = (window as any).PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount,
    ref: config.reference,
    metadata: config.metadata || {},
    callback: (response: any) => {
      if (config.onSuccess) {
        config.onSuccess(response);
      }
    },
    onClose: () => {
      if (config.onClose) {
        config.onClose();
      }
    },
  });

  handler.openIframe();
};

// Load Paystack script dynamically
export const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is not defined'));
      return;
    }

    // Check if already loaded
    if ((window as any).PaystackPop) {
      resolve();
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.defer = true;
    
    // Add timeout
    const timeout = setTimeout(() => {
      reject(new Error('Paystack script loading timeout'));
    }, 30000); // 30 seconds timeout

    script.onload = () => {
      clearTimeout(timeout);
      // Wait a bit for PaystackPop to be available
      const checkPaystack = setInterval(() => {
        if ((window as any).PaystackPop) {
          clearInterval(checkPaystack);
          resolve();
        }
      }, 100);
      
      // Fallback timeout
      setTimeout(() => {
        clearInterval(checkPaystack);
        if ((window as any).PaystackPop) {
          resolve();
        } else {
          reject(new Error('PaystackPop not available after script load'));
        }
      }, 5000);
    };
    
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load Paystack script'));
    };
    
    document.head.appendChild(script);
  });
};

// Convert Naira to kobo (Paystack uses kobo)
export const nairaToKobo = (naira: number): number => {
  return Math.round(naira * 100);
};

// Convert kobo to Naira
export const koboToNaira = (kobo: number): number => {
  return kobo / 100;
};

