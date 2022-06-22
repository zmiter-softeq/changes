const core = require('@actions/core');
const files = require('../src/files');
const utils = require('../src/utils');

const context = {
  repo: {
    owner: 'cocorobotics',
    repo: 'delivery-platform',
  },
  eventName: 'push',
  payload: {
    before: '7a9d14731c998fd37f31ab84c8813e75dba6aae9',
    after: '43a0b26d3d708574a83da6500f673c2c396e5d4a',
  },
};

describe('main', () => {
  let spy = {};

  beforeEach(() => {
    spy = {
      info: jest.spyOn(core, 'info').mockImplementation(jest.fn()),
      setFailed: jest.spyOn(core, 'setFailed').mockImplementation(jest.fn()),
      setOutput: jest.spyOn(core, 'setOutput').mockImplementation(jest.fn()),
      commitDiff: jest.spyOn(files, 'commitDiff'),
      changedServices: jest.spyOn(utils, 'changedServices'),
    };
  });

  afterEach(() => {
    Object.entries(spy).forEach(([, s]) => s.mockRestore());
  });

  it('case-1', async () => {
    const changes = require('./changes_1.json');
    const main = require('../src/main');
    const input = {
      context,
      token: process.env.GITHUB_TOKEN,
      folderInput: 'service',
      excludeInput: '',
    };

    await main(input);

    expect(spy.changedServices).toHaveBeenNthCalledWith(1, changes, [], 'service');
    expect(spy.commitDiff.mock.calls[0][1]).toEqual({
      base: '7a9d14731c998fd37f31ab84c8813e75dba6aae9',
      head: '43a0b26d3d708574a83da6500f673c2c396e5d4a',
      repo: {
        owner: 'cocorobotics',
        repo: 'delivery-platform',
      },
    });
    expect(spy.info.mock.calls[0]).toEqual(['base 7a9d14731c998fd37f31ab84c8813e75dba6aae9, head: 43a0b26d3d708574a83da6500f673c2c396e5d4a']);
    expect(spy.info.mock.calls[1]).toEqual(['Generating matrix: {"services":["device","order","routing-server"]}']);
  });
});
