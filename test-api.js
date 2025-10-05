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

CRITICAL: Respond with ONLY valid JSON. No text before/after. No markdown blocks. Keep descriptions concise (1-2 sentences max).

JSON structure:
{
  "itinerary_options": [
    {
      "type": "Balanced",
      "summary": "Brief description",
      "itinerary": [
        {
          "day": 1,
          "theme": "Day theme",
          "morning": {"activity": "Activity", "description": "Brief description"},
          "afternoon": {"activity": "Activity", "description": "Brief description"},
          "evening": {"activity": "Activity", "description": "Brief description"},
          "food": {"lunch": "Suggestion", "dinner": "Suggestion"}
        }
      ],
      "accommodation_suggestions": [
        {"name": "Hotel", "type": "Type", "description": "Brief description"}
      ]
    }
  ]
}

ONLY return the JSON object.`;

async function testAPI() {
  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: testQuery }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 8000
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
      console.log('\n📄 Raw Response (first 500 chars):');
      console.log(responseText.substring(0, 500) + '...');
      console.log('\n📏 Total response length:', responseText.length, 'characters');
      
      try {
        // Clean up the response text to extract valid JSON
        let cleanedText = responseText.trim();
        
        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Try to find JSON object in the response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }
        
        const parsed = JSON.parse(cleanedText);
        console.log('\n✅ JSON parsed successfully!');
        console.log('📊 Response structure:', {
          hasItineraryOptions: !!parsed.itinerary_options,
          optionsCount: parsed.itinerary_options?.length || 0
        });
      } catch (parseError) {
        console.log('\n❌ JSON Parse Error:', parseError.message);
        console.log('🔍 Attempting to clean response...');
        console.log('📄 Raw response:', responseText);
      }
    } else {
      console.log('❌ Unexpected response structure:', result);
    }

  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testAPI();
