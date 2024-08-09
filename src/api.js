function AccessToken(accessToken) {
  this.accessToken = accessToken
  this.GetTaskIdentifer = function () {
    for (const aud of this.DecodeAccessToken().aud) {
      if (aud.includes('https://aud.rightbrain.ai/tasks/')) {
        return aud.split('/').pop()
      }
    }
    throw new Error('access token contains no task identifier')
  }
  this.GetProjectIdentifier = function () {
    return this.DecodeAccessToken().ext.project_id
  }
  this.GetOrganizationIdentifier = function () {
    return this.DecodeAccessToken().ext.org_id
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
    const formData = new FormData()
    formData.append('task_input', JSON.stringify(taskInput))
    const response = await fetch(this.GetTaskRunURL(), {
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
    return await response.json().response
  }
  this.GetTaskRunURL = function () {
    return `https://${this.host}/api/v1/org/${this.accessToken.GetProjectIdentifier()}/project/${this.accessToken.GetProjectIdentifier()}/task/${this.accessToken.GetTaskIdentifer()}/run`
  }
}

module.exports = {
  Client
}
