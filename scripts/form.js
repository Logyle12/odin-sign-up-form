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

// -----------------------------------------------------------------------------
// 2. CONFIGURATION & CONSTANTS
// -----------------------------------------------------------------------------

//Extra points for using several character classes (upper, lower, number, symbol).
const CHARACTER_CLASS_BONUSES = {
    twoClasses:   { classCount: 2, points: 5 },
    threeClasses: { classCount: 3, points: 12 },
    fourClasses:  { classCount: 4, points: 20 },
};

// Meter appearance for each score range. 

const STRENGTH_TIERS = {
    EMPTY_METER: {
        scoreRange: [0, 100],
        color: "#263653",
        label: "",
        segmentCount: 4
    },
    VERY_WEAK: {
        scoreRange: [1, 19],
        color: "#FF4D6D",
        label: "Very Weak",
        segmentCount: 1
    },
    WEAK: {
        scoreRange: [20, 39],
        color: "#FFB347",
        label: "Weak",
        segmentCount: 2
    },
    MEDIUM: {
        scoreRange: [40, 59],
        color: "#FFD166",
        label: "Medium",
        segmentCount: 3
    },
    GOOD: {
        scoreRange: [60, 79],
        color: "#ADFF2F",
        label: "Good",
        segmentCount: 3
    },
    STRONG: {
        scoreRange: [80, 99],
        color: "#87E665",
        label: "Strong",
        segmentCount: 4
    },
    VERY_STRONG: {
        scoreRange: [100, 100],
        color: "#4ADE80",
        label: "Very Strong",
        segmentCount: 4
    }
};
