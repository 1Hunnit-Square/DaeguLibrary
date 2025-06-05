import { API_SERVER_HOST } from "../api/config";
import { API_ENDPOINTS } from "../api/config";

export const fileSize = (bytes) => {
    if(bytes === null) return "";
  if (bytes === 0) return '(0 Bytes)';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  return `(${size.toFixed(2)} ${sizes[i]})`;
}

export const imgReplace = (content) => {
    if(!content){
    return;
  }
    const replaced = content.replace(/image:\/\//g,`${API_SERVER_HOST}${API_ENDPOINTS.view}/`);
  return replaced;
}