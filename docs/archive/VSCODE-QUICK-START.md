# VSCode Quick Start Guide - MedResearch-AI

## 🚀 Getting Started

### Open Project
```bash
cd C:\Users\Admin\Documents\AI-Projects\OpenAgents-main\Project\MedResearch-AI
code .
```

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+B` | **Build** TypeScript |
| `Ctrl+Shift+P` | **Command Palette** (run any command) |
| `Ctrl+P` | **Quick Open** file |
| `Ctrl+`` | **Toggle Terminal** |
| `F5` | **Start Debugging** |
| `Shift+Alt+F` | **Format Code** |
| `Ctrl+Shift+F` | **Search in Files** |
| `Ctrl+/` | **Toggle Comment** |

## 🔨 Common Tasks (Ctrl+Shift+P > "Run Task")

| Task | Description |
|------|-------------|
| Build TypeScript | Compile TS to JS |
| Run All Tests | Execute all test suites |
| Run Meta-Analysis Tests | Meta-analysis only |
| Run Dashboard (Watch Mode) | Auto-refresh dashboard |
| Clean Build | Remove dist & rebuild |

## 🐛 Debugging (F5)

1. **Set Breakpoint**: Click left of line number (red dot)
2. **Start Debug**: Press `F5`
3. **Choose Config**: 
   - Debug Current Test File
   - Debug All Tests
   - Debug Meta-Analysis Tests
   - Debug Dashboard

## 📦 Installed Extensions

✅ **ESLint** - Code linting  
✅ **Prettier** - Code formatting  
✅ **GitLens** - Git superpowers  
✅ **npm Intellisense** - npm auto-complete  
✅ **Path Intellisense** - Path auto-complete  
✅ **Error Lens** - Inline errors  
✅ **Thunder Client** - API testing  
✅ **R Language** - R support  

## 🎯 Quick Commands

### Terminal (Ctrl+`)
```bash
# Build & Test
npm run build              # Build TypeScript
npm test                   # Run all tests
npm run test:meta         # Meta-analysis tests

# Dashboard
npm run dashboard         # Display once
npm run dashboard:watch   # Auto-refresh

# Git
git status
git add .
git commit -m "message"
git push
```

### Command Palette (Ctrl+Shift+P)
- `Format Document` - Format current file
- `Reload Window` - Restart VSCode
- `Run Task` - Execute predefined tasks
- `Git: Commit` - Commit changes
- `Git: Push` - Push to remote

## 🎨 Code Formatting

- **Auto-format on save**: ✅ Enabled
- **Manual format**: `Shift+Alt+F`
- **Format selection**: Select code → `Shift+Alt+F`

## 🔍 Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Go to file |
| `Ctrl+Shift+O` | Go to symbol in file |
| `Ctrl+T` | Go to symbol in workspace |
| `F12` | Go to definition |
| `Alt+F12` | Peek definition |
| `Shift+F12` | Find all references |
| `Ctrl+Click` | Go to definition |

## 📊 Panels

| Shortcut | Panel |
|----------|-------|
| `Ctrl+Shift+E` | Explorer |
| `Ctrl+Shift+G` | Source Control (Git) |
| `Ctrl+Shift+D` | Debug |
| `Ctrl+Shift+X` | Extensions |
| `Ctrl+Shift+F` | Search |

## 🧪 Testing Workflow

1. **Write test** in `test-*.js` file
2. **Run test**: `Ctrl+Shift+P` > "Run Task" > "Run All Tests"
3. **Debug test**: Open test file → `F5` → Select "Debug Current Test File"
4. **Set breakpoint** in test or source code
5. **Inspect variables** in Debug panel

## 🌐 R Language Features

- **Execute R code**: Select code → `Ctrl+Enter`
- **R terminal**: Opens automatically when executing R code
- **Syntax highlighting**: Automatic for `.R` files
- **IntelliSense**: Auto-complete R functions

## 🎯 Pro Tips

1. **Multi-cursor editing**: `Alt+Click` or `Ctrl+Alt+↑/↓`
2. **Duplicate line**: `Shift+Alt+↓` or `Shift+Alt+↑`
3. **Move line**: `Alt+↑` or `Alt+↓`
4. **Delete line**: `Ctrl+Shift+K`
5. **Toggle sidebar**: `Ctrl+B`
6. **Zen mode**: `Ctrl+K Z` (distraction-free)
7. **Split editor**: `Ctrl+\`
8. **Close editor**: `Ctrl+W`

## 🔧 Troubleshooting

### TypeScript errors not showing
```
Ctrl+Shift+P > "Reload Window"
```

### Prettier not formatting
```
Ctrl+Shift+P > "Format Document With..." > "Prettier"
```

### R not working
1. Check R path in `.vscode/settings.json`
2. Verify R installed: `R --version` in terminal
3. Restart VSCode

### ESLint not working
```bash
npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
```
Then: `Ctrl+Shift+P` > "Reload Window"

## 📚 Learn More

- Full guide: `.vscode/README.md`
- VSCode Docs: https://code.visualstudio.com/docs
- Keyboard shortcuts: `Ctrl+K Ctrl+S`

---

**Happy Coding! 🚀**
