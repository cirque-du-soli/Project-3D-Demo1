import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: 'dist', // Specify the output directory
        assetsDir: '.', // Specify the assets directory
        sourcemap: true, // Enable sourcemaps for debugging
        emptyOutDir: true, // Clear the output directory before building
    },
    server: {
        port: process.env.PORT || 3000 // Set the port for Heroku deployment
    }
})