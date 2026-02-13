export const checkAuthToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check cookies
  if (document.cookie.includes('token=')) return true;
  
  // Check localStorage
  if (localStorage.getItem('token')) return true;
  
  // Check sessionStorage
  if (sessionStorage.getItem('token')) return true;
  
  return false;
};