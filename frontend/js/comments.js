/**
 * Comments functionality for loading and displaying comments from API
 */
/**
 * Fetches comments from the API
 * @returns {Promise<any>} The comments data
 */
async function fetchComments(url, domain) {
  try {
    // Only to this if we are on production domain
    if (window.location.hostname !== domain) {
      return []; // Return empty array if not on the correct domain
    }
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

/**
 * Renders comments in the comments section
 * @param {any} commentsData - The comments data to render
 */
function renderComments(commentsData) {
  const commentsSection = document.getElementById('comments');

  if (!commentsSection) {
    console.error('Comments section not found');
    return;
  }

  // Clear existing content
  commentsSection.innerHTML = '';

  try {
    // Create comments container
    const commentsContainer = document.createElement('div');
    commentsContainer.className = 'container py-5';

    // Add title
    const title = document.createElement('h2');
    title.innerHTML = '<span class="material-icons accent">comment</span> Comments';
    commentsContainer.appendChild(title);

    // Handle different data structures
    let comments = [];

    if (Array.isArray(commentsData)) {
      comments = commentsData;
    } else if (commentsData.comments && Array.isArray(commentsData.comments)) {
      comments = commentsData.comments;
    } else if (typeof commentsData === 'object') {
      // If it's an object, display it as a single comment
      comments = [commentsData];
    }

    if (comments.length === 0) {
      const noComments = document.createElement('p');
      noComments.className = 'text-muted';
      noComments.textContent = 'No comments available.';
      commentsContainer.appendChild(noComments);
    } else {
      // Create comments list
      const commentsList = document.createElement('div');
      commentsList.className = 'comments-list';

      comments.forEach((comment, index) => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment mb-3 p-3 border rounded';

        // Handle different comment structures
        let commentContent = '';

        if (typeof comment === 'string') {
          commentContent = comment;
        } else if (comment.body || comment.content || comment.message) {
          commentContent = comment.body || comment.content || comment.message;
        } else if (comment.text) {
          commentContent = comment.text;
        } else {
          // If it's an object without recognized fields, stringify it
          commentContent = JSON.stringify(comment, null, 2);
        }

        // Add comment header if we have author/date info
        if (comment.author || comment.date || comment.timestamp) {
          const commentHeader = document.createElement('div');
          commentHeader.className = 'comment-header mb-2 text-muted small';

          let headerText = '';
          if (comment.author) headerText += `By: ${comment.author}`;
          if (comment.date || comment.timestamp) {
            const date = comment.date || comment.timestamp;
            if (headerText) headerText += ' | ';
            headerText += `Date: ${date}`;
          }

          commentHeader.textContent = headerText;
          commentDiv.appendChild(commentHeader);
        }

        // Add comment content
        const commentText = document.createElement('div');
        commentText.className = 'comment-content';

        // If content looks like JSON, format it nicely
        if (commentContent.startsWith('{') || commentContent.startsWith('[')) {
          const preElement = document.createElement('pre');
          preElement.className = 'bg-light p-2 rounded';
          preElement.style.fontSize = '0.9em';
          preElement.textContent = commentContent;
          commentText.appendChild(preElement);
        } else {
          commentText.textContent = commentContent;
        }

        commentDiv.appendChild(commentText);
        commentsList.appendChild(commentDiv);
      });

      commentsContainer.appendChild(commentsList);
    }

    commentsSection.appendChild(commentsContainer);

  } catch (error) {
    console.error('Error rendering comments:', error);
    commentsSection.innerHTML = `
      <div class="container py-5">
        <h2><span class="material-icons accent">comment</span> Comments</h2>
        <div class="alert alert-danger">
          <span class="material-icons">error</span>
          Error displaying comments: ${error.message}
        </div>
      </div>
    `;
  }
}

/**
 * Shows loading state in comments section
 */
function showCommentsLoading() {
  const commentsSection = document.getElementById('comments');
  if (commentsSection) {
    commentsSection.innerHTML = `
      <div class="container py-5">
        <h2><span class="material-icons accent">comment</span> Comments</h2>
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          <span>Loading comments...</span>
        </div>
      </div>
    `;
  }
}

/**
 * Shows error state in comments section
 */
function showCommentsError(error) {
  const commentsSection = document.getElementById('comments');
  if (commentsSection) {
    commentsSection.innerHTML = `
      <div class="container py-5">
        <h2><span class="material-icons accent">comment</span> Comments</h2>
        <div class="alert alert-danger">
          <span class="material-icons">error</span>
          Failed to load comments: ${error.message}
        </div>
        <button class="btn btn-outline-danger" onclick="loadComments()">
          <span class="material-icons">refresh</span> Try Again
        </button>
      </div>
    `;
  }
}

/**
 * Main function to load and display comments
 */
async function loadComments() {
  try {
    showCommentsLoading();
    const config = await window.ConfigLoader.waitForConfig();
    if (!config || !config.API || !config.DOMAIN) {
      throw new Error('Configuration not loaded properly.');
    }
    const commentsData = await fetchComments(config.API.COMMENTS_URL, config.DOMAIN.PRODUCTION);
    renderComments(commentsData);
  } catch (error) {
    showCommentsError(error);
  }
}

// Load comments when the page loads
document.addEventListener('DOMContentLoaded', loadComments);

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchComments,
    renderComments,
    loadComments,
    showCommentsLoading,
    showCommentsError
  };
}