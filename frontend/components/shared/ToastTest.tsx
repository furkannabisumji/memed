"use client";
import { useState } from "react";
import { useCustomToast } from "../ui/custom-toast";
import { Button } from "../ui/button";

export function ToastTest() {
  const [count, setCount] = useState(0);

  const { success, error, info, warning } = useCustomToast();

  const showToast = () => {
    const id = Date.now();
    setCount(count + 1);
    
    // Show different types of toasts based on count
    if (count % 4 === 0) {
      success(`Success Toast #${count + 1}`, {
        description: `This is success toast #${count + 1}`,
        duration: 5000,
      });
    } else if (count % 4 === 1) {
      error(`Error Toast #${count + 1}`, {
        description: `This is error toast #${count + 1}`,
        duration: 5000,
      });
    } else if (count % 4 === 2) {
      info(`Info Toast #${count + 1}`, {
        description: `This is info toast #${count + 1}`,
        duration: 5000,
      });
    } else {
      warning(`Warning Toast #${count + 1}`, {
        description: `This is warning toast #${count + 1}`,
        duration: 5000,
      });
    }
    
    console.log(`Toast #${count + 1} triggered with ID: ${id}`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold mb-2">Toast Tester</h3>
      <p className="text-sm text-gray-600 mb-4">Click the button to test toast notifications</p>
      <Button 
        onClick={showToast} 
        className="w-full"
      >
        Show Test Toast
      </Button>
    </div>
  );
}
