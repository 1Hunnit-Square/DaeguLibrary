import { API_SERVER_HOST } from "../api/config";
import { API_ENDPOINTS } from "../api/config";
import * as cheerio from 'cheerio';

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
    return "";
  }
    const replaced = content.replace(/image:\/\//g,`${API_SERVER_HOST}${API_ENDPOINTS.view}/`);
  return replaced;
}

export const contentReplace = (content) => {
    if(!content){
    return "";
  }
    const target = `${API_SERVER_HOST}${API_ENDPOINTS.view}/`;
    const replaced = content.replaceAll(target, "image://");
  return replaced;
}


export const emailReplace = (content, rewrite = false) => {
    if(!content){
    return "";
  }
    const replaced = content.replace(/image:\/\//g,`${API_SERVER_HOST}${API_ENDPOINTS.mail}/view/`);
    if(rewrite){
      const $ = cheerio.load(replaced);
      $('.dglib-tracker').remove();
      return $.html();
    }
  return replaced;
}

export const escapeHTML = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}


export const getMimeType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();

  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    txt: 'text/plain',
    html: 'text/html',
    json: 'application/json',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    zip: 'application/zip',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    // 필요에 따라 추가 가능
  };

  return mimeTypes[ext] || 'application/octet-stream';
};
