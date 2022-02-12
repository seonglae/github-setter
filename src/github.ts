import { Octokit } from 'octokit'
import { Command, Option } from 'clipanion'
import { readFile } from 'fs/promises'
import githubLabelSync from 'github-label-sync'
import { nestedFiles } from './fs'

const BOT_NAME = 'github-setter'
const BOT_EMAIL = 'bot@github.com'

export abstract class GithubCommand extends Command {
  token = Option.String('-t,--token', {
    required: true,
    description: 'Github personal access token(PAT)'
  })
  user = Option.String('-u,--user', {
    required: true,
    description: 'user or organization'
  })
  repo = Option.String('-r,--repo', {
    description: 'If this option passed, only that repository will be affected'
  })
  async execute() {
    const octokit = new Octokit({ auth: this.token })
    const repositories = await octokit.rest.repos.listForUser({
      username: this.user
    })
    for (const repository of repositories.data) {
      const [owner, repo] = repository.full_name.split('/')
      if (this.repo && repo !== this.repo) continue
      this.context.stdout.write(repository.full_name + '\n')
      await this.repository(owner, repo, octokit)
    }
  }

  abstract repository(
    owner: string,
    repo: string,
    octokit: Octokit
  ): Promise<unknown>
}

export class GithubFolderCommand extends GithubCommand {
  static paths = [Command.Default]
  folder = Option.String('-f,--folder', '.github', {
    description: 'Folder to apply all repo'
  })
  list: string[]
  constructor() {
    super()
  }
  async execute() {
    this.list = await nestedFiles(this.folder)
    await super.execute()
  }

  async repository(owner: string, repo: string, { rest }: Octokit) {
    for (const path of this.list) {
      const option = { owner, repo, path, sha: undefined }
      const content = await rest.repos.getContent(option).catch(() => null)
      if (content) option.sha = content.data.sha
      const file = await readFile(path)
      rest.repos.createOrUpdateFileContents({
        ...option,
        message: `meta: add default \`${this.folder}\` folder`,
        content: file.toString('base64'),
        committer: { name: BOT_NAME, email: BOT_EMAIL }
      })
    }
  }
}

export class GithubLabelCommand extends GithubCommand {
  static paths = [['labels']]
  file = Option.String('-f,--file', 'config/repo.json', {
    description: 'label config json file'
  })
  async repository(owner: string, repo: string) {
    const { labels } = await readFile(this.file).then((json) =>
      JSON.parse(String(json))
    )
    await githubLabelSync({
      accessToken: this.token,
      repo: `${owner}/${repo}`,
      labels
    })
  }
}