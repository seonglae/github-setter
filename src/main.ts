import { Octokit } from 'octokit'
import { Command, Option, Cli, Builtins } from 'clipanion'
import { version, name, displayName } from '../package.json'
import { readdir, stat, readFile } from 'fs/promises'
import githubLabelSync from 'github-label-sync'
import { labels } from '../config/repo.json'

const cli = new Cli({
  binaryName: name,
  binaryLabel: displayName,
  binaryVersion: version
})

abstract class GithubCommand extends Command {
  token = Option.String('-t,--token', {
    required: true,
    description: 'Github personal access token(PAT)'
  })
  user = Option.String('-u,--user', {
    required: true,
    description: 'User name to apply'
  })
  repo = Option.String('-r,--repo', {
    description: 'If this option passed, only that repository will be affected'
  })
  org = Option.String('-o, --org', {
    description:
      'If this option passes, only that organization will be affected'
  })
  async execute() {
    const octokit = new Octokit({ auth: this.token })
    const repositories = await octokit.rest.repos.listForUser({
      username: this.user
    })
    for (const repository of repositories.data) {
      const [owner, repo] = repository.full_name.split('/')
      if (this.org && owner !== this.org) continue
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
  email = Option.String('-e,--email', {
    required: true,
    description: 'Email for commiter'
  })
  list: string[]
  async execute() {
    this.list = await nestedFiles(this.folder)
    super.execute()
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
        committer: { name: this.user, email: this.email }
      })
    }
  }
}

export class GithubLabelCommand extends GithubCommand {
  static paths = [['labels']]
  async repository(owner: string, repo: string) {
    await githubLabelSync({
      accessToken: this.token,
      repo: `${owner}/${repo}`,
      labels
    })
  }
}

async function nestedFiles(folder: string, results: string[] = []) {
  const files = await readdir(folder)
  const paths = files.map((inner) => `${folder}/${inner}`)
  for (const path of paths) {
    if ((await stat(path)).isDirectory()) await nestedFiles(path, results)
    else results.push(path)
  }
  return results
}

cli.register(GithubFolderCommand)
cli.register(GithubLabelCommand)
cli.register(Builtins.HelpCommand)
cli.runExit(process.argv.slice(3), Cli.defaultContext)
