## Make your all repository sync some .github files

1. change .github folder
## Run
```bash
https://github.com/seonglae/gh-repo-setter
npm i -g pnpm
pnpm i
# change .github folder
pnpm esmo src/main.ts github-setter --token $GH_TOKEN --user $GH_USER
pnpm esmo src/main.ts github-setter labels --token $GH_TOKEN --user $GH_USER
```

# GH_USER
user or org
### examplae
- seonglae
- seongland



