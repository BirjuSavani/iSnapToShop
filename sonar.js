const scanner = require('sonarqube-scanner');

scanner.customScanner(
  {
    serverUrl: 'http://localhost:9000',
    token: 'sqa_4a78d2176dd34a963af39e616da8c47d3e41fdd8',
    options: {
      'sonar.projectKey': 'iSnapToShop',
      'sonar.sources': './',
      'sonar.exclusions': 'node_modules/**',
    },
  },
  () => {
    console.log('SonarQube scan completed.');
  }
);
