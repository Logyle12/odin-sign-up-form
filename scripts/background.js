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

// Marks a cover art filename as used for this cycle
function recordUsedCoverArt(coverArtFilename) {
    // Re-check what's currently available
    const availableCoverArt = getAvailableCoverArt();

    // Only record if there's still room left this cycle
    if (usedCoverArt.length < TOTAL_COVER_ART) {
        // Find the matching cover art for this filename
        const matchedCoverArtFilename = availableCoverArt.find((coverArtEntry) => {
            const entryFilename = coverArtEntry["Cover Art"];
            return coverArtFilename.includes(entryFilename);
        })["Cover Art"];
        
        // Add it to the used list
        usedCoverArt.push(matchedCoverArtFilename);
    }
}

// Picks a random unused cover art and builds its image element
function getRandomCoverArt() {
    // Get cover art still available 
    const coverArtArray = getAvailableCoverArt();

    // Random index into the available list
    const coverArtIndex = Math.floor(Math.random() * (coverArtArray.length - 1));

    const coverArtFilename = coverArtArray[coverArtIndex]["Cover Art"];
    
    // Mark it as used
    recordUsedCoverArt(coverArtFilename);

    // Full path to the image file
    const coverArtImagePath = `../UI Images/Video Game Cover Art/${coverArtFilename}`;

    // Build the image element
    const coverArt = createCoverArt(coverArtImagePath);

    return coverArt;
}

// Fills every column with a random cover art image on load
function initializeCollage() {
    // Go through every column
    allColumns.forEach(column => {
        // Get existing image elements in the column
        const collageImages = Array.from(column.children);
        // Swap each one's source for a random cover
        collageImages.forEach(collageImage => {
            const newCoverArt = getRandomCoverArt();
            collageImage.src = newCoverArt.src;
        })
    });
    
}

