#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

program
  .version(require('../package.json').version)
  .description('创建一个基于Next.js的全栈应用模板')
  .argument('[project-name]', '项目名称')
  .action(async (projectName) => {
    try {
      // 如果没有提供项目名称，提示用户输入
      if (!projectName) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: '请输入项目名称:',
            validate: (input) => {
              if (!input) return '项目名称不能为空';
              return true;
            }
          }
        ]);
        projectName = answers.projectName;
      }

      const targetDir = path.join(process.cwd(), projectName);
      
      // 检查目标目录是否已存在
      if (fs.existsSync(targetDir)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: `目录 ${projectName} 已存在。是否覆盖？`,
            default: false
          }
        ]);
        
        if (!overwrite) {
          console.log(chalk.red('✖') + ' 操作取消');
          process.exit(1);
        }
        await fs.remove(targetDir);
      }

      const spinner = ora('正在创建项目...').start();

      // 复制模板文件
      const templateDir = path.join(__dirname, '../template');
      await fs.copy(templateDir, targetDir);

      // 修改package.json
      const pkgPath = path.join(targetDir, 'package.json');
      const pkg = require(pkgPath);
      pkg.name = projectName;
      await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

      spinner.succeed('项目创建成功！');
      
      console.log('\n执行以下命令开始开发：\n');
      console.log(chalk.cyan(`  cd ${projectName}`));
      console.log(chalk.cyan('  npm install'));
      console.log(chalk.cyan('  npm run dev'));

    } catch (err) {
      console.error(chalk.red('创建项目失败：'), err);
      process.exit(1);
    }
  });

program.parse(process.argv);