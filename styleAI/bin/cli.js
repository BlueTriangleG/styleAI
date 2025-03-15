#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Get project name from command line arguments
const args = process.argv.slice(2)
let projectName = args[0]

// If no project name is provided, prompt the user to enter one
if (!projectName) {
  rl.question('Please enter a project name: ', (answer) => {
    if (!answer) {
      console.error('Project name is required')
      rl.close()
      process.exit(1)
    }
    projectName = answer
    createProject(projectName)
    rl.close()
  })
} else {
  createProject(projectName)
  rl.close()
}

function createProject (name) {
  const targetDir = path.join(process.cwd(), name)

  // Check if target directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory ${name} already exists`)
    process.exit(1)
  }

  console.log(`Creating a new StyleAI project in ${targetDir}...`)

  // Create target directory
  fs.mkdirSync(targetDir, { recursive: true })

  // Get template directory path
  const templateDir = path.join(__dirname, '../template')

  // Copy template files
  copyDir(templateDir, targetDir)

  // Modify package.json
  const packageJsonPath = path.join(targetDir, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    packageJson.name = name
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  }

  console.log('Installing dependencies...')
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' })

  console.log(`
Project ${name} created successfully!

To get started:
  cd ${name}
  npm run dev
  `)
}

function copyDir (src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}