# AGENTS.md

Guide for using AI agents effectively in this codebase.

## Quick Reference

| Task | Agent Type | Skill |
|------|------------|-------|
| Explore codebase | `Explore` | - |
| Plan implementation | `Plan` | `superpowers:writing-plans` |
| Execute plan | `general-purpose` | `superpowers:executing-plans` |
| Debug issues | `general-purpose` | `superpowers:systematic-debugging` |
| Code review | `code-reviewer` | `superpowers:requesting-code-review` |
| Create component | `general-purpose` | Project: `add-component` |
| Add route | `general-purpose` | Project: `add-route` |
| Add API endpoint | `general-purpose` | Project: `add-api-endpoint` |

## Workflows

### Feature Development

```
1. Brainstorm → superpowers:brainstorming
2. Write Plan → superpowers:writing-plans
3. Execute   → superpowers:subagent-driven-development
4. Review    → superpowers:requesting-code-review
5. Finish    → superpowers:finishing-a-development-branch
```

### Bug Fixing

```
1. Debug    → superpowers:systematic-debugging
2. Fix      → TDD approach (test first)
3. Verify   → superpowers:verification-before-completion
4. Review   → superpowers:requesting-code-review
```

### Exploration

Use the `Explore` agent for:
- Understanding unfamiliar parts of the codebase
- Finding where functionality is implemented
- Mapping dependencies between modules

```
Task tool with subagent_type=Explore:
"How does authentication work in this app?"
"Where are API routes defined?"
"What components use the useAppStore hook?"
```

## Project Skills

Custom skills in `.claude/skills/`:

### `add-component`

Creates a new React component with proper structure:
- Component file with TypeScript
- Exports from index
- Follows project patterns

### `add-route`

Adds a new route to the web or mobile app:
- Creates route file with proper exports
- Sets up loader if needed
- Follows file-based routing conventions

### `add-api-endpoint`

Creates a new API endpoint:
- Zod schema for request/response
- Query options factory
- fetchValidated integration

## Best Practices

### Do

- **Use skills** when they exist for the task
- **Use Explore agent** for codebase questions
- **Plan first** for multi-file changes
- **TDD** for all new functionality
- **Small commits** after each logical change
- **Run checks** before claiming completion

### Don't

- Don't skip planning for complex features
- Don't write code without reading existing patterns
- Don't commit without running `bun check`
- Don't claim "done" without verification

## Parallel Agents

For independent tasks, dispatch multiple agents in parallel:

```
Good candidates for parallelization:
- Independent component creation
- Separate test files
- Unrelated bug fixes
- Documentation updates

Not parallelizable:
- Sequential dependencies
- Shared file modifications
- Database migrations
```

## Agent Communication

When working with multiple agents:

1. **Context handoff**: Provide full task description, don't reference "above"
2. **Clear boundaries**: Each agent owns specific files
3. **Verification**: Each agent verifies their own work
4. **Review**: Use code-reviewer agent after implementation

## Customization

### Adding New Skills

1. Create skill file in `.claude/skills/`
2. Follow the skill template format
3. Document in this file

### Adjusting Rules

Edit `.claude/settings.json` to:
- Add custom instructions
- Configure tool permissions
- Set project-specific behaviors
