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
    const coverArtIndex = Math.floor(Math.random() * (coverArtArray.length));

    const coverArtFilename = coverArtArray[coverArtIndex]["Cover Art"];
    
    // Mark it as used
    recordUsedCoverArt(coverArtFilename);

    // Full path to the image file
    const coverArtImagePath = `./UI Images/Video Game Cover Art/${coverArtFilename}`;

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

// Scrolls a column and recycles the top image once it's fully scrolled past
function scrollCollage(column) {

   // Nudge the scroll position down
   column.scrollTop += 0.5;

    // Get image currently at the top of the column
    let topImageElement = column.firstElementChild;

    // Get that image's on screen size and position
    const boundingRect = topImageElement.getBoundingClientRect();

    // Look through the bounding rect's properties
    for (const propertyName in boundingRect) {

        // Only height is actually needed here
        if (propertyName == "height") {
       
            const elementHeight = boundingRect["height"];

            // Once image height is out of frame recycle the image
            if (Math.round(Math.abs(column.scrollTop)) % Math.round(Math.abs(elementHeight)) == 0) {
                // Remove the image that's scrolled out of view
                topImageElement.remove();

                // Pick a new random cover art
                const newCoverArt = getRandomCoverArt();

                // Add it to the bottom of the column
                column.append(newCoverArt);
            }
        }

    }
}

// Fill every column on load
initializeCollage();

// Keep columns scrolling, checking for a recycle every 12ms
setInterval(() => allColumns.forEach(scrollCollage), 12);