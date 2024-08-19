function AccessToken(accessToken) {
  this.accessToken = accessToken
  this.GetProjectIdentifier = function () {
    return this.DecodeAccessToken().ext.project_id
  }
  this.GetOrganizationIdentifier = function () {
    return this.DecodeAccessToken().ext.org_id
  }
  this.GetTaskIdentifer = function () {
    for (const aud of this.DecodeAccessToken().aud) {
      if (aud.includes('https://aud.rightbrain.ai/tasks/')) {
        return aud.split('/').pop()
      }
    }
    throw new Error('access token contains no task identifier')
  }
  this.DecodeAccessToken = function () {
    const data = this.accessToken.split('.')[1]
    return JSON.parse(atob(data))
  }
  this.String = function () {
    return this.accessToken
  }
}

function Client(host, accessToken) {
  this.host = host
  this.accessToken = new AccessToken(accessToken)
  this.Run = async function (taskInput) {
    if (this.isInvalidTaskInputJSON(taskInput)) {
      throw new Error(
        'Error running Task, expected task input to be valid JSON data'
      )
    }
    const formData = new FormData()
    formData.append('task_input', taskInput)
    const response = await fetch(this.getTaskRunURL(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken.String()}`
      },
      body: formData
    })
    if (response.status !== 200) {
      throw new Error(
        `Error running Task, expected status code of 200, but got ${response.status}`
      )
    }
    return await response.json()
  }
  this.getTaskRunURL = function () {
    return `https://${this.host}/api/v1/org/${this.GetOrganizationIdentifier()}/project/${this.GetProjectIdentifier()}/task/${this.GetTaskIdentifer()}/run`
  }
  this.GetProjectIdentifier = function () {
    return this.accessToken.GetProjectIdentifier()
  }
  this.GetOrganizationIdentifier = function () {
    return this.accessToken.GetOrganizationIdentifier()
  }
  this.GetTaskIdentifer = function () {
    return this.accessToken.GetTaskIdentifer()
  }
  this.isInvalidTaskInputJSON = function (taskInput) {
    try {
      JSON.parse(taskInput)
    } catch (e) {
      return true
    }
    return false
  }
}

module.exports = {
  Client
}
