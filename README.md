# AR Object Placement

An augmented reality web application that allows users to place 3D objects in their environment using their device's camera.

## Features

- Place 3D objects in augmented reality
- Choose from different object types (cube, sphere, cylinder, etc.)
- Edit mode for manipulating placed objects
- Works on mobile devices with camera access

## Simplified for GitHub Pages

This version has been simplified to work without a server component, making it deployable to GitHub Pages.

## Deployment Instructions

### Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open your browser at `http://localhost:5173`

### Deploying to GitHub Pages

1. Install the gh-pages package if not already installed:
   ```
   npm install gh-pages --save-dev
   ```

2. Deploy to GitHub Pages:
   ```
   npm run deploy
   ```

3. Alternatively, push to your GitHub repository and let the GitHub Actions workflow deploy automatically.

## How It Works

This AR application uses:
- Three.js for 3D rendering
- AR.js and MindAR for augmented reality capabilities
- React for the user interface
- Zustand for state management

All data is stored client-side, with no server requirements.

## Browser Compatibility

For the best experience, use:
- Chrome on Android
- Safari on iOS
- Modern desktop browsers with camera access

## License

MIT
