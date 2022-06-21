const { setFailed, info, getInput, setOutput } = require('@actions/core');
const { context, GitHub } = require('@actions/github');
const { commitDiff } = require('./src/files');
const { changedServices, getInputList } = require('./src/utils');

(async () => {
  const client = new GitHub(getInput('token', { required: true }));
  const folderInput = getInput('folder', { required: false });
  const excludeInput = getInput('exclude', { required: false });
  const eventName = context.eventName;

  const exclude = getInputList(excludeInput);

  let base, head;

  switch (eventName) {
    case 'pull_request':
      base = context.payload.pull_request.base.sha;
      head = context.payload.pull_request.head.sha;
      break;
    case 'push':
      base = context.payload.before;
      head = context.payload.after;
      break;
    default:
      setFailed(`Failed to determine event type ${eventName}`);
  };

  info(`base ${base}, head: ${head}`);

  if (!base || !head) {
    setFailed(
      `Couldn't determine base and head commits sha from the payload ${context}`
    );
  };

  const changedFilesInCommit = await commitDiff(client, {
    repo: {
      owner: context.repo.owner,
      repo: context.repo.repo
    },
    base,
    head,
  });

  const filterDeterminedFilesChanges = changedServices(changedFilesInCommit, exclude, folderInput);

  if (!filterDeterminedFilesChanges.length) {
    setFailed(
      `Couldn't construct correct matrix for services, perhaps, diff contains only files and they are not in ` +
      `corresponding folder ${folderInput}`
    )
  } else {

    const matrix = JSON.stringify({"services": filterDeterminedFilesChanges});  
    info(`Generating matrix: ${matrix}`);

    setOutput('matrix', matrix);
  }
})()