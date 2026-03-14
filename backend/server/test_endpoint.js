const fs = require('fs');
const url = 'http://localhost:3001/api/analyze';
const data = { repoUrl: 'rahulsp19/Test_repo1' };

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then(response => response.json())
  .then(data => {
    fs.writeFileSync('c:\\Users\\Rahul SP\\Gitsolve\\backend\\server\\test_res.json', JSON.stringify(data, null, 2));
    console.log('Saved to test_res.json');
  })
  .catch((error) => console.error('Error:', error));
