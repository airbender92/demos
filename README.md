# Demos Monorepo

This is a monorepo for managing multiple demo projects using Git submodules and pnpm workspace.

## Directory Structure

```
demos/
├── frontend/           # 前端项目
│   ├── react-demo/     # React项目
│   ├── vue-demo/       # Vue项目
│   └── angular-demo/   # Angular项目
├── backend/            # 后端项目
│   ├── nodejs-demo/    # Node.js项目
│   ├── python-demo/    # Python项目
│   └── java-demo/      # Java项目
├── fullstack/          # 全栈项目
│   ├── mern-demo/      # MongoDB + Express + React + Node.js
│   └── mean-demo/      # MongoDB + Express + Angular + Node.js
├── native/             # 原生项目
│   ├── ios-demo/       # iOS项目
│   └── android-demo/   # Android项目
├── tools/              # 工具和脚本
│   ├── scripts/        # 通用脚本
│   └── templates/      # 项目模板
├── pnpm-workspace.yaml # pnpm workspace配置
└── package.json        # 根项目配置
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- pnpm (v8+)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url> demos
   cd demos
   ```

2. Install dependencies:
   ```bash
   pnpm install:all
   ```

3. Add Git submodules (for each project):
   ```bash
   # Example: Adding a React demo project
   git submodule add <repository-url> frontend/react-demo
   ```

### Scripts

- `pnpm install:all` - Install dependencies for all projects
- `pnpm build:all` - Build all projects
- `pnpm test:all` - Test all projects

## Managing Projects

### Adding a New Project

1. Create a new directory in the appropriate category:
   ```bash
   mkdir -p frontend/new-project
   ```

2. Initialize the project:
   ```bash
   cd frontend/new-project
   # Initialize with your framework of choice
   # e.g., npm create vite@latest . -- --template react
   ```

3. Add as a Git submodule:
   ```bash
   cd ../..
   git submodule add <repository-url> frontend/new-project
   ```

### Updating Submodules

```bash
# Update all submodules
git submodule update --remote

# Update a specific submodule
git submodule update --remote frontend/react-demo
```

## Using pnpm Workspace

### Running Commands in Specific Projects

```bash
# Run a command in a specific project
pnpm --filter react-demo dev

# Run a command in all frontend projects
pnpm --filter "frontend/*" build
```

### Adding Shared Dependencies

```bash
# Add a dependency to all projects
pnpm add lodash --filter "*"

# Add a dev dependency to all projects
pnpm add -D eslint --filter "*"
```

## License

MIT