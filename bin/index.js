#!/usr/bin/env node
const { program } = require('commander')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const path = require('path')
const chalk = require('chalk')

async function init() {
  // 首行提示消息
  program.usage('<command> [options]')

  // 脚手架版本号
  const version = require('../package.json').version

  program.version(
    `tomato-cli@${version}`,
    '-v, --version',
    'output the version number'
  )

  // 创建项目命令
  program
    .command('create')
    .description('create a new project powered by tomato-cli-service')
    .action(async () => {
      // 用户交互的问题列表
      const questions = [
        {
          type: 'input',
          name: 'name',
          message: 'Project name:',
          default: 'my-project'
        },
        {
          name: 'framework',
          type: 'list',
          message: 'Select a framework:',
          choices: [
            {
              name: chalk.green('Vue'),
              value: 'vue'
            },
            {
              name: chalk.blue('React'),
              value: 'react'
            }
          ]
        },
        {
          name: 'ts',
          type: 'list',
          message: 'Select a variant:',
          choices: [
            {
              name: chalk.yellow('JavaScript'),
              value: ''
            },
            {
              name: chalk.blue('TypeScript'),
              value: '-ts'
            }
          ]
        }
      ]

      // 开始命令行交互
      await inquirer.prompt(questions).then(async (answers) => {
        const cwd = process.cwd()

        // 项目名
        const name = answers.name

        // 工作目录
        const root = path.join(cwd, name)

        // 删除已存在的文件夹
        if (fs.existsSync(root)) {
          fs.removeSync(root)
        }

        console.log(chalk.black(`Scaffolding project in ${root}...`))

        const template = `template-${answers.framework}${answers.ts}`
        const templateDir = path.join(__dirname, `../${template}`)

        // 复制单个文件
        async function write(file) {
          const targetPath = path.join(root, file)
          await fs.copy(path.join(templateDir, file), targetPath)
        }

        // 读取模板目录中的所有文件
        const files = await fs.readdir(templateDir)

        // 遍历复制每个文件
        for (const file of files) {
          await write(file)
        }

        // 完成后提示用户下一步操作
        console.log(chalk.blue(`\nDone. Now run:\n`))
        if (root !== cwd) {
          console.log(chalk.green(`  cd ${path.relative(cwd, root)}`))
        }
        console.log(chalk.green(`  pnpm install`))
        console.log(chalk.green(`  pnpm dev`))
      })
    })

  //  解析命令行参数
  program.parse(process.argv)
}

// 初始化运行函数
init().catch((e) => {
  console.error(chalk.red('Error:'), e)
})
