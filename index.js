const core = require('@actions/core');
const github = require('@actions/github');

try {
  const base = github.context.payload.pull_request.base.sha
  const head = github.context.payload.pull_request.head.sha

  console.log(base, head);
} catch (error) {
  core.setFailed(error.message);
}