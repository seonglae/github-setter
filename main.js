import fetch from 'node-fetch'
import dotenv from 'dotenv'
import fs from 'fs'

const EXPORT_NAME = 'repo.list'

dotenv.config()

fetch(`https://api.github.com/users/${process.env.GH_USERNAME}/repos`, {
  headers: { Authorization: `token ${process.env.GH_TOKEN}` }
})
  .then((res) => res.json())
  .then((json) => {
    const logger = fs.createWriteStream(EXPORT_NAME, { flags: 'a' })
    for (const repo of json) logger.write(`${repo.html_url}\n`)
    logger.end()
  })
