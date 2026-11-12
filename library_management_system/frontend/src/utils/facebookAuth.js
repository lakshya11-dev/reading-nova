/**
 * Facebook JavaScript SDK Loader & Helper
 */

const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "1768111120942269";

let fbInitPromise = null;

export const initFacebookSDK = () => {
  if (fbInitPromise) return fbInitPromise;

  fbInitPromise = new Promise((resolve) => {
    // If FB SDK already exists on window
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    // Set callback before script loads
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });
      resolve(window.FB);
    };

    // Load FB SDK script asynchronously
    (function (d, s, id) {
      if (d.getElementById(id)) return;
      const fjs = d.getElementsByTagName(s)[0];
      const js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  });

  return fbInitPromise;
};

/**
 * Triggers the Facebook login popup and returns the access token.
 */
export const loginWithFacebook = () => {
  return new Promise((resolve, reject) => {
    initFacebookSDK().then((FB) => {
      FB.login(
        (response) => {
          if (response.authResponse && response.authResponse.accessToken) {
            resolve(response.authResponse.accessToken);
          } else {
            reject(
              new Error(
                response.status === "not_authorized"
                  ? "Facebook app not authorized."
                  : "Facebook login was cancelled or failed."
              )
            );
          }
        },
        { scope: "public_profile,email" }
      );
    });
  });
};

