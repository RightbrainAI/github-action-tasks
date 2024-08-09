const core = require('@actions/core')
const { Client } = require('./api')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const client = new Client(core.getInput('task-access-token'))
    core.setOutput('response', client.Run(core.getInput('task-input')))
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
