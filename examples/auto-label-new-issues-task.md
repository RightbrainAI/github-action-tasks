# Auto-Label New Issues Task

This guide demonstrates how to use the Rightbrain Tasks API to automatically label any new GitHub Issues created within a repository with a matching set of labels.

## Configuration

To run this task, you need to create a Task using the [Rightbrain Tasks API](https://docs.rightbrain.ai/api-reference/tasks/create-task) with the following configuration:

### Task Options

    Name: GitHub Issue Auto-Labeller
    Description: Auto-label any newly created issues with matching defined repository labels
    LLM Model: gpt-4o
    Output Format: labels of type str
    Image Required: false

### Prompt

Here we're going to ask the selected LLM to look at all the available labels, then filter them by using the issue title and body.

```
    Your purpose is to analyse a list of JSON formatted labels and return a filtered list of labels that are deemed relevant to a given GitHub Issue.

    Using the following JSON array of labels:

    labels:
    ```json
        {labels}
    ```

    I'd like you to use the ``name` and `description` fields of the labels to determine what labels you think are relevant to the following GitHub Issue `title` and `body` supplied below.

    title:
        {title}

    body:
        {body}

    If you are unsure of a given label, please lean towards omitting it rather than including it.

    Return the matching labels as a list of label names.
```

### GitHub Actions Workflow

After creating the Task, you will receive a unique Access Token. Store this token as a GitHub Actions Repository Secret named ISSUE_LABELLER_TASK_ACCESS_TOKEN. This token will be used in our Workflow.

The Workflow consists of a single Job with three key Steps:

- Obtain Available Labels: Obtains all the labels defined within the target repository.
- Obtain Relevant Labels: Calls the Task with the issue title, description, and repository labels for filtering.
- Apply Relevant Labels: Applies the filtered labels to the newly created issue.

```yaml
name: auto-label new issues
on:
  issues:
    types:
      - opened
permissions:
  issues: write
  contents: read
jobs:
  auto-label-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Obtain Available Labels
        id: obtain-available-labels
        uses: actions/github-script@v7
        with:
          script: |
            const res = await github.rest.issues.listLabelsForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
            })
            return res.data
      - name: Obtain Relevant Labels
        id: obtain-relevant-labels
        uses: RightbrainAI/github-action-tasks@main
        with:
          task-access-token: ${{ secrets.ISSUE_LABELLER_TASK_ACCESS_TOKEN }}
          task-input: |
            {
                "title": ${{ toJSON(github.event.issue.title) }},
                "body": ${{ toJSON(github.event.issue.body) }},
                "labels": ${{ toJSON(steps.obtain-available-labels.outputs.result) }}
            }
      - name: Apply Relevant Labels
        uses: actions/github-script@v7
        with:
          script: |-
            const api = JSON.parse(${{ toJSON(steps.obtain-relevant-labels.outputs.response) }})

            console.log(`We found ${ api.response.labels.length } matching labels`)

            if (api.response.labels) {
              await github.request('PUT /repos/{owner}/{repo}/issues/{issue_number}/labels', {
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: ${{ github.event.issue.number }},
                labels: api.response.labels,
                headers: {
                  'X-GitHub-Api-Version': '2022-11-28'
                }
              })
            }
```
