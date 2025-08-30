#!/usr/bin/env node

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.log('❌ No API key found. Please run: npm run setup');
  process.exit(1);
}

console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
console.log('🧪 Testing Gemini API...\n');

const testQuery = `Create a travel itinerary with these details:
- Destination: Paris
- Duration: 3 days
- Number of People: 2
- Budget: Approximately 2000 EUR
- Travel Preferences: Culture, Foodie
- Additional Notes: None`;

const systemPrompt = `You are Itinera, a travel planning AI. Create three distinct travel itinerary options: 'Balanced', 'Luxury Stay', and 'Explorer' for the given destination, budget, and preferences.

IMPORTANT: Respond ONLY with valid JSON. No text before or after the JSON.

JSON Schema:
{
  "itinerary_options": [
    {
      "type": "Balanced|Luxury Stay|Explorer",
      "summary": "Brief description of this itinerary style",
      "itinerary": [
        {
          "day": 1,
          "theme": "Day theme",
          "morning": {
            "activity": "Activity name",
            "description": "Brief description"
          },
          "afternoon": {
            "activity": "Activity name", 
            "description": "Brief description"
          },
          "evening": {
            "activity": "Activity name",
            "description": "Brief description"
          },
          "food": {
            "lunch": "Lunch suggestion",
            "dinner": "Dinner suggestion"
          }
        }
      ],
      "accommodation_suggestions": [
        {
          "name": "Hotel name",
          "type": "Hotel type",
          "description": "Brief description"
        }
      ]
    }
  ]
}`;

async function testAPI() {
  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: testQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 4000
      },
    };

    console.log('📤 Sending request to Gemini API...');
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ API Response received');
    
    const candidate = result.candidates?.[0];
    if (candidate?.content?.parts?.[0]?.text) {
      const responseText = candidate.content.parts[0].text;
      console.log('\n📄 Raw Response:');
      console.log(responseText.substring(0, 500) + '...');
      
      try {
        const parsed = JSON.parse(responseText);
        console.log('\n✅ JSON parsed successfully!');
        console.log('📊 Response structure:', {
          hasItineraryOptions: !!parsed.itinerary_options,
          optionsCount: parsed.itinerary_options?.length || 0
        });
      } catch (parseError) {
        console.log('\n❌ JSON Parse Error:', parseError.message);
      }
    } else {
      console.log('❌ Unexpected response structure:', result);
    }

  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testAPI();
