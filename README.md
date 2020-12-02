https://api.github.com/users/{{user}}/repos

https://github.com/settings/developers

```bash
rm repo.list
node main.js

github-funding-yml-updater \
--mode overwrite  --user sungle3737 \
--token {{gh_token}} \
--funding-file ./FUNDING.yml \
--list-file ./repo.list \
--write

funding.yml --list-file ./repo.list
```
