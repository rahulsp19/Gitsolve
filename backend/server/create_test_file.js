const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/Rahul SP/Gitsolve/backend/server/.env' });

const token = process.env.GITHUB_TOKEN;
const owner = 'rahulsp19';
const repo = 'Test_repo';

const fileContent = `
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void processUserData(char* input) {
    // SECURITY RISK: Buffer overflow vulnerability
    char buffer[50];
    strcpy(buffer, input);
    printf("Processing: %s\\n", buffer);
}

int calculateTotal(int items) {
    // LOGIC ERROR: Uninitialized variable
    int total;
    for(int i = 0; i < items; i++) {
        total += i;
    }
    return total;
}

int main() {
    // DEFAULT BUG: Memory leak because it's not freed
    char* dynamic_string = malloc(100 * sizeof(char));
    
    // Unused variable
    int unused_counter = 42;
    
    processUserData("This is a very long string that might just overflow the 50 character buffer we allocated above!");
    printf("Total: %d\\n", calculateTotal(10));
    
    return 0;
}
`;

async function addFile() {
  console.log("Adding file to", repo);
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/main.c`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      message: 'Add vulnerable main.c for AI analysis testing',
      content: Buffer.from(fileContent).toString('base64')
    })
  });
  
  const text = await response.text();
  console.log(response.status, text);
}

addFile();
