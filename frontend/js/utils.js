function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function setCookie(name, value, exp) {
    const expires = exp;
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCookie,
        deleteCookie,
        setCookie
    };
}