# Pull Request Summary Task

This guide demonstrates how to use the Rightbrain Tasks API to generate a non-technical summary for any GitHub Pull Request (PR) created using this GitHub Actions Workflow. The workflow integrates with the [thollander/actions-comment-pull-request](https://github.com/thollander/actions-comment-pull-request) action, ensuring the summary remains relevant with any new changes pushed to the PR.

## Configuration

To run this task, you need to create a Task using the [Rightbrain Tasks API](https://docs.rightbrain.ai/api-reference/tasks/create-task) with the following configuration:

### Task Options

    Name: A non-technical summary of a GitHub Pull Request
    Description: Generates a summary for a given Pull Request using Rightbrain AI
    LLM Model: gpt-4o
    Output Format: summary of type str
    Image Required: false

### Prompt

While the Task is designed to produce a non-technical summary for PRs, you can customize the prompt to suit different audiences or personas:

```
  You are an expert software program specifically designed for the software industry that will be used to provide a summary of a Pull Request to a team so that they can quickly understand the impact of the change proposed.

  When composing your summary, please follow these guidelines:

  - Consider that the audience will be a team with no technical experience
  - Use non-technical language to summarise the changes
  - Use a friendly tone of voice
  - Make sure to emphasise any important changes
  - The `title` and `description` sections will help you gather context from the author, the `diff` section contains a diff in git diff format, which will allow you to understand the code changes proposed.

  Please use the `title`, `description`, and `diff` sections below to create your summary.

  title:
    {title}

  description:
    {description}

  diff:
    {diff}

  You will provide the summary in GitHub Markdown format, and use paragraphs where appropriate.

```

### GitHub Actions Workflow

After creating the Task, you will receive a unique Access Token. Store this token as a GitHub Actions Repository Secret named NON_TECHNICAL_SUMMARY_TASK_ACCESS_TOKEN. This token will be used in our Workflow.

The Workflow consists of a single Job with four key Steps:

- Build Task Input: Gathers the necessary data (e.g., PR title, description, and diff) to pass to the Task.
- Obtain Summary: Calls the Task with the provided input to generate the summary.
- Display Summary: Outputs the generated summary in the Actions logs.
- Leave Summary: Posts the summary as a comment on the PR.

```yaml
on:
  pull_request:
permissions:
  contents: read
  pull-requests: write
env:
  TASK_INPUT_JSON_FILE: /tmp/task_input.json
jobs:
  create-non-technical-summary:
    runs-on: ubuntu-latest
    steps:
      - name: Build Task Input
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');

            const diffUrl = 'https://api.github.com/repos/${{ github.repository }}/pulls/${{ github.event.pull_request.number }}'
            const response = await fetch(diffUrl, {
              method: 'GET',
              headers: {
                Accept: 'application/vnd.github.diff',
                Authorization: 'Bearer ${{ secrets.GITHUB_TOKEN }}'
              },
            })

            const taskInputs = {
              title: context.payload.pull_request.title,
              description: context.payload.pull_request.body,
              diff: await response.text()
            }

            fs.writeFileSync(process.env.TASK_INPUT_JSON_FILE, JSON.stringify(taskInputs))
      - name: Obtain Summary
        id: obtain-summary
        uses: RightbrainAI/github-action-tasks@main
        with:
          task-access-token: ${{ secrets.NON_TECHNICAL_SUMMARY_TASK_ACCESS_TOKEN }}
          task-input-json-file: ${{ env.TASK_INPUT_JSON_FILE }}
      - name: Display Summary
        run: |
          echo "OK, here's your summary:"; echo;
          {
            cat << 'EOF'
              ${{ toJSON(steps.obtain-summary.outputs.response) }}
          EOF
          } | jq 'fromjson | .response.summary'
      - name: Leave Summary
        uses: thollander/actions-comment-pull-request@v2
        with:
          message: |
            :wave: I'm a :bot:, and this is a Rightbrain Task that provides an automated **non-technical** summary for this PR.

            ${{ fromJSON(steps.obtain-summary.outputs.response).response.summary }}

          comment_tag: non-technical
```
