class AccessToken {
  constructor(accessToken) {
    this.decodedAccessToken = this.DecodeAccessToken(accessToken)
    this.encodedAccessToken = accessToken
  }

  GetProjectIdentifier() {
    return this.decodedAccessToken.ext.project_id
  }

  GetOrganizationIdentifier() {
    return this.decodedAccessToken.ext.org_id
  }

  GetTaskIdentifer() {
    for (const aud of this.decodedAccessToken.aud) {
      if (aud.includes('https://aud.rightbrain.ai/tasks/')) {
        return aud.split('/').pop()
      }
    }
  }

  DecodeAccessToken(accessToken) {
    try {
      if (accessToken.trim().length === 0) {
        throw new Error('access token must not be empty')
      }
      // segments contain header, payload, and signature
      const segments = accessToken.split('.')
      if (segments.length !== 3) {
        throw new Error(`expected 3 segments but got ${segments.length}`)
      }
      // base64 decode, then parse the JWT payload
      try {
        return JSON.parse(atob(segments[1]))
      } catch (e) {
        throw new Error('cannot parse payload', { cause: e })
      }
    } catch (e) {
      throw new Error(`Error decoding access token, ${e.message}`, { cause: e })
    }
  }

  String() {
    return this.encodedAccessToken
  }
}

class Client {
  constructor(host, accessToken) {
    this.host = host
    this.accessToken = accessToken
    this.Run = async function (taskInput) {
      this.assertTaskInputIsJSON(taskInput)
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
      return `https://${this.host}/api/v1/org/${this.accessToken.GetOrganizationIdentifier()}/project/${this.accessToken.GetProjectIdentifier()}/task/${this.accessToken.GetTaskIdentifer()}/run`
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
  }
}

module.exports = {
  AccessToken,
  Client
}
