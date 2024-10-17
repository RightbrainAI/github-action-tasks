const core = require('@actions/core')
const { WhoAmIClient, TaskClient } = require('./api')
const fs = require('fs')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const whoAmIClient = new WhoAmIClient(core.getInput('task-api-host'))
    core.info('Created Rightbrain AI Tasks WhoAmI client.')

    const clientDetails = await whoAmIClient.GetClientDetails(
      core.getInput('task-access-token')
    )
    core.info(`Organization: ${clientDetails.org_id}`)
    core.info(`Project: ${clientDetails.project_id}`)

    const taskClient = new TaskClient(
      core.getInput('task-api-host'),
      clientDetails.org_id,
      clientDetails.project_id,
      core.getInput('task-access-token')
    )
    core.info('Created Rightbrain AI Tasks client.')
    core.info(`Task: ${core.getInput('task-id')}`)

    let taskInput = null

    if (core.getInput('task-input')) {
      core.debug('Reading task-input from `task-input`')
      taskInput = core.getInput('task-input')
    }

    if (core.getInput('task-input-json-file')) {
      core.debug('Reading task-input from `task-input-json-file`')
      taskInput = getTaskInputJSONFileContents(
        core.getInput('task-input-json-file')
      )
    }

    if (!taskInput) {
      throw new Error(
        'Either `task-input` or `task-input-json-file` is required'
      )
    }

    core.debug('Task Input:')
    core.debug('---')
    core.debug(taskInput)
    core.debug('---')

    core.info('Running Task...')
    const taskResponse = await taskClient.Run(
      core.getInput('task-id'),
      taskInput,
      core.getInput('task-revision')
    )

    core.debug('Task Response:')
    core.debug('---')
    core.debug(taskResponse)
    core.debug('---')

    core.info('Task completed!')
    core.setOutput('response', taskResponse)
  } catch (error) {
    core.error('Failed to run Task', error)
    core.setFailed(error.message)
  }
}

function getTaskInputJSONFileContents(path) {
  return fs.readFileSync(path, { encoding: 'utf8', flag: 'r' })
}

module.exports = {
  run
}
