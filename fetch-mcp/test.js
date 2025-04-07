const { spawn } = require('child_process');

async function testFetchType(type) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['dist/index.js']);
    
    const testRequest = {
      type,
      url: 'http://localhost:3000',
      headers: {
        'User-Agent': 'Fetch MCP Test',
        'Accept': 'text/html,application/json,text/plain'
      }
    };

    console.log('Sending request:', testRequest);
    server.stdin.write(JSON.stringify(testRequest) + '\n');

    let responseData = '';
    server.stdout.on('data', (data) => {
      responseData += data.toString();
      process.stdout.write('.');  // Show progress
    });

    server.stdout.on('end', () => {
      console.log(`\n=== Testing ${type} ===`);
      try {
        const response = JSON.parse(responseData);
        if (response.error) {
          console.error('Error in response:', response.error);
        } else {
          // For HTML and Markdown, just show the first 500 characters
          if (type === 'fetch_html' || type === 'fetch_markdown') {
            console.log('Response preview (first 500 chars):', response.content.substring(0, 500));
          } else {
            console.log('Response:', response);
          }
        }
        server.kill();
        resolve();
      } catch (error) {
        console.error('Error parsing response:', error);
        console.error('Raw response:', responseData);
        server.kill();
        reject(error);
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`Error testing ${type}:`, data.toString());
      server.kill();
      reject(new Error(data.toString()));
    });

    // Increase timeout to 30 seconds
    setTimeout(() => {
      console.error('Request timed out');
      server.kill();
      reject(new Error('Request timed out'));
    }, 30000);
  });
}

async function runTests() {
  try {
    await testFetchType('fetch_html');
    await testFetchType('fetch_txt');
    await testFetchType('fetch_markdown');
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
  process.exit(0);
}

runTests(); 