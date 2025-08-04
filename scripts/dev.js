#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting development build...');

// Build TypeScript
const tsc = spawn('tsc', ['--watch'], {
  stdio: 'pipe',
  shell: true,
  cwd: process.cwd()
});

tsc.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Check if compilation is successful
  if (output.includes('Found 0 errors')) {
    console.log('✅ Build successful!');
  }
});

tsc.stderr.on('data', (data) => {
  console.error('Build error:', data.toString());
});

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development server...');
  tsc.kill();
  process.exit(0);
});
