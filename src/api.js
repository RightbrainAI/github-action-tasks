const TaskInputSizeMaxSize = 128000

const defaultApiVersion = 'v1'

class TaskInputTooLargeError extends Error {
  constructor(taskInputSize, options) {
    super(
      `task input is too large, maximum size is ${TaskInputSizeMaxSize}, but got ${taskInputSize}`,
      options
    )
  }
}

class TaskClient {
  constructor(host, orgID, projectID, accessToken) {
    this.host = host
    this.orgID = orgID
    this.projectID = projectID
    this.accessToken = accessToken
  }

  async Run(taskID, taskInput, taskRevision) {
    this.assertTaskInputIsJSON(taskInput)
    this.assertTaskInputSize(taskInput)
    const response = await fetch(this.getTaskRunURL(taskID, taskRevision), {
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
    let url = `https://${this.host}/api/${defaultApiVersion}/org/${this.orgID}/project/${this.projectID}/task/${taskID}/run`
    if (taskRevision) {
      url += `?revision=${taskRevision}`
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

  assertTaskInputSize(taskInput) {
    if (taskInput.length > TaskInputSizeMaxSize) {
      throw new TaskInputTooLargeError(taskInput.length)
    }
  }

  getTaskInputFormData(taskInput) {
    const formData = new FormData()
    formData.append('task_input', taskInput)
    return formData
  }
}

class WhoAmIClient {
  constructor(apiHost) {
    this.apiHost = apiHost
  }
  async GetClientDetails(accessToken) {
    if (!accessToken) {
      throw new Error(
        `cannot get client details, expected access token to not be empty`
      )
    }
    const res = await fetch(this.GetAPIWhoAmIURL(this.apiHost), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (res.status !== 200) {
      throw new Error(
        `cannot get client details, expected 200 but got ${res.status}: ${res.statusText}`
      )
    }
    const details = await res.json()
    if (!details.client) {
      throw new Error(
        `cannot get client details, expected response to contain client details`
      )
    }
    return details.client
  }

  GetAPIWhoAmIURL(host) {
    return `https://${host}/api/${defaultApiVersion}/whoami`
  }
}

module.exports = {
  TaskClient,
  WhoAmIClient
}
