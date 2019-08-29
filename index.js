#!/usr/bin/env node
/*
Ask for name of repo
Ask for a description
Ask for a homepage
Ask if it should be private
Ask if it should has_issues, has_projects, has_wiki, auto_init
*/

(async () => {
  var { prompt } = require('inquirer')
  const { exec } = require('child_process')
  const Octokit = require('@octokit/rest')
  const settings = await prompt([{
    type: 'input',
    name: 'name',
    message: 'What should the repo be named?'
  },
  {
    type: 'checkbox',
    name: 'features',
    message: 'What features do you want?',
    choices: ['Wiki', 'Issues', 'Projects']
  },
  {
    type: 'confirm',
    message: 'Should it be private?',
    name: 'private',
    default: true
  }])

  const gitauth = await prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username?'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password?'
    }
  ])
  const octokit = Octokit({
    auth: {
      username: gitauth.username,
      password: gitauth.password,
      async on2fa () {
        const code = await prompt([
          {
            name: 'code',
            type: 'number',
            message: '2-Factor Code:',
            validate: (d) => { if (isNaN(d)) { return 'Not a number!' } else return true }
          }
        ])
        // example: ask the user
        return code.code
      }
    },
    userAgent: 'create-github-repo'
  })
  await octokit.repos.createForAuthenticatedUser({
    name: settings.name,
    has_wiki: settings.features[0],
    has_issues: settings.features[1],
    has_projects: settings.features[2],
    private: settings.private,
    auto_init: true
  })
  exec(`git clone https://github.com/${gitauth.username}/${settings.name.replace(' ', '-')}.git`, (err) => { if (err) throw err })
})()
