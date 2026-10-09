
## Development environment: WSL2

- Primary environment: Ubuntu under WSL2.
- Repository location: /home/<user>/projects/female-character-studio.
- Run Node.js, pnpm, Git, Codex and tests inside WSL.
- Use Bash syntax for scripts and terminal commands.
- Do not use PowerShell commands in project setup scripts.
- Do not store the repository or node_modules under /mnt/c.
- Use Linux paths and forward slashes throughout.
- Use Node.js 24 LTS through NVM.
- Use pnpm workspaces.
- Ensure build, typecheck, lint and test commands work in Ubuntu.
- Prefer portable Node.js scripts for image processing.
- Use deterministic, cross-platform PNG exports.
- Do not depend on Windows-only graphics libraries.
- Pixel tests must enforce exact RGBA values,
  integer positions and native pixel dimensions.
- Internal art uses transparency.
- Final character exports use #00FF00 backgrounds
  and yellow direction labels.
