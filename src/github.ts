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
    description: 'Github personal access token(PAT)',
  })
  user = Option.String('-o,--owner', {
    required: true,
    description: 'user or organization',
  })
  repo = Option.String('-r,--repo', {
    description: '(RegEx) If this option passed, only regex passed repository will be affected',
  })
  async execute() {
    const octokit = new Octokit({ auth: this.token })
    const repositories = await octokit.rest.repos.listForUser({
      username: this.user,
      per_page: 100,
    })
    const promises = []
    for (const repository of repositories.data) {
      const [owner, repo] = repository.full_name.split('/')
      const dftBranch = repository.default_branch
      if (!new RegExp(this.repo).test(repo)) continue
      this.context.stdout.write(repository.full_name + '\n')
      promises.push(this.repository(owner, repo, octokit, dftBranch))
    }
    await Promise.all(promises)
  }

  abstract repository(owner: string, repo: string, octokit: Octokit, branch: string): Promise<unknown>
}

export class GithubFolderCommand extends GithubCommand {
  static paths = [Command.Default]
  async = Option.Boolean('-a,--async')
  folder = Option.String('-f,--folder', '.github', {
    description: 'Folder to apply all repo',
  })
  list: string[]
  constructor() {
    super()
  }
  async execute() {
    this.list = await nestedFiles(this.folder)
    await super.execute()
  }

  async repository(owner: string, repo: string, octokit: Octokit) {
    const promises = []
    for (const path of this.list)
      if (this.async) promises.push(this.uploadFile(owner, repo, octokit, path))
      else await this.uploadFile(owner, repo, octokit, path)
    await Promise.all(promises)
  }

  async uploadFile(owner: string, repo: string, { rest }: Octokit, path: string) {
    const option = { owner, repo, path, sha: undefined }
    const content = await rest.repos.getContent(option).catch(() => null)
    if (content) option.sha = content.data.sha
    const file = await readFile(path)
    rest.repos.createOrUpdateFileContents({
      ...option,
      message: `meta: add default \`${this.folder}\` folder`,
      content: file.toString('base64'),
      committer: { name: BOT_NAME, email: BOT_EMAIL },
    })
  }
}
export class GithubBranchProtectionCommand extends GithubCommand {
  static paths = [['branch', 'protection']]
  file = Option.String('-f,--file', {
    required: true,
    description: 'Config file for branch',
  })
  branch = Option.String('-d,--default', 'main', {
    description: 'New Default branch name',
  })
  list: string[]
  constructor() {
    super()
  }

  async repository(owner: string, repo: string, octokit: Octokit, branch: string) {
    await this.branchProtection(owner, repo, octokit, branch)
  }

  async branchProtection(owner: string, repo: string, { rest }: Octokit, branch: string) {
    if (this.branch !== branch) await rest.repos.renameBranch({ owner, repo, branch, new_name: this.branch })
    const config = await readFile(this.file).then(json => JSON.parse(String(json)))
    await rest.repos.updateBranchProtection({
      owner,
      repo,
      branch: this.branch,
      required_status_checks: null,
      restrictions: null,
      ...config,
    })
  }
}

export class GithubLabelCommand extends GithubCommand {
  static paths = [['labels']]
  file = Option.String('-f,--file', 'config/repo.json', {
    description: 'label config json file',
  })
  async repository(owner: string, repo: string) {
    const { labels } = await readFile(this.file).then(json => JSON.parse(String(json)))
    await githubLabelSync({
      accessToken: this.token,
      repo: `${owner}/${repo}`,
      labels,
    })
  }
}
