async function loadCognito() {
    const config = await window.ConfigLoader.waitForConfig();
    if (!config || !config.COOKIES || !config.COGNITO) {
        console.error("Configuration not found. Ensure secretsLoader.js is loaded before this script.");
        return;
    }
    const cognitoConfig = config.COGNITO;
    const cookieNames = config.COOKIES;
    if (!cognitoConfig.CLIENT_ID || !cognitoConfig.AUTHORITY || !cognitoConfig.DOMAIN) {
        console.error("Cognito configuration is incomplete. Ensure CLIENT_ID, AUTHORITY, and DOMAIN are set.");
        return;
    }
    const clientId = cognitoConfig.CLIENT_ID;
    const domainURI = config.DOMAIN.CURRENT_URI;
    if (!domainURI) {
        console.error("Current domain not found in configuration.");
        return;
    }
    const userManager = new UserManager({
    authority: cognitoConfig.AUTHORITY,
    client_id: clientId,
    redirect_uri: `${domainURI}?cognito=signin`,
    response_type: "code",
    scope: "phone openid email"
    });
    renderCognitoDiv(userManager, clientId, cognitoConfig.DOMAIN, cookieNames);
    if (window.location.search.includes("cognito=signin")) {
        signInRedirect(userManager, config);
    } else if (window.location.search.includes("cognito=logout")) {
        // Handle logout if needed
        console.log("User logged out");
        deleteCookie(cookieNames.ACCESS_TOKEN);
        deleteCookie(cookieNames.ID_TOKEN);
        deleteCookie(cookieNames.REFRESH_TOKEN);
        deleteCookie(cookieNames.EMAIL);
        window.location.href = domainURI; // Redirect to the main page after logout
    }
}

async function signInRedirect(userManager, cookieNames) {
    try {
        const user = await userManager.signinCallback();
        console.log("Sign-in successful:", user);
        // Send to cookies
        const exp = user.profile?.exp ?
            new Date(Date.now() + user.profile.exp).toUTCString() :
            new Date(Date.now() + 3600 * 1000).toUTCString(); // Default to 1 hour if exp is not available
        console.log("Setting cookies with expiration:", exp);
        setCookie(cookieNames.EMAIL, user.profile?.email, exp);
        setCookie(cookieNames.ACCESS_TOKEN, user.access_token, exp);
        setCookie(cookieNames.ID_TOKEN, user.id_token, exp);
        setCookie(cookieNames.REFRESH_TOKEN, user.refresh_token, exp);
    } catch (error) {
        console.error("Error during sign-in callback:", error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
}

function renderCognitoDiv(userManager, clientId, cognitoConfigDomain, cookieNames) {
    const cognitoSection = document.getElementById("cognito");
    if (!cognitoSection) {
        console.error("Cognito section not found");
        return;
    }
    cognitoSection.innerHTML = ``;
    const cognitoDiv = document.createElement("div");
    cognitoDiv.className = "container py-5";
    const title = document.createElement("h2");
    title.innerHTML = `<span class="material-icons accent">account_circle</span> Cognito Authentication`;
    cognitoDiv.appendChild(title);
    cognitoDiv.id = "cognitoDiv";
    cognitoSection.appendChild(cognitoDiv);
    const accessTokenCookie = cookieNames.ACCESS_TOKEN || 'ResumeLynxAccess_token';
    if (!getCookie(accessTokenCookie)) {
        const signInButton = document.createElement("button");
        signInButton.textContent = "Sign In";
        signInButton.className = "btn btn-primary mt-3 ms-5";
        signInButton.id = "signIn";
        cognitoDiv.appendChild(signInButton);

        signInButton.addEventListener("click", async () => {
            await userManager.signinRedirect();
        });
    } else {
        const signOutButton = document.createElement("button");
        signOutButton.textContent = "Sign Out";
        signOutButton.className = "btn btn-secondary mt-3 ms-5";
        signOutButton.id = "signOut";
        cognitoDiv.appendChild(signOutButton);
        signOutButton.addEventListener("click", async () => {
            window.location.href = `${cognitoConfigDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(domainURI)}?cognito=logout`;
        });
    }
}


// Load comments when the page loads
document.addEventListener('DOMContentLoaded', loadCognito);

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadCognito,
        renderCognitoDiv,
        signInRedirect
    };
}