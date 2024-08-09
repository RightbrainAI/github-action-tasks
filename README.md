# GitHub Action for the Rightbrain AI Tasks API

This GitHub Action allows you to run you [Rightbrain AI](https://rightbrain.ai/)
Tasks within your GitHub Actions Workflows.

## Understanding the Action

The action defined in the action.yml file interacts with the Rightbrain AI Tasks
API. It requires three inputs:

    task-access-token (required): A unique access token for authentication.
    task-input (required): A JSON encoded object that defines the input for the task.
    task-api-host (Optional): The hostname for the Rightbrain AI Tasks API, with a default value of app.rightbrain.ai.

## Example of a Workflow to Run a Task

```yaml
name: Run Rightbrain AI Task

on:
  push:
    branches:
      - main
jobs:
  run-task:
    runs-on: ubuntu-latest
    steps:
      - name: Run Rightbrain AI Task
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

When called, the Action will return a string containing the full JSON response
from the API as detailed over on the
[Rightbrain AI docs](https://rightbrain.docs.buildwithfern.com/api-reference/tasks/run-task).
