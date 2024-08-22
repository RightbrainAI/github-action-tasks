# GitHub Action for the Rightbrain Tasks API

Rightbrain Tasks allow developers to create custom API endpoints that process multimodal inputs (text and/or images) using predefined prompts. These endpoints generate structured, configurable outputs, tailored to the developer’s specific requirements.

You can read more about Rightbrain Tasks over on the [Rightbrain AI docs](https://docs.rightbrain.ai).

This GitHub Action allows you to run your [Rightbrain AI](https://rightbrain.ai/) Tasks within GitHub Actions Workflows.

## Understanding the Action

This GitHub Action supports four inputs:

    task-access-token (required): A unique access token for authentication.
    task-input (optional): A JSON encoded object that defines the input for the task.
    task-input-json-file (optional): The path to a local file containing to defined input for the Task as a JSON encoded object
    task-api-host (optional): The hostname for the Rightbrain AI Tasks API, with a default value of app.rightbrain.ai.

When calling the action you _must_ supply either `task-input` or `task-input-json-file`.

Note: At the moment this Action does _NOT_ support file inputs to the API.

## Examples

We have some examples documented over in the [examples](./examples/README.md) directory.
