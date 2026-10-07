# ComradeSoko

ComradeSoko is a static campus marketplace prototype hosted on GitHub Pages. Creating a browser-local profile does not require account verification. Firebase sign-in and profile sync are optional and remain unavailable until configured.

## Optional Firebase account verification

To enable optional Firebase sign-in and profile sync:

1. Create a Firebase project and register a Web app.
2. In Firebase Authentication, enable **Google**, **Email link (passwordless)**, and **Phone** sign-in providers.
3. Add the production host (`mellybot808.github.io`) and any local development host to Authentication **Authorized domains**. Configure the email action URL for the same authorized host.
4. Create a Cloud Firestore database and a Cloud Storage bucket.
5. Copy the Firebase Web app configuration into `firebase-config.js`. These web configuration values identify the Firebase project; never put service-account credentials or private keys in this site.
6. Publish `firestore.rules` and `storage.rules` to the Firebase project. These rules restrict profile records and uploaded profile photos to their verified account owner.
7. For phone sign-in, configure Firebase phone authentication and its reCAPTCHA/billing requirements. Use Firebase test phone numbers during development rather than sending repeated live SMS messages.
8. Deploy the site and test email-link, SMS-code, Google sign-in, optional profile sync, and sign-out using each configured provider.

Email verification uses Firebase's secure sign-in link rather than a numeric email code. Phone verification uses the SMS code. Google sign-in relies on Google's authenticated account and verified-email status. The profile photo is stored privately in Firebase Storage; a photo and a verified contact method do not establish legal identity or constitute government-ID KYC.

The marketplace data, product and campus-post comments/replies, conversations, and posts are still browser-local. Discussions can be added to each listing and campus hub post, but they are visible only in the same browser until a shared backend is implemented. Firebase Authentication and private profile storage do not make those prototype features shared between users.
