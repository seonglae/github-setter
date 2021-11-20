import { Octokit } from 'octokit'
import { Command, Option, Cli, Builtins } from 'clipanion'
import { version, name, displayName } from '../package.json'

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
  owner = Option.Array('-o,--owner', {
    required: true,
    description: 'User and Organizations list to apply'
  })

  async execute() {
    console.log()
    this.context.stdout.write(`Set all repo in ${this.owner}\n`)

    const octokit = new Octokit({ token: process.env.GH_TOKEN })
    for (const owner of this.owner) {
      const repos = octokit.rest.repos
      repos.createOrUpdateFileContents
    }
  }
}

cli.register(GithubSetCommand)
cli.register(Builtins.HelpCommand)
cli.runExit(process.argv.slice(3), Cli.defaultContext)
