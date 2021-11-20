import { Octokit } from 'octokit'
import { Command, Option, Cli, Builtins } from 'clipanion'
import { version, name, displayName } from '../package.json'
import { readdir, stat, readFile } from 'fs/promises'

const cli = new Cli({
  binaryName: name,
  binaryLabel: displayName,
  binaryVersion: version
})

export class GithubSetCommand extends Command {
  static paths = [Command.Default]
  token = Option.String('-t,--token', {
    required: true,
    description: 'Github personal access token(PAT)'
  })
  user = Option.String('-u,--user', {
    required: true,
    description: 'User name to apply'
  })
  folder = Option.String('-f,--folder', '.github', {
    description: 'Folder to apply all repo'
  })

  async execute() {
    this.context.stdout.write(`\nSet all repo in ${this.user}\n`)

    const { rest } = new Octokit({ auth: this.token })
    const repositories = await rest.repos.listForUser({
      username: this.user
    })
    for (const repository of repositories.data) {
      this.context.stdout.write(repository.full_name + '\n')
      const [owner, repo] = repository.full_name.split('/')
      const list = await nestedFiles(this.folder)
      for (const path of list) {
        const option = { owner, repo, path, sha: undefined }
        const content = await rest.repos.getContent(option).catch(() => null)
        if (content) option.sha = content.data.sha
        const file = await readFile(path)
        rest.repos.createOrUpdateFileContents({
          ...option,
          message: `chore: add ${this.folder} folder basic`,
          content: file.toString('base64'),
          committer: {
            name: 'seonglae',
            email: 'sungle3737@gmail.com'
          }
        })
      }
    }
  }
}

async function nestedFiles(folder, results = []) {
  const files = await readdir(folder)
  const paths = files.map((inner) => `${folder}/${inner}`)
  for (const path of paths) {
    if ((await stat(path)).isDirectory()) await nestedFiles(path, results)
    else results.push(path)
  }
  return results
}

cli.register(GithubSetCommand)
cli.register(Builtins.HelpCommand)
cli.runExit(process.argv.slice(3), Cli.defaultContext)
