const TaskInputSizeMaxSize = 128000

const defaultApiVersion = 'v1'

class TaskInputTooLargeError extends Error {
  constructor(taskInputSize, taskInputMaxSize, options) {
    super(
      `task input is too large, maximum size is ${taskInputMaxSize}, but got ${taskInputSize}`,
      options
    )
  }
}

class TaskClientConfig {
  constructor(host, orgID, projectID, taskInputMaxSize) {
    this.host = host
    this.orgID = orgID
    this.projectID = projectID
    this.taskInputMaxSize = parseInt(taskInputMaxSize, 10)
  }
}

class TaskClient {
  constructor(config, accessToken) {
    this.config = config
    this.accessToken = accessToken
  }

  async Run(taskID, taskInput, taskRevision) {
    const url = await this.getTaskRunURL(taskID, taskRevision)

    this.assertTaskInputIsJSON(taskInput)
    this.assertTaskInputSize(taskInput)
    this.assertTaskRunURL(url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      body: this.getTaskInputFormData(taskInput)
    })
    if (response.status !== 200) {
      throw new Error(
        `Error running Task, expected status code of 200, but got ${response.status}: ${response.statusText}`
      )
    }
    return await response.json()
  }

  async getTaskRunURL(taskID, taskRevision) {
    let url = `https://${this.config.host}/api/${defaultApiVersion}/org/${this.config.orgID}/project/${this.config.projectID}/task/${taskID}/run`
    if (taskRevision) {
      url += `?revision_id=${taskRevision}`
    }
    return url
  }

  assertTaskInputIsJSON(taskInput) {
    try {
      JSON.parse(taskInput)
    } catch (e) {
      throw new Error(
        'Error running Task, expected task input to be valid JSON data',
        { cause: e }
      )
    }
  }

  assertTaskRunURL(url) {
    try {
      new URL(url)
      // URL is valid
    } catch (e) {
      throw new Error(
        `Error running Task, expected task run URL to be valid, but got ${url}`,
        { cause: e }
      )
    }
  }

  assertTaskInputSize(taskInput) {
    if (taskInput.length > this.config.taskInputMaxSize) {
      throw new TaskInputTooLargeError(
        taskInput.length,
        this.config.taskInputMaxSize
      )
    }
  }

  getTaskInputFormData(taskInput) {
    const formData = new FormData()
    formData.append('task_input', taskInput)
    return formData
  }
}

module.exports = {
  TaskClientConfig,
  TaskClient
}
