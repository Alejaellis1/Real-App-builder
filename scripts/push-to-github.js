// This script automates the process of pushing specified files
// to a new branch on GitHub.
//
// --- PRE-REQUISITES ---
// 1. Install the required package from your project's root directory:
//    npm install @octokit/rest
//
// 2. Set the following environment variables in your terminal or .env file:
//    - GITHUB_TOKEN: A GitHub Personal Access Token with 'repo' scope.
//    - GITHUB_OWNER: The owner of the GitHub repository (e.g., your username).
//    - GITHUB_REPO: The name of the repository.
//
// --- USAGE ---
//    node scripts/push-to-github.js
//

const { Octokit } = require('@octokit/rest');
const fs = require('fs/promises');
const path = require('path');

// --- CONFIGURATION ---
// Environment variables are used for security and flexibility.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;

// File and branch configuration
const FILE_PATHS = ['api/publish.js', 'package.json'];
const TARGET_BRANCH = 'feat/supabase-publish-api';
const BASE_BRANCH = 'main';
const COMMIT_MESSAGE = 'feat(api): create supabase-backed publish function and update deps';

/**
 * Main function to handle the GitHub API interactions.
 */
async function pushFilesToGitHub() {
  console.log('--- Starting GitHub File Push ---');

  // 1. Validation
  if (!GITHUB_TOKEN || !OWNER || !REPO) {
    throw new Error('Missing required environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  }
  console.log(`Repository: ${OWNER}/${REPO}`);
  console.log(`Target Branch: ${TARGET_BRANCH}`);

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  // 2. Read local files and prepare tree items
  const treeItems = [];
  for (const filePath of FILE_PATHS) {
    const localFilePath = path.join(__dirname, '..', filePath);
    let fileContent;
    try {
      fileContent = await fs.readFile(localFilePath, 'utf-8');
      console.log(`Successfully read file: ${filePath}`);
    } catch (error) {
      console.error(`Error reading file at ${localFilePath}`);
      throw error;
    }
    
    const { data: blobData } = await octokit.rest.git.createBlob({
      owner: OWNER,
      repo: REPO,
      content: fileContent,
      encoding: 'utf-8',
    });
    console.log(`Created blob for ${filePath}: ${blobData.sha.substring(0, 7)}`);

    treeItems.push({
      path: filePath,
      mode: '100644', // file (blob)
      type: 'blob',
      sha: blobData.sha,
    });
  }
  
  // 3. Get the SHA of the base branch (e.g., 'main')
  const { data: baseBranchRef } = await octokit.rest.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BASE_BRANCH}`,
  });
  const baseSha = baseBranchRef.object.sha;
  console.log(`Base branch '${BASE_BRANCH}' is at SHA: ${baseSha.substring(0, 7)}`);

  // 4. Get or Create the target branch
  let targetBranchSha;
  try {
    const { data: targetBranchRef } = await octokit.rest.git.getRef({
      owner: OWNER,
      repo: REPO,
      ref: `heads/${TARGET_BRANCH}`,
    });
    targetBranchSha = targetBranchRef.object.sha;
    console.log(`Found existing branch '${TARGET_BRANCH}' at SHA: ${targetBranchSha.substring(0, 7)}`);
  } catch (error) {
    if (error.status === 404) {
      console.log(`Branch '${TARGET_BRANCH}' not found. Creating it from '${BASE_BRANCH}'...`);
      const { data: newBranchRef } = await octokit.rest.git.createRef({
        owner: OWNER,
        repo: REPO,
        ref: `refs/heads/${TARGET_BRANCH}`,
        sha: baseSha,
      });
      targetBranchSha = newBranchRef.object.sha;
      console.log(`Created new branch '${TARGET_BRANCH}' at SHA: ${targetBranchSha.substring(0, 7)}`);
    } else {
      throw error;
    }
  }

  // 5. Get the latest commit and its tree
   const { data: latestCommit } = await octokit.rest.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: targetBranchSha,
  });
  const baseTreeSha = latestCommit.tree.sha;

  // 6. Create a new tree with the new files, based on the previous tree
  const { data: treeData } = await octokit.rest.git.createTree({
    owner: OWNER,
    repo: REPO,
    base_tree: baseTreeSha,
    tree: treeItems,
  });
  console.log(`Created new tree: ${treeData.sha.substring(0, 7)}`);

  // 7. Create a new commit pointing to the new tree
  const { data: commitData } = await octokit.rest.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: COMMIT_MESSAGE,
    tree: treeData.sha,
    parents: [targetBranchSha], // Parent is the latest commit on the target branch
  });
  console.log(`Created new commit: ${commitData.sha.substring(0, 7)}`);

  // 8. Update the branch reference to point to the new commit
  await octokit.rest.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${TARGET_BRANCH}`,
    sha: commitData.sha,
  });

  console.log(`\n✅ Successfully pushed changes to branch '${TARGET_BRANCH}'!`);
  console.log(`View the commit: https://github.com/${OWNER}/${REPO}/commit/${commitData.sha}`);
}

// Execute the script
pushFilesToGitHub().catch(error => {
  console.error('\n--- ❌ An error occurred ---');
  if (error.status) {
    console.error(`GitHub API Error (${error.status}): ${error.message}`);
    console.error('Check your GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO environment variables.');
  } else {
    console.error(error);
  }
  process.exit(1);
});