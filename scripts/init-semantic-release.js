const fs = require('fs');
const path = require('path');

const files = {
  '.npmrc': '//registry.npmjs.org/:_authToken=${NPM_TOKEN}',
  'CHANGELOG.md': '',
  '.github/workflows/release.yml': `name: Release
on:
  push:
    branches:
      - master

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      packages: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Release
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
        run: npx semantic-release`,
  '.releaserc.json': `{
  "branches": ["master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    ["@semantic-release/git", {
      "assets": ["package.json", "CHANGELOG.md"],
      "message": "chore(release): \${nextRelease.version} [skip ci]\\n\\n\${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}`
};

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function initFiles() {
  console.log('🚀 Initializing semantic-release configuration files...');

  Object.entries(files).forEach(([fileName, content]) => {
    const filePath = path.join(process.cwd(), fileName);
    
    if (!fs.existsSync(filePath)) {
      ensureDirectoryExistence(filePath);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created ${fileName}`);
    } else {
      console.log(`ℹ️ ${fileName} already exists, skipping...`);
    }
  });

  console.log('\n✨ Semantic-release initialization complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Add NPM_TOKEN to your GitHub repository secrets');
  console.log('2. Ensure your repository has a "master" branch');
  console.log('3. Make your first commit using conventional commit format');
}

initFiles();
