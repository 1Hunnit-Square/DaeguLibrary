import { removeCookie } from './cookieUtil';

export const logoutHelper = () => {
  removeCookie('auth');
  localStorage.setItem('logout', Date.now());
  
  window.location.href = '/login';
};