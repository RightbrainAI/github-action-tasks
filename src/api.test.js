const { AccessToken, Client } = require('./api')

describe('AccessToken Class', () => {
  const fakeProjectIdentifier = '4c095d2f-032b-4f5e-bb6f-5eb03bbff404'
  const fakeOrganizationIdentifier = 'ba5edcc7-c70d-4bff-b71e-154fea8fa50d'
  const fakeTaskIdentifer = 'aa93e61c-90d0-45bf-8e03-e0e10271ce8f'

  let accessToken

  beforeEach(() => {
    accessToken = `header.${btoa(
      JSON.stringify({
        ext: {
          project_id: fakeProjectIdentifier,
          org_id: fakeOrganizationIdentifier
        },
        aud: [`https://aud.rightbrain.ai/tasks/${fakeTaskIdentifer}`]
      })
    )}.signature`
  })

  test('should return correct project identifier', () => {
    expect(new AccessToken(accessToken).GetProjectIdentifier()).toBe(
      fakeProjectIdentifier
    )
  })

  test('should return correct organization identifier', () => {
    expect(new AccessToken(accessToken).GetOrganizationIdentifier()).toBe(
      fakeOrganizationIdentifier
    )
  })

  test('should return correct task identifier', () => {
    expect(new AccessToken(accessToken).GetTaskIdentifer()).toBe(
      fakeTaskIdentifer
    )
  })

  test('should return original access token', () => {
    expect(new AccessToken(accessToken).String()).toBe(accessToken)
  })

  test('should throw error with empty access token', () => {
    expect(() => {
      new AccessToken('')
    }).toThrow('error decoding access token, access token must not be empty')
  })

  test('should throw error with invalid access token segment count', () => {
    expect(() => {
      new AccessToken('one')
    }).toThrow('error decoding access token, expected 3 segments but got 1')
    expect(() => {
      new AccessToken('one.two')
    }).toThrow('error decoding access token, expected 3 segments but got 2')
    expect(() => {
      new AccessToken('one.two.three.four')
    }).toThrow('error decoding access token, expected 3 segments but got 4')
  })

  test('should throw error with invalid access token payload', () => {
    expect(() => {
      const invalidAccessTokenPayload = `header.⛌.signature`
      new AccessToken(invalidAccessTokenPayload)
    }).toThrow('error decoding access token, payload cannot be decoded')
    expect(() => {
      const invalidAccessTokenPayload = `header.${btoa('{,')}.signature`
      new AccessToken(invalidAccessTokenPayload)
    }).toThrow('error decoding access token, payload cannot be parsed')
  })
})
