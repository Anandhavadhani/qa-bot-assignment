/* Document Management Module */

import { apiClient, formatFileSize, formatDate, showNotification } from './utils.js';
import { showChat } from './chat.js';

const uploadDropZone = document.getElementById('upload-drop-zone');
const fileInput = document.getElementById('file-input');
const documentsList = document.getElementById('documents-list');

uploadDropZone.addEventListener('dragover', handleDragOver);
uploadDropZone.addEventListener('dragleave', handleDragLeave);
uploadDropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDragOver(e) {
  e.preventDefault();
  uploadDropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadDropZone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  uploadDropZone.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect({ target: { files } });
  }
}

async function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.uploadFile('/documents', file);
    showNotification('Document uploaded successfully!', 'success');
    loadDocuments();
  } catch (error) {
    showNotification('Upload failed: ' + error.message, 'error');
  }
}

export async function loadDocuments() {
  try {
    const response = await apiClient.get('/documents');
    const documents = response.documents || [];

    if (documents.length === 0) {
      documentsList.innerHTML = '<p class="empty-state">No documents uploaded yet</p>';
      return;
    }

    documentsList.innerHTML = documents
      .map(
        (doc) => `
      <div class="document-card">
        <h3>${doc.filename}</h3>
        <div class="document-meta">
          <p>Size: ${formatFileSize(doc.fileSize)}</p>
          <p>Uploaded: ${formatDate(doc.createdAt)}</p>
        </div>
        <span class="document-status status-${doc.processingStatus}">
          ${doc.processingStatus.toUpperCase()}
        </span>
        <div class="document-actions">
          <button class="btn btn-primary" onclick="window.openChat('${doc.documentId}', '${doc.filename}')">
            Chat
          </button>
          <button class="btn btn-danger" onclick="window.deleteDocument('${doc.documentId}')">
            Delete
          </button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    showNotification('Failed to load documents', 'error');
  }
}

export async function deleteDocument(documentId) {
  if (!confirm('Are you sure you want to delete this document?')) return;

  try {
    await apiClient.delete(`/documents/${documentId}`);
    showNotification('Document deleted successfully', 'success');
    loadDocuments();
  } catch (error) {
    showNotification('Failed to delete document', 'error');
  }
}

window.deleteDocument = deleteDocument;
window.openChat = (docId, docName) => {
  showChat(docId, docName);
};

// Load documents on page load
window.addEventListener('load', loadDocuments);
