const { execSync } = require('child_process');

try {
  const result = execSync("curl -s http://localhost:8080 | head -n 20").toString();
  console.log(result);
} catch (error) {
  console.error("Error executing curl:", error);
}
