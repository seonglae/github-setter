## Sync .github folder and Issue labels

## Run
```bash
pnpm i -g github-setter
gh-setter
# change .github folder
gh-setter --token $GH_TOKEN --user $GH_USER --email $COMMIT_EMAIL

# change config.json
gh-setter labels --token $GH_TOKEN --user $GH_USER
```

## module
```ts
import { GithubCommand } from 'github-setter'
```
