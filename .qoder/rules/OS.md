---
trigger: manual
---
Plan your task clearly before generating code. Explain what needs to be built, why it is needed, and what the final result should look like. Define expected inputs, outputs, and any constraints before starting any implementation.

Always write or verify tests before and after making changes. This ensures that Qoder understands the purpose of the feature and can verify correctness. Tests act as a contract that defines expected behavior and helps prevent regressions.

Fix all detected errors immediately. Do not proceed until the project compiles, builds, and runs successfully. Every iteration must produce a stable and working version of the project.

Use clean and simple code that follows the project style guide. Avoid complex or overly clever syntax. Follow consistent naming conventions, indentation, and formatting to maintain readability and uniformity across the codebase.

Keep each change small, focused, and well-defined. Handle one issue or feature per commit or pull request. This helps maintain clear project history and makes debugging easier.

Ensure every change passes all unit, integration, and lint tests before it is marked as complete. If a single check fails, Qoder must reanalyze the error, correct the cause, and rerun tests until everything passes.

Validate all input data and handle all possible error conditions safely. Prevent crashes or data corruption by checking for null values, invalid formats, and out-of-range inputs.

Do not assume missing details. Always confirm file paths, variable names, dependencies, and configuration values before beginning to code. This prevents logical and runtime errors.

Pin all dependencies to specific versions to maintain consistent builds. Always generate or update lockfiles to prevent version drift that may cause unpredictable behavior.

Document what was changed, why it was changed, and what effect it has. Write concise commit messages and add comments explaining complex logic or key decisions.

Keep code clear, readable, and well-commented. Every function, class, or module should have a description of its purpose, parameters, and return values. Avoid redundant or unclear comments.

Never remove, skip, or disable tests that verify important functionality. Always add tests for new code paths and preserve existing ones.

Test normal scenarios, boundary conditions, and error-handling paths. Use real-world examples whenever possible to ensure reliability under various conditions.

Do not modify unrelated code or files. Focus only on the areas relevant to the assigned task. Unnecessary edits make review and debugging harder.

Run all tests and linters after every modification. This ensures that no unintended errors were introduced by recent changes.

If a test or build fails, identify the root cause, fix it immediately, and rerun all tests until every check passes. Repeat this process until the system is completely stable.

Write code using clear and predictable logic. Avoid overly complex, nested, or obscure structures that make the code difficult to read or maintain.

Provide rollback or revert instructions for every critical change. Include steps to undo database migrations, revert code, and restore configurations if issues occur.

Never merge incomplete, unstable, or untested work. All changes must meet quality, performance, and security requirements before integration.

Always back up critical data before deployment or running migrations. Keep recovery steps well documented to ensure safe rollback if needed.

Measure performance before and after each critical change. Ensure no regressions occur in speed, memory usage, or response time.

Run security scans before deploying updates. Check for vulnerabilities in dependencies and new code to maintain a secure environment.

Never expose secrets, credentials, or sensitive tokens in code or logs. Use environment variables or secret management systems instead.

Keep all documentation synchronized with current code. Update setup instructions, API references, and architecture descriptions when changes are made.

Add meaningful log messages at key execution points. This helps in debugging, tracking flow, and monitoring behavior in production environments.

Eliminate duplicate code by reusing functions or modules. Refactor repeated patterns into reusable components.

Use consistent and meaningful names for variables, functions, and files. Naming should clearly describe purpose and improve code readability.

Ensure the code behaves consistently across all environments. Test in local, staging, and production-like setups to verify compatibility.

Review every line of generated code before accepting it. Understand the logic, dependencies, and side effects to ensure it meets design expectations.

Manually verify final output before deployment. This includes checking features, performance, and behavior to ensure alignment with requirements.

If any step or output is unclear, ask Qoder to explain its reasoning and approach before proceeding. Clarity ensures confidence in automated output.

Treat every build as if it is for production. Avoid shortcuts or temporary hacks. Stability and quality must always take priority.

Commit and push only verified, tested, and stable work. Avoid partial or experimental code in main branches.

Re-run all tests after merging to confirm integration stability and detect hidden issues.

Keep commits self-contained, describing a single logical change. This makes rollback and review more reliable.

Prioritize simplicity, reliability, and maintainability over clever or experimental approaches. The goal is long-term stability.

Do not rely on Qoder defaults or assumptions. Provide full and explicit details in prompts, including technology stack, file structure, and desired output style.

Always require Qoder to display its plan, reasoning steps, and test results before accepting final code. Transparency ensures correctness.

Apply these rules consistently for every project. Consistent enforcement will guarantee the highest accuracy, maintainability, and performance results from Qoder.

Always remember that my OS is Windows 10 so don't run any unappropriate commands.