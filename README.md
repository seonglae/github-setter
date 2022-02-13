## Sync .github folder and Issue labels

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
import { GithubCommand } from "github-setter";
```
