# WanderLuxe: AI-Powered Travel Concierge

WanderLuxe is a single-page web application designed to act as a personal travel planner. It utilizes generative AI to dynamically create structured, day-by-day itineraries based on user inputs such as destination, trip duration, and budget. 

This project was built to demonstrate the integration of modern frontend technologies with third-party AI APIs to solve the problem of information overload in travel planning.

## Features

- **Conversational Interface:** Users can interact with the AI concierge using natural language.
- **Dynamic Itinerary Generation:** Generates comprehensive travel plans including hotel stays, dining recommendations, and activities.
- **Budget Tracking:** Enforces a strict budget parameter, formatting all estimated costs in Indian Rupees (INR/₹).
- **Luxury Aesthetic:** A premium UI utilizing CSS glassmorphism, responsive grid layouts, and custom typography.
- **Skyscanner Integration:** Automatically links the user to live flight data based on their chosen destination.
- **Print Optimization:** Includes specialized print styling for easy offline access to itineraries.

## Technologies Used

- **HTML5:** Semantic document structure and forms.
- **CSS3:** Custom styling, CSS variables, flexbox, grid, and animations.
- **JavaScript (ES6+):** Client-side logic, DOM manipulation, and asynchronous API calls.
- **OpenRouter API (Gemini 2.0 Flash):** Handles natural language processing and JSON generation.
- **Marked.js:** Parses the markdown response from the AI into formatted HTML.

## Setup and Installation

WanderLuxe is built as a serverless frontend application. No complex build tools or backend environments are required to run it.

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/suryansh0512/wanderluxe.git
   ```
2. Navigate to the project directory:
   ```bash
   cd wanderluxe
   ```
3. Open `index.html` in your preferred modern web browser. For the best experience, host it via a local development server (e.g., Python's `http.server` or VS Code's Live Server) to avoid CORS issues with the API.

## API Key Configuration

The application requires an OpenRouter API key to function. 
By default, the application will prompt the user to enter their API key via a settings modal. The key is then stored securely in the browser's `localStorage`.

## Author

Suryansh Singh (3cse4)
cs-2341380
