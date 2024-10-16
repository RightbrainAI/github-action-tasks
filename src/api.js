const TaskInputSizeMaxSize = 128000

class TaskInputTooLargeError extends Error {
  constructor(taskInputSize, options) {
    super(
      `task input is too large, maximum size is ${TaskInputSizeMaxSize}, but got ${taskInputSize}`,
      options
    )
  }
}

class Client {
  constructor(host, orgID, projectID, accessToken) {
    this.host = host
    this.orgID = orgID
    this.projectID = projectID
    this.accessToken = accessToken
    this.Run = async function (taskID, taskInput, taskRevision) {
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
    this.getTaskRunURL = function (taskID, taskRevision) {
      let url = `https://${this.host}/api/v1/org/${this.orgID}/project/${this.projectID}/task/${taskID}/run`
      if (taskRevision) {
        url += `?revision=${taskRevision}`
      }
      return url
    }
    this.assertTaskInputIsJSON = function (taskInput) {
      try {
        JSON.parse(taskInput)
      } catch (e) {
        throw new Error(
          'Error running Task, expected task input to be valid JSON data',
          { cause: e }
        )
      }
    }
    this.assertTaskInputSize = function (taskInput) {
      if (taskInput.length > TaskInputSizeMaxSize) {
        throw new TaskInputTooLargeError(taskInput.length)
      }
    }
    this.getTaskInputFormData = function (taskInput) {
      const formData = new FormData()
      formData.append('task_input', taskInput)
      return formData
    }
  }
}

module.exports = {
  Client
}
