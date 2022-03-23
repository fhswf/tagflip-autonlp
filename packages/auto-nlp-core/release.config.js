module.exports = {
  //useFactory: databaseConfigFactory,

  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    "@semantic-release/npm",
    '@semantic-release/git',
    "@semantic-release/github",
  ],
  extends: 'semantic-release-monorepo',
  preset: 'angular',
  branches: ['main'],
};
