/* eslint-disable max-len */ // Temporarily disable max-len for specific long lines if unavoidable
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Callable HTTPS function to set an admin claim
// IMPORTANT: Secure this function properly in a production environment!
exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if the caller is authenticated (basic check)
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // OPTIONAL BUT RECOMMENDED: Add a check to ensure only an existing admin
  // or a specific authorized user can call this function.
  // For example, you might check if context.auth.token.admin === true,
  // or if context.auth.uid is in a list of super-admin UIDs.
  // For initial setup, you might temporarily comment this out, then add it back.
  /*
  if (context.auth.token.admin !== true) {
     throw new functions.https.HttpsError(
        "permission-denied",
        "Only existing admins can set admin roles.",
     );
  }
  */

  const userEmailToMakeAdmin = data.email;
  if (!userEmailToMakeAdmin) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with an \"email\" argument specifying the user to make admin.",
    );
  }

  try {
    const user = await admin.auth().getUserByEmail(userEmailToMakeAdmin);
    if (user.uid) {
      await admin.auth().setCustomUserClaims(user.uid, {admin: true});
      console.log(
          `Successfully set admin claim for ${userEmailToMakeAdmin} (UID: ${user.uid})`,
      );
      return {
        message: `Success! ${userEmailToMakeAdmin} is now an admin.`,
      };
    } else {
      // This case should ideally not be reached if getUserByEmail succeeds
      throw new functions.https.HttpsError(
          "not-found",
          `User with email ${userEmailToMakeAdmin} not found.`,
      );
    }
  } catch (error) {
    console.error("Error setting custom claim:", error);
    if (error.code === "auth/user-not-found") {
      throw new functions.https.HttpsError(
          "not-found",
          `User with email ${userEmailToMakeAdmin} not found.`,
      );
    }
    throw new functions.https.HttpsError(
        "internal",
        `Unable to set custom claim. Error: ${error.message}`,
    );
  }
});
/* eslint-enable max-len */

