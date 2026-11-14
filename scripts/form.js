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

/**
 * Bonus when every character is different (10+ characters).
 * @param {string} password
 */
function calculateUniquenessBonus(password) {
    const uniqueCharacters = getUniqueCharacters(password);
    const uniqueCharacterRatio =
        uniqueCharacters.length / password.length;

    if (uniqueCharacterRatio === 1 && password.length >= 10) {
        return 10;
    }

    return 0;
}

// -----------------------------------------------------------------------------
// 5. STRENGTH SCORING: PENALTIES
// -----------------------------------------------------------------------------

/**
 * Penalty for runs of 3+ characters with consecutive character codes ("abc", "123").
 * @param {string} password
 */
function calculateSequentialRunPenalty(password) {
    let penalty = 0;
    let runLength = 1;
    let runCharacters = '';

    if (password.length >= 3) {
        for (let characterIndex = 0; characterIndex < password.length - 1; characterIndex++) {
            const currentCharacterCode = password.codePointAt(characterIndex);
            const nextCharacterCode = password.codePointAt(characterIndex + 1);
            const codeDifference =
                currentCharacterCode - nextCharacterCode;

            runCharacters += password[characterIndex];

            if (Math.abs(codeDifference) === 1) {
                runLength++;

                if (runLength === 3) {
                    console.log("Sequential Run: " + runCharacters);
                    console.log("Run Length: " + runLength);
                    penalty += 12;
                }
            }

            else {
                runCharacters = '';
                runLength = 1;
            }
        }
    }

    console.log("Penalty (Sequential Run): " + penalty);

    return penalty;
}

/**
 * Finds the keys physically next to 'key' on the keyboard.
 * @param {string} key
 * @returns {Object<string, string[]> | undefined} undefined if the key isn't on the map
 */
function getAdjacencyMap(key) {
    console.log("Key: " + key);
    console.table(KEYBOARD_ROWS);

    const rowIndex = KEYBOARD_ROWS.findIndex((keyboardRow) => {
        return keyboardRow.includes(key);
    });
    console.log("Row Index: " + rowIndex);

    if (rowIndex === -1) {
        return undefined;
    }

    const currentRow = KEYBOARD_ROWS[rowIndex];

    const columnIndex = currentRow.indexOf(key);

    const adjacentRows = [
        KEYBOARD_ROWS[rowIndex - 1],
        KEYBOARD_ROWS[rowIndex + 1]
    ].filter((candidateRow) => candidateRow !== undefined);

    console.log('Adjacent Row:');
    console.table(adjacentRows);

    const adjacencyMap = Object.create(null);
    const adjacentKeys = [currentRow[columnIndex - 1], currentRow[columnIndex + 1]];

    adjacentRows.forEach((adjacentRow, adjacentRowIndex) => {
        console.log('Row: ' + adjacentRow);

        adjacentKeys.push(adjacentRow[columnIndex]);

        if (adjacentRowIndex < rowIndex && adjacentRow.length !== 7) {
            adjacentKeys.push(adjacentRow[columnIndex + 1]);
        } else {
            adjacentKeys.push(adjacentRow[columnIndex - 1]);
        }
    });

    adjacencyMap[key] = adjacentKeys.filter(
        (adjacentKey) => adjacentKey !== undefined
    );

    console.log('Adjacencies: ');
    console.table(adjacencyMap);

    return adjacencyMap;
}

/**
 * Penalty for typing along the keyboard ("qwe", "asd").
 * @param {string} password
 */
function calculateKeyboardWalkPenalty(password) {
    let penalty = 0;
    let walkLength = 1;
    let walk = '';

    if (password.length >= 3) {
        for (let characterIndex = 0; characterIndex < password.length - 1; characterIndex++) {
            const character = password[characterIndex];
            const nextCharacter = password[characterIndex + 1];
            const adjacencyMap = getAdjacencyMap(character);

            console.log("Adjacency Map: ");
            console.table(adjacencyMap);

            console.log("Character: " + character);
            console.log("Next Character: " + nextCharacter);

            // A character that isn't on the keyboard map ends the check
            if (adjacencyMap === undefined) {
                return penalty;
            }

            const adjacentKeys = Object.values(adjacencyMap).flat();

            if (adjacentKeys.includes(nextCharacter)) {
                walk += password[characterIndex];
                walkLength++;

                console.log("Keyboard Walk: " + walk);
                console.log("Walk Length: " + walkLength);
                console.log("");

                if (walkLength === 3) {
                    penalty += 12;
                }
            }

            else if (walkLength > 1) {
                walk = '';
                walkLength = 1;
            }
        }
    }

    console.log("Penalty (Keyboard Walk): " + penalty);

    return penalty;
}

/**
 * Penalty for letter-only passwords that alternate vowels and consonants
 * (easy-to-pronounce words).
 * @param {string} password
 */
function calculatePronounceabilityPenalty(password) {
    let penalty = 0;

    if (/^[A-Za-z]+$/.test(password)) {
        const hasConsecutiveVowels =
            /([aeiou]|(?<=\w)y){2}/i.test(password);

        const hasConsecutiveConsonants =
            /([^aeiouy]|^y){2}/i.test(password);

        if (!hasConsecutiveVowels && !hasConsecutiveConsonants) {
            penalty += 20;
            return penalty;
        }
    }

    console.log("Penalty (Pronounceability): " + penalty);

    return penalty;
}
