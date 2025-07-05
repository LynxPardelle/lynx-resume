const clientId = "3d6i20ki3agosps07qfpdqjk36";
// const domainURI = "https://resume.lynxpardelle.com";
const domainURI = "http://localhost:5500/frontend/index.html";
const CognitoDomain = "https://us-east-1dmpgljve2.auth.us-east-1.amazoncognito.com";
const userManager = new UserManager({
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_dMpglJve2",
    client_id: clientId,
    redirect_uri: `${domainURI}?cognito=signin`,
    response_type: "code",
    scope: "phone openid email"
});

let cognitoSection;

function loadCognito() {
    renderCognitoDiv();
    if (window.location.search.includes("cognito=signin")) {
        signInRedirect();
    } else if (window.location.search.includes("cognito=logout")) {
        // Handle logout if needed
        console.log("User logged out");
        deleteCookie("ResumeLynxAccess_token");
        deleteCookie("ResumeLynxId_token");
        deleteCookie("ResumeLynxRefresh_token");
        deleteCookie("ResumeLynxEmail");
        window.location.href = domainURI; // Redirect to the main page after logout
    }
}

async function signInRedirect() {
    try {
        const user = await userManager.signinCallback();
        console.log("Sign-in successful:", user);
        // Send to cookies
        const exp = user.profile?.exp ?
            new Date(Date.now() + user.profile.exp).toUTCString() :
            new Date(Date.now() + 3600 * 1000).toUTCString(); // Default to 1 hour if exp is not available
        console.log("Setting cookies with expiration:", exp);
        setCookie(`ResumeLynxEmail`, user.profile?.email, exp);
        setCookie(`ResumeLynxAccess_token`, user.access_token, exp);
        setCookie(`ResumeLynxId_token`, user.id_token, exp);
        setCookie(`ResumeLynxRefresh_token`, user.refresh_token, exp);
    } catch (error) {
        console.error("Error during sign-in callback:", error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
    window.location.href = domainURI;
}

function renderSignInButton() {
    const signInButton = document.createElement("button");
    signInButton.textContent = "Sign In";
    signInButton.className = "btn btn-primary";
    signInButton.id = "signIn";
    cognitoDiv.appendChild(signInButton);

    signInButton.addEventListener("click", async () => {
        await userManager.signinRedirect();
    });
}

function renderCognitoDiv() {
    cognitoSection = document.getElementById("cognito");
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
    if (!getCookie("ResumeLynxAccess_token")) {
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
            window.location.href = `${CognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(domainURI)}?cognito=logout`;
        });
    }
}


// Load comments when the page loads
document.addEventListener('DOMContentLoaded', loadCognito);

// Export functions for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadCognito,
        renderSignOutButton,
        renderSignInButton,
        signInRedirect
    };
}