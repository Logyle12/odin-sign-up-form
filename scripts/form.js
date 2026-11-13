// -----------------------------------------------------------------------------
// 1. DOM REFERENCES
// -----------------------------------------------------------------------------

/** @type {HTMLInputElement} */
const signUpForm = document.querySelector('#sign-up-form');

/** @type {HTMLInputElement} */
const usernameInput = document.querySelector('input#username');

/** @type {HTMLInputElement} */
const passwordInput = document.querySelector('input#password');

/** @type {HTMLInputElement} */
const confirmPasswordInput = document.querySelector('input#confirm-password');

/** @type {NodeListOf<HTMLElement>} */
const strengthMeterSegments = document.querySelectorAll('.strength-segment');

/** @type {HTMLElement} */
const strengthLabel = document.querySelector('#strength-label');

/** @type {HTMLElement} */
const passwordMatchStatus = document.querySelector('#password-match-status');

/** @type {NodeListOf<HTMLElement>} */
const revealPasswordIcons = document.querySelectorAll('.reveal-password-icon');
