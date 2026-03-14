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
    console.log("Graph Nodes:", data.graph?.nodes?.length);
    console.log("Graph Edges:", data.graph?.edges?.length);
    console.log("Reasoning Path length:", data.graph?.reasoning_path?.length);
    if(data.graph) {
         console.log(JSON.stringify(data.graph.nodes, null, 2));
    }
  })
  .catch((error) => console.error('Error:', error));
