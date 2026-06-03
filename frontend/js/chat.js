/* Chat Module */

import { apiClient, escapeHTML, showNotification } from './utils.js';

let currentConversationId = null;
let currentDocumentId = null;

export function showChat(documentId, documentName) {
  currentDocumentId = documentId;
  document.getElementById('dashboard-page').classList.add('hidden');
  document.getElementById('chat-page').classList.remove('hidden');
  document.getElementById('chat-title').textContent = `Chat - ${documentName}`;
  
  createConversation();
}

async function createConversation() {
  try {
    const response = await apiClient.post('/conversations', {
      documentId: currentDocumentId,
      title: `Chat - ${new Date().toLocaleString()}`,
    });
    currentConversationId = response.id;
    loadChatHistory();
  } catch (error) {
    showNotification('Failed to create conversation', 'error');
  }
}

async function loadChatHistory() {
  if (!currentConversationId) return;

  try {
    const response = await apiClient.get(`/conversations/${currentConversationId}`);
    const messagesContainer = document.getElementById('messages-container');
    
    if (response.messages && response.messages.length > 0) {
      messagesContainer.innerHTML = response.messages
        .map((msg) => createMessageElement(msg))
        .join('');
    } else {
      messagesContainer.innerHTML = '<p class="empty-state">Start by asking a question</p>';
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    showNotification('Failed to load chat history', 'error');
  }
}

function createMessageElement(msg) {
  const citations = msg.citations
    ? msg.citations
        .map((c) => `<a href="#" class="citation-link">Page ${c.pageNumber}</a>`)
        .join('')
    : '';

  return `
    <div class="message ${msg.role}">
      <div class="message-content">
        ${escapeHTML(msg.content)}
        ${citations ? `<div class="message-citations">${citations}</div>` : ''}
      </div>
    </div>
  `;
}

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('question-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    sendMessage();
  }
});

async function sendMessage() {
  const input = document.getElementById('question-input');
  const question = input.value.trim();

  if (!question) {
    showNotification('Please enter a question', 'info');
    return;
  }

  if (!currentConversationId) {
    showNotification('No active conversation', 'error');
    return;
  }

  input.value = '';
  document.getElementById('loading-indicator').classList.remove('hidden');

  try {
    const response = await apiClient.post('/chat', {
      conversationId: currentConversationId,
      question,
    });

    const messagesContainer = document.getElementById('messages-container');
    
    // Add user message
    messagesContainer.innerHTML += createMessageElement({
      role: 'user',
      content: question,
    });

    // Add assistant message
    messagesContainer.innerHTML += createMessageElement({
      role: 'assistant',
      content: response.answer,
      citations: response.citations,
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  } catch (error) {
    showNotification('Failed to send message: ' + error.message, 'error');
  } finally {
    document.getElementById('loading-indicator').classList.add('hidden');
  }
}

document.getElementById('close-chat').addEventListener('click', () => {
  currentConversationId = null;
  currentDocumentId = null;
  document.getElementById('chat-page').classList.add('hidden');
  document.getElementById('dashboard-page').classList.remove('hidden');
});
