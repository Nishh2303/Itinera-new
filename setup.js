#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Itinera Setup Wizard');
console.log('=======================\n');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env file already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      createEnvFile();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log('\n📝 Setting up environment variables...\n');
  
  rl.question('Enter your Gemini API key (get it from https://makersuite.google.com/app/apikey): ', (apiKey) => {
    if (!apiKey.trim()) {
      console.log('❌ API key cannot be empty!');
      rl.close();
      return;
    }

    const envContent = `# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=${apiKey.trim()}
`;

    try {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created successfully!');
      console.log('\n🎉 Setup complete! You can now run:');
      console.log('   npm run dev');
    } catch (error) {
      console.error('❌ Error creating .env file:', error.message);
    }
    
    rl.close();
  });
}

rl.on('close', () => {
  console.log('\n👋 Happy coding!');
  process.exit(0);
});
