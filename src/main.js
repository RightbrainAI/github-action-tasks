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

    const taskInput = core.getInput('task-input')

    core.info('Running Task...')
    const taskResponse = await client.Run(taskInput)

    core.debug('Task Input:')
    core.debug('---')
    core.debug(toPrettyJSON(taskInput))
    core.debug('---')

    core.debug('Task Response:')
    core.debug('---')
    core.debug(toPrettyJSON(taskResponse))
    core.debug('---')

    core.info('Task completed!')
    core.setOutput('response', taskResponse)
  } catch (error) {
    core.error('Failed to run Task', error)
    core.setFailed(error.message)
  }
}

function toPrettyJSON(json) {
  let obj = json
  if (typeof obj === 'string') {
    obj = JSON.parse(json)
  }
  return JSON.stringify(obj, null, 2)
}

module.exports = {
  run
}
