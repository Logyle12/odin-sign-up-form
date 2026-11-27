# Play Vault

A sign-up page for a fictional game library app, built with HTML, CSS, and JavaScript as part of The Odin Project. It features live form validation, a password-strength meter, and a scrolling collage of video game covers.

## Features

- **Form Validation**: Checks username, email, and password requirements as users type.
- **Password Strength Meter**: Calculates a strength score based on password length, character variety, and predictable patterns.
- **Password Confirmation**: Checks that both password fields match.
- **Password Visibility**: Toggle password visibility in either password field.
- **Game Cover Collage**: Displays randomly selected game covers across four continuously scrolling columns.
- **Sign-up Confirmation**: Displays a separate page after form submission.

## Live Preview

[Click here to try Play Vault](Yhttps://logyle12.github.io/odin-sign-up-form/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Logyle12/odin-sign-up-form.git
   ```
2. Navigate to the project directory:
   ```bash
   cd odin-sign-up-form
   ```
3. Start a local server:
   ```bash
   python -m http.server 8000
   ```
4. Open [http://localhost:8000](http://localhost:8000) in your browser.

No build tools or package dependencies required.

## Project Structure

```text
|-- UI Icons/
|   |-- Feature Icons/
|   |-- Input Icons/
|-- UI Images/
|   |-- Success Page/
|   |-- Video Game Cover Art/
|   |-- cover-art-filenames.json
|-- scripts/
|   |-- game-cover-collage.js
|   |-- sign-up-complete.js
|   |-- sign-up-form.js
|-- styles/
|   |-- sign-up-complete.css
|   |-- sign-up.css
|-- index.html
|-- sign-up-complete.html
|-- README.md
```

- **UI Icons/**: Icons used throughout the sign-up form and feature cards.
- **UI Images/**: Game covers, success page artwork, and the cover art catalogue.
- **scripts/game-cover-collage.js**: Handles the scrolling game cover collage.
- **scripts/sign-up-form.js**: Handles form validation, password scoring, and input interactions.
- **scripts/sign-up-complete.js**: Handles the sign-up confirmation page.
- **styles/**: Stylesheets for both pages.

## Note

This is a front-end project. It does not create real accounts or connect to a game library. The form uses `GET`, so use test details only; submitted values can appear in the URL.

