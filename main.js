import fetch from 'node-fetch'
import dotenv from 'dotenv'
import consola from 'consola'

dotenv.config()

fetch(`https://api.github.com/users/${process.env.GH_USERNAME}/repos`, {
  headers: { Authorization: `token ${process.env.GH_TOKEN}` }
})
  .then((res) => res.json())
  .then((json) => {
    for (const repo of json) {
      consola.info(repo.html_url)
    }
  })
