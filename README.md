## Sync .github folder and Issue labels

<a href="https://lgtm.com/projects/g/seonglae/github-setter/context:javascript"><img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/seonglae/github-setter.svg?logo=lgtm&logoWidth=18"/></a>

## Run

```bash
pnpm i -g github-setter
gh-setter
# create .github folder
gh-setter --token $GH_TOKEN --owner $GH_OWNER --folder .github

# change labels
gh-setter labels --token $GH_TOKEN --owner $GH_USER

# change branch protection
gh-setter branch protection --token $GH_TOKEN --owner $GH_USER
```

## module

```ts
import { GithubCommand } from "github-setter";
```


## Warn
maximum repo update is 100
this might be updated
