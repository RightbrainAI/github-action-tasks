const TaskInputSizeMaxSize = 128000

class TaskInputTooLargeError extends Error {
  constructor(taskInputSize, options) {
    super(
      `task input is too large, maximum size is ${TaskInputSizeMaxSize}, but got ${taskInputSize}`,
      options
    )
  }
}

class EmptyAccessTokenError extends Error {
  constructor(options) {
    super(
      'error decoding access token, access token must not be empty',
      options
    )
  }
}

class InvalidAccessTokenSegmentsError extends Error {
  constructor(segmentLength, options) {
    super(
      `error decoding access token, expected 3 segments but got ${segmentLength}`,
      options
    )
  }
}

class AccessTokenPayloadParsingError extends Error {
  constructor(options) {
    super('error decoding access token, payload cannot be parsed', options)
  }
}

class AccessTokenPayloadDecodingError extends Error {
  constructor(options) {
    super('error decoding access token, payload cannot be decoded', options)
  }
}

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
        throw new EmptyAccessTokenError()
      }
      // segments contain header, payload, and signature
      const segments = accessToken.split('.')
      if (segments.length !== 3) {
        throw new InvalidAccessTokenSegmentsError(segments.length)
      }
      // base64 decode, then parse the JWT payload
      return JSON.parse(atob(segments[1]))
    } catch (e) {
      switch (e.name) {
        // JSON.parse error
        case 'SyntaxError':
          throw new AccessTokenPayloadParsingError({ cause: e })
        // atob error
        case 'InvalidCharacterError':
          throw new AccessTokenPayloadDecodingError({ cause: e })
        default:
          throw e
      }
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
      this.assertTaskInputSize(taskInput)
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
    this.getTaskRunURL = function (revision) {
      let url = `https://${this.host}/api/v1/org/${this.accessToken.GetOrganizationIdentifier()}/project/${this.accessToken.GetProjectIdentifier()}/task/${this.accessToken.GetTaskIdentifer()}/run`
      if (revision) {
        url += `?revision=${revision}`
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
  }
}

module.exports = {
  AccessToken,
  Client
}
