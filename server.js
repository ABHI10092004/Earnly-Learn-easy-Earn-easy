// Just import the app from app.js which has all our routes set up correctly
const app = require('./app');

// The rest of the file can be removed as we're importing the configured app
// from app.js which already has our routes, middleware, etc.

// Start the server (only if not already started in app.js)
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// }); 