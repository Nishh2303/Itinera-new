# Itinera - AI-Powered Travel Itinerary Planner

A modern, AI-powered travel planning application that creates personalized itineraries using Google's Gemini AI.

## Features

- 🧠 AI-powered itinerary generation with three distinct travel styles
- 🌍 Real-time destination search with autocomplete
- 💰 Budget-aware planning
- 🎯 Personalized travel preferences
- 📱 Responsive design
- 🔄 Interactive itinerary refinement

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Itinera-new
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   
   **Option A: Use the setup script (Recommended)**
   ```bash
   npm run setup
   ```
   
   **Option B: Manual setup**
   - Create a `.env` file in the root directory
   - Add your Gemini API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it in your `.env` file

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Testing the API

To test if your Gemini API key is working correctly:

```bash
npm run test-api
```

This will send a test request to the Gemini API and show you the response.

### Building for Production

```bash
npm run build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Lucide React Icons
- Google Gemini AI API
- Geoapify API (for location search)

## Project Structure

```
src/
├── App.jsx          # Main application component
├── index.css        # Global styles
└── main.jsx         # Application entry point
```

## API Integration

The application integrates with:
- **Google Gemini AI**: For generating travel itineraries
- **Geoapify**: For destination search and autocomplete

## Troubleshooting

### Common Issues

**"Gemini API key is not configured" error**
- Make sure you have created a `.env` file in the root directory
- Verify that your API key is correctly set as `VITE_GEMINI_API_KEY=your_key_here`
- Restart your development server after adding the environment variable

**API Error 400/401**
- Check that your Gemini API key is valid and active
- Ensure you have sufficient quota for the Gemini API
- Verify the API key format (should be a long string without spaces)

**JSON Parse Error**
- This usually indicates the AI returned malformed JSON
- Try simplifying your request or try again
- Check the browser console for detailed error information

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Ensure you have a valid Gemini API key
4. Try restarting the development server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.