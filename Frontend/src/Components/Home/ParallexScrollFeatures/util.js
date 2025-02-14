// utils/cn.js
export function cn(...inputs) {
    // Simple className merger function
    return inputs.filter(Boolean).join(' ');
  }
  