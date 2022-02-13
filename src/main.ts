import { Cli, Builtins } from 'clipanion'
import { version, name, displayName } from '../package.json'
import { GithubFolderCommand, GithubLabelCommand, GithubBranchProtectionCommand } from './github'

const cli = new Cli({
  binaryName: name,
  binaryLabel: displayName,
  binaryVersion: version,
})

cli.register(GithubFolderCommand)
cli.register(GithubLabelCommand)
cli.register(GithubBranchProtectionCommand)
cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)
cli.runExit(process.argv.slice(2), Cli.defaultContext)
