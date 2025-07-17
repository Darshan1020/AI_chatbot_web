# Setup Guide

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Configure the Environment

1. Create a `.env.local` file in the project root
2. Add your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Restart the development server:
   ```
   npm run dev
   ```

## Testing

Once configured, you can test the chat functionality by sending a message in the web interface at http://localhost:3000. 