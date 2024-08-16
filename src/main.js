const core = require('@actions/core')
const { Client } = require('./api')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const client = new Client(
      core.getInput('task-api-host'),
      core.getInput('task-access-token')
    )
    core.info('Created Rightbrain AI Tasks client:')
    core.info(`Organization: ${client.GetOrganizationIdentifier()}`)
    core.info(`Project: ${client.GetProjectIdentifier()}`)
    core.info(`Task: ${client.GetTaskIdentifer()}`)

    core.debug('Running Task')
    const response = await client.Run(core.getInput('task-input'))
    core.debug('---')
    core.debug(response)
    core.debug('---')

    core.debug('Task completed')
    core.setOutput('response', response)
  } catch (error) {
    core.error('Failed to run Task', error)
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
