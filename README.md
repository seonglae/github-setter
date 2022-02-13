## Sync .github folder and Issue labels

<a href="https://lgtm.com/projects/g/seonglae/github-setter/context:javascript"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/seonglae/github-setter.svg?logo=lgtm&logoWidth=18"/></a>

## Run
```bash
pnpm i -g github-setter
gh-setter
# create .github folder
gh-setter --token $GH_TOKEN --owner $GH_OWNER --folder .github

# change config.json
gh-setter labels --token $GH_TOKEN --user $GH_USER
```

## module
```ts
import { GithubCommand } from 'github-setter'
```
