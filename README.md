# GitHub Action for the Rightbrain AI Tasks API

Rightbrain AI Tasks allow developers to create custom API endpoints that process multimodal inputs (text and/or images) using predefined prompts. These endpoints generate structured, configurable outputs, tailored to the developer’s specific requirements.

You can read more about Rightbrain AI Tasks over on the [Rightbrain AI docs](https://docs.rightbrain.ai).

This GitHub Action allows you to run your [Rightbrain AI](https://rightbrain.ai/) Tasks within GitHub Actions Workflows.

## Understanding the Action

This GitHub Action supports four inputs:

    task-access-token (required): A unique access token for authentication.
    task-input (optional): A JSON encoded object that defines the input for the task.
    task-input-json-file (optional): The path to a local file containing to defined input for the Task as a JSON encoded object
    task-api-host (optional): The hostname for the Rightbrain AI Tasks API, with a default value of app.rightbrain.ai.

When calling the action you _must_ supply either `task-input` or `task-input-json-file`.

Note: At the moment this Action does _NOT_ support file inputs to the API.

## Example of a Workflow to Run a Task

```yaml
name: Run Rightbrain AI Task

on:
  push:
    branches:
      - main
jobs:
  demo:
    runs-on: ubuntu-latest
    steps:
      - name: Run Rightbrain AI Task
        id: run-task
        uses: RightbrainAI/github-action-tasks@main
        with:
          task-access-token: ${{ secrets.TASK_ACCESS_TOKEN }}
          task-input: |
            {
              "key1": "value1",
              "key2": "value2"
            }
      - name: Use Rightbrain AI Task response
        run: echo ${{ steps.run-task.outputs.response }}
```

When called, the Action will return a string containing the full JSON response from the API as detailed over on the [Rightbrain AI docs](https://rightbrain.docs.buildwithfern.com/api-reference/tasks/run-task).

Here's a simple example of using the JSON response in a GitHub Actions Workflow, where a previously created Rightbrain Task has an input of `subject` and an output of `joke` defined:

```yaml
on:
  workflow_dispatch:
    inputs:
      subject:
        description: The subject for the required joke
        required: true

jobs:
  get-joke:
    runs-on: ubuntu-latest
    steps:
      - id: find-joke
        uses: RightbrainAI/github-action-tasks@main
        with:
          task-access-token: ${{ secrets.TASK_ACCESS_TOKEN }}
          task-input: |
            {
              "subject": "${{ inputs.subject }}"
            }
      - run: |
          echo "OK, here's your ${{ inputs.subject }} Joke:"
          echo " > ${{ fromJSON(steps.find-joke.outputs.response).response.joke }}"
```
