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

/**
 * Penalty for a four-digit group that looks like a year (1900-2099) or a
 * day/month pair (DDMM or MMDD). Applied at most once.
 * @param {string} password
 */
function calculateDatePenalty(password) {
    let penalty = 0;
    const fourDigitMatches =
        Array.from(password.matchAll(/\d{4}/g));

    let hasDatePenalty = false;

    for (const match of fourDigitMatches) {
        if (hasDatePenalty) break;

        const fourDigitText = match[0];
        const fourDigitNumber = parseInt(fourDigitText, 10);
        const firstPair = parseInt(
            fourDigitText.slice(0, 2),
            10
        );
        const secondPair = parseInt(
            fourDigitText.slice(2, 4),
            10
        );

        const isYear =
            fourDigitNumber >= 1900 && fourDigitNumber <= 2099;

        const isDayMonth =
            firstPair >= 1 &&
            firstPair <= 31 &&
            secondPair >= 1 &&
            secondPair <= 12;

        const isMonthDay =
            firstPair >= 1 &&
            firstPair <= 12 &&
            secondPair >= 1 &&
            secondPair <= 31;

        if (isYear || isDayMonth || isMonthDay) {
            penalty += 15;
            hasDatePenalty = true;
        }
    }

    console.log("Penalty (Date): " + penalty);

    return penalty;
}

/**
 * Penalty for predictable structure: a single leading capital, and digits or
 * symbols tacked onto the last three characters only.
 * @param {string} password
 */
function calculateLazyStructurePenalty(password) {
    let penalty = 0;

    const hasLeadingCapital = /^[A-Z][^A-Z]*$/.test(password);

    const passwordBody = password.slice(0, password.length - 3);

    const passwordTail = password.slice(password.length - 3);

    const bodyHasDigitOrSymbol = DIGIT_OR_SYMBOL_PATTERN.test(passwordBody);

    const tailHasDigitOrSymbol = DIGIT_OR_SYMBOL_PATTERN.test(passwordTail);

    if (hasLeadingCapital) {
        penalty += 10;
    }

    if (!bodyHasDigitOrSymbol && tailHasDigitOrSymbol) {
        penalty += 15;

        if (hasLeadingCapital) {
            penalty += 10;
        }
    }

    console.log("Penalty (Lazy Structure): " + penalty);

    return penalty;
}

/**
 * Penalty for repeated characters; grows quadratically with the repeat count.
 * @param {string} password
 */
function calculateRepetitionPenalty(password) {
    const characterStack = [];
    const characterCounts = Object.create(null);

    for (const character of password) {
        characterCounts[character] = (characterCounts[character] ?? 1);

        // console.log("Character: " + character);
        // console.log("Stack: ");
        // console.table(characterStack);

        if (character === characterStack[characterStack.length - 1]) {
            characterCounts[character] += 1;

            // console.log("Charcter Counts: ");
            // console.table(characterCounts);
        }

        characterStack.push(character);
    }

    const repetitionPenalty = Object.values(characterCounts)
        .reduce((runningPenalty, characterCount) => {
            if (characterCount > 1) {
                const characterPenalty = 2 * Math.pow(characterCount, 2);

                // console.log("Character Penalty: " + characterPenalty);

                return runningPenalty + characterPenalty;
            }

            return runningPenalty;
        }, 0);


    console.log("Penalty (Repetition): " + repetitionPenalty);

    return repetitionPenalty;
}

// -----------------------------------------------------------------------------
// 6. STRENGTH SCORING: TOTALS
// -----------------------------------------------------------------------------

/** @param {string} password */
function calculateBonusTotal(password) {
    let bonusTotal = 0;

    bonusTotal += calculateLengthScore(password);
    bonusTotal += calculateCharacterClassBonus();
    bonusTotal += calculateInteriorBonus(password);
    bonusTotal += calculateDelimiterBonus(password);
    bonusTotal += calculateUniquenessBonus(password);

    console.log("Bonus Total: " + bonusTotal);

    return bonusTotal;
}

/**
 * @param {string} password
 * @returns {number} zero or negative
 */
function calculatePenaltyTotal(password) {
    let penaltyTotal = 0;

    penaltyTotal -= calculateKeyboardWalkPenalty(password);
    penaltyTotal -= calculateSequentialRunPenalty(password);
    penaltyTotal -= calculatePronounceabilityPenalty(password);
    penaltyTotal -= calculateDatePenalty(password);
    penaltyTotal -= calculateLazyStructurePenalty(password);
    penaltyTotal -= calculateRepetitionPenalty(password);

    console.log("Penalty Total: " + penaltyTotal);

    return penaltyTotal;
}

/** @param {string} password */
function calculatePasswordScore(password) {
    const bonusTotal = calculateBonusTotal(password);
    const penaltyTotal = calculatePenaltyTotal(password);

    console.log("Bonus Total: " + bonusTotal);
    console.log("Penalty Total: " + penaltyTotal);

    const rawScore = parseInt(bonusTotal) + parseInt(penaltyTotal);

    console.log("Raw Score: " + rawScore);
    console.log("");

    return rawScore;
}

// -----------------------------------------------------------------------------
// 7. STRENGTH METER RENDERING
// -----------------------------------------------------------------------------

/** @param {number} rawScore */
function renderStrengthMeter(rawScore) {

    const clampedScore = passwordInput.value.length > 0 ? Math.min(100, Math.max(1, rawScore)) : 0;

    console.log("Clamped Score: " + clampedScore);

    for (const [tierKey, tier] of Object.entries(STRENGTH_TIERS)) {
        const [lowestScore, highestScore] = tier.scoreRange;

        console.log("Tier Key: " + tierKey);

        if (clampedScore >= lowestScore && clampedScore <= highestScore) {
            for (let segmentIndex = 0; segmentIndex < tier.segmentCount; segmentIndex++) {
                const segment = strengthMeterSegments[segmentIndex];

                console.log("Segment: ");
                console.log(segment);

                console.log("Tier: " + tier);
                console.log("Color: " + tier.color);

                if (segment.style.backgroundColor !== tier.color) {
                    segment.style.backgroundColor = tier.color;
                }

                if (strengthLabel.textContent !== tier.label) {
                    strengthLabel.textContent = tier.label;
                }
            }
        }
    }
}

/** @param {string} password */
function updateStrengthMeter(password) {
    const rawScore = calculatePasswordScore(password);
    renderStrengthMeter(rawScore);
}

// Shows the strength label while the password field has text, hides it when empty.
function updateStrengthLabelVisibility(password) {
    if (password.length < 1) {
        strengthLabel.classList.remove('active');
    }

    else if (!strengthLabel.classList.contains('active')) {
        strengthLabel.classList.add('active');
    }
}

// -----------------------------------------------------------------------------
// 8. REQUIREMENT PILLS (username & password)
// -----------------------------------------------------------------------------

/**
 * Marks one requirement pill 'valid' or 'invalid' based on its data-regex.
 * @param {HTMLElement} requirementElement
 * @param {string} inputValue
 */
function updateRequirementState(requirementElement, inputValue) {
    const requirementRegex = new RegExp(requirementElement.dataset.regex);

    const isRequirementValid = requirementRegex.test(inputValue);

    const validationState = isRequirementValid ? 'valid' : 'invalid';

    const requirementClasses = requirementElement.classList;

    console.log("Classes: " + requirementClasses);

    if (!requirementClasses.contains(validationState)) {
        const currentClassName = requirementElement.className;

        if (currentClassName.includes('valid')) {
            requirementClasses.remove(
                currentClassName.split(" ").at(-1)
            );
        }

        requirementClasses.toggle(validationState);
    }
}
