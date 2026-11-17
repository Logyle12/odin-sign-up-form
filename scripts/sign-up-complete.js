// -----------------------------------------------------------------------------
// 1. STORED FORM DATA
// -----------------------------------------------------------------------------

// Username saved by the sign-up form before redirecting to this page.
// Returns null if nothing was saved (e.g. the page was opened directly).
const storedUsername = localStorage.getItem("username");

console.log("Stored Username: " + storedUsername);
