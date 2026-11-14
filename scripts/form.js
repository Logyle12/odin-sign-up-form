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

// US QWERTY rows used to detect keyboard walks (e.g. "qwe", "asd").
const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const TOP_ROW = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const HOME_ROW = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const BOTTOM_ROW = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
const KEYBOARD_ROWS = [NUMBER_ROW, TOP_ROW, HOME_ROW, BOTTOM_ROW];

// Matches a single digit or one of the allowed special characters. 
const DIGIT_OR_SYMBOL_PATTERN = /[0-9!@#$%^&*]/;

// -----------------------------------------------------------------------------
// 3. SHARED STRING HELPERS
// -----------------------------------------------------------------------------

/**
 * @param {string} password
 * @returns {string[]} 
 */
function getUniqueCharacters(password) {
    const uniqueCharacters = [];

    for (let characterIndex = 0; characterIndex < password.length; characterIndex++) {
        const character = password[characterIndex];

        if (!uniqueCharacters.includes(character)) {
            uniqueCharacters.push(character);
        }
    }

    return uniqueCharacters;
}

// -----------------------------------------------------------------------------
// 4. STRENGTH SCORING: BONUSES
// -----------------------------------------------------------------------------

/** @param {string} password */
function calculateLengthScore(password) {
    const uniqueCharacters = getUniqueCharacters(password);

    console.log("Unique Characters: ");
    console.table(uniqueCharacters);
    console.log("");

    const effectiveLength = Math.sqrt(
        password.length * uniqueCharacters.length
    );

    const lengthMultiplier = password.length < 8 ? 0
        : password.length <= 11 ? 3
        : password.length <= 15 ? 5
        : 6.5;

    const lengthScore = effectiveLength * lengthMultiplier;

    console.log("Unique Characters Count: " + uniqueCharacters.length);
    console.log("Password Length: " + password.length);
    console.log("Effective Length: " + effectiveLength);
    console.log("Length Multiplier: " + lengthMultiplier);
    console.log("Length Score: " + lengthScore);

    return lengthScore;
}

function calculateCharacterClassBonus() {
    const classCount = document.querySelectorAll('.character-requirement.valid').length;
    let classBonus = 0;

    console.log("Class Count: " + classCount);

    if (classCount > 1) {
        for (const bonusRule of Object.values(CHARACTER_CLASS_BONUSES)) {
            console.log(bonusRule);

            if (bonusRule.classCount === classCount) {
                classBonus += bonusRule.points;

                console.log("Character Class Bonus: " + classBonus);
            }
        }
    }

    return classBonus;
}

/** @param {string} password */
function calculateInteriorBonus(password) {
    const interiorStart = Math.round(0.6 * password.length) - 1;
    const interiorCharacters = password.slice(
        interiorStart,
        password.length - 2
    );

    if (DIGIT_OR_SYMBOL_PATTERN.test(interiorCharacters)) {
        return 15;
    }

    return 0;
}

/** @param {string} password */
function calculateDelimiterBonus(password) {
    if (/(?:[A-Za-z0-9!@#$%^&*]+[-_\s]){2}/.test(password)) {
        const words = password.split(/[-_\s]/);

        if (words.every((word) => word.length >= 3)) {
            return 15;
        }
    }

    return 0;
}
