/**
 * Create Comment functionality for submitting new comments
 */
/**
 * Submits a new comment to the API
 * @param {string} commentText - The comment text to submit
 * @returns {Promise<any>} The response from the API
 */
async function submitComment(commentText, url, domain, userCookieName) {
  try {
    // Only allow submissions if we are on production domain
    if (window.location.hostname !== domain) {
      throw new Error('Comments can only be submitted from the official resume website');
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: commentText,
        user: getCookie(userCookieName) || 'anonymous',
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw error;
  }
}

/**
 * Handles form submission
 * @param {Event} event - The form submit event
 */
async function handleCommentSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const commentInput = form.querySelector(currentLang === 'en' ? '#comment-text' : '#comment-text-es');
  const submitButton = form.querySelector('#submit-comment-btn');
  const messageDiv = form.querySelector(currentLang === 'en' ? '#comment-message' : '#comment-message-es');

  const commentText = commentInput.value.trim();

  // Validate input
  if (!commentText) {
    showMessage(messageDiv, 'Please enter a comment before submitting.', 'warning');
    return;
  }

  if (commentText.length < 10) {
    showMessage(messageDiv, 'Comment must be at least 10 characters long.', 'warning');
    return;
  }

  if (commentText.length > 500) {
    showMessage(messageDiv, 'Comment must be less than 500 characters long.', 'warning');
    return;
  }

  // Show loading state
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';
  showMessage(messageDiv, '', 'info');

  try {
    const config = await window.ConfigLoader.waitForConfig();
    if (!config || !config.API?.COMMENT_URL || !config.DOMAIN?.PRODUCTION || !config.COOKIES?.USER) {
      throw new Error('Configuration not loaded properly.');
    }
    await submitComment(commentText, config.API.COMMENT_URL, config.DOMAIN.PRODUCTION, config.COOKIES.USER);

    // Show success message
    showMessage(messageDiv, 'Comment submitted successfully! It will be reviewed before appearing on the site.', 'success');

    // Clear the form
    commentInput.value = '';

    // Reset character counter
    updateCharacterCounter(commentInput);

  } catch (error) {
    // Show error message
    showMessage(messageDiv, `Failed to submit comment: ${error.message}`, 'danger');
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.innerHTML = '<span class="material-icons me-1">send</span>Submit Comment';
  }
}

/**
 * Shows a message in the message div
 * @param {HTMLElement} messageDiv - The message container
 * @param {string} message - The message text
 * @param {string} type - The message type (success, warning, danger, info)
 */
function showMessage(messageDiv, message, type) {
  if (!messageDiv) return;

  messageDiv.innerHTML = '';

  if (message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} d-flex align-items-center`;
    alertDiv.setAttribute('role', 'alert');

    let icon = 'info';
    switch (type) {
      case 'success':
        icon = 'check_circle';
        break;
      case 'warning':
        icon = 'warning';
        break;
      case 'danger':
        icon = 'error';
        break;
      case 'info':
        icon = 'info';
        break;
    }

    alertDiv.innerHTML = `
      <span class="material-icons me-2">${icon}</span>
      <div>${message}</div>
    `;

    messageDiv.appendChild(alertDiv);
  }
}

/**
 * Updates the character counter
 * @param {HTMLElement} textarea - The textarea element
 */
function updateCharacterCounter(textarea) {
  const counter = document.getElementById('character-counter');
  if (counter) {
    const currentLength = textarea.value.length;
    const maxLength = 500;
    counter.textContent = `${currentLength}/${maxLength} characters`;

    // Change color based on usage
    if (currentLength > maxLength * 0.9) {
      counter.className = 'text-warning small';
    } else if (currentLength > maxLength * 0.8) {
      counter.className = 'text-info small';
    } else {
      counter.className = 'text-muted small';
    }
  }
}

/**
 * Renders the comment form in the create-comment section
 */
function renderCommentForm() {
  const createCommentSection = document.getElementById('create-comment');

  if (!createCommentSection) {
    console.error('Create comment section not found');
    return;
  }

  // Clear existing content
  createCommentSection.innerHTML = '';

  // Create form container
  const formContainer = document.createElement('div');
  formContainer.className = 'container py-5';

  // Add multilingual content
  const formHTML = `
    <!-- English -->
    <div lang="en">
      <h2><span class="material-icons accent">add_comment</span> Leave a Comment</h2>
      <p class="mb-4">Share your thoughts about this resume! Comments are moderated and will appear after approval.</p>
      
      <form id="comment-form" class="comment-form">
        <div class="mb-3">
          <label for="comment-text" class="form-label">Your Comment</label>
          <textarea 
            class="form-control" 
            id="comment-text" 
            rows="4" 
            placeholder="Write your comment here..."
            maxlength="500"
            required
          ></textarea>
          <div id="character-counter" class="text-muted small mt-1">0/500 characters</div>
        </div>
        
        <div id="comment-message" class="mb-3"></div>
        
        <button type="submit" id="submit-comment-btn" class="btn btn-primary">
          <span class="material-icons me-1">send</span>
          Submit Comment
        </button>
      </form>
    </div>

    <!-- Spanish -->
    <div lang="es">
      <h2><span class="material-icons accent">add_comment</span> Deja un Comentario</h2>
      <p class="mb-4">¡Comparte tus pensamientos sobre este currículum! Los comentarios son moderados y aparecerán después de su aprobación.</p>
      
      <form id="comment-form-es" class="comment-form">
        <div class="mb-3">
          <label for="comment-text-es" class="form-label">Tu Comentario</label>
          <textarea 
            class="form-control" 
            id="comment-text-es" 
            rows="4" 
            placeholder="Escribe tu comentario aquí..."
            maxlength="500"
            required
          ></textarea>
          <div id="character-counter-es" class="text-muted small mt-1">0/500 caracteres</div>
        </div>
        
        <div id="comment-message-es" class="mb-3"></div>
        
        <button type="submit" id="submit-comment-btn-es" class="btn btn-primary">
          <span class="material-icons me-1">send</span>
          Enviar Comentario
        </button>
      </form>
    </div>
  `;

  formContainer.innerHTML = formHTML;
  createCommentSection.appendChild(formContainer);

  // Add event listeners for both forms
  setupFormEventListeners('comment-form', 'comment-text', 'character-counter');
  setupFormEventListeners('comment-form-es', 'comment-text-es', 'character-counter-es');
}

/**
 * Sets up event listeners for a form
 * @param {string} formId - The form ID
 * @param {string} textareaId - The textarea ID
 * @param {string} counterId - The character counter ID
 */
function setupFormEventListeners(formId, textareaId, counterId) {
  const form = document.getElementById(formId);
  const textarea = document.getElementById(textareaId);

  if (form && textarea) {
    // Add form submit listener
    form.addEventListener('submit', handleCommentSubmit);

    // Add textarea input listener for character counter
    textarea.addEventListener('input', () => {
      const counter = document.getElementById(counterId);
      if (counter) {
        const currentLength = textarea.value.length;
        const maxLength = 500;
        const text = counterId.includes('es') ? 'caracteres' : 'characters';
        counter.textContent = `${currentLength}/${maxLength} ${text}`;

        // Change color based on usage
        if (currentLength > maxLength * 0.9) {
          counter.className = 'text-warning small';
        } else if (currentLength > maxLength * 0.8) {
          counter.className = 'text-info small';
        } else {
          counter.className = 'text-muted small';
        }
      }
    });

    // Initialize character counter
    const inputEvent = document.createEvent('Event');
    inputEvent.initEvent('input', true, true);
    textarea.dispatchEvent(inputEvent);
  }
}

// Initialize the comment form when the page loads
document.addEventListener('DOMContentLoaded', renderCommentForm);

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    submitComment,
    renderCommentForm,
    handleCommentSubmit,
    showMessage,
    updateCharacterCounter
  };
}