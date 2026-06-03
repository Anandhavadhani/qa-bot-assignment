/* Utility Functions */

export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    border-radius: 8px;
    background-color: ${
      type === 'error'
        ? '#fee2e2'
        : type === 'success'
          ? '#dcfce7'
          : '#dbeafe'
    };
    color: ${
      type === 'error'
        ? '#991b1b'
        : type === 'success'
          ? '#166534'
          : '#0c4a6e'
    };
    z-index: 9999;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

export function getStoredToken() {
  return localStorage.getItem('accessToken');
}

export function setStoredToken(token, refreshToken) {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearStoredToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
