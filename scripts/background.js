// Full list of cover art entries from the JSON file
import coverArtData from '../UI Images/cover-art-filenames.json' with {type: 'json'};

// Total number of cover art images available
const TOTAL_COVER_ART = coverArtData.length;

// Every scrolling column in the collage
const allColumns = document.querySelectorAll('.collage-column');

// Cover art already shown 
let usedCoverArt = [];

// Returns cover art entries that haven't been shown yet
function getAvailableCoverArt() {
    // Every cover has been used, reset the pool
    if (usedCoverArt.length == TOTAL_COVER_ART) {
        usedCoverArt.length = 0;
    }

    // Keep only entries not already marked as used
    const availableCoverArt = coverArtData.filter((coverArtEntry) => {

        const coverArtFilename = coverArtEntry["Cover Art"];
        // Keep if not already used
        return !usedCoverArt.includes(coverArtFilename);

    });

    return availableCoverArt;
}

// Builds an image element for a piece of cover art
function createCoverArt(coverArtImagePath) {
    // Create the image element
    const newCoverArt = document.createElement('img');

    // Class for collage sizing and styling
    newCoverArt.className = "collage-image";

    // Set the image source
    newCoverArt.src = coverArtImagePath;

    return newCoverArt;
}

