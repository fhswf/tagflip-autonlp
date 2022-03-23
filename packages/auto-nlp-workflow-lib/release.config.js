module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/git',
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      {
        assets: ['CHANGELOG.md'],
      },
    ],
  ],
  extends: 'semantic-release-monorepo',
  preset: 'angular',
  branches: ['main'],
};
