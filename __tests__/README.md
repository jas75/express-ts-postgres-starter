# Test Organization

This folder contains all project tests, organized by type.

## Folder Structure

```
__tests__/
  unit/                  # Isolated unit tests
    services/            # Business service tests
    utils/              # Utility function tests
  integration/           # Integration tests
    api/                # API tests
    database/           # Database integration tests
  e2e/                  # End-to-end tests
  setup.ts              # Common test configuration
  jest.unit.config.js   # Jest configuration for unit tests
  jest.integration.config.js # Jest configuration for integration tests
  jest.e2e.config.js    # Jest configuration for e2e tests
```

## Test Types

### Unit Tests

Unit tests verify isolated functions. They are fast and don't use external dependencies.

```bash
npm run test:unit
```

### Integration Tests

Integration tests verify that different parts of the system work together.

```bash
npm run test:integration
```

### End-to-End (E2E) Tests

E2E tests verify complete user flows.

```bash
npm run test:e2e
```

## Recommended Organization

For good organization, follow these principles:

1. **Mirror Source Structure**:
   - Each test file should reflect the source code structure
   - Example: To test `src/utils/validators.ts`, create `__tests__/unit/utils/validators.test.ts`

2. **File Naming**:
   - Each test file should end with `.test.ts`
   - Use the same name as the source file for easy navigation

3. **AAA Pattern**:
   - **Arrange**: Prepare data and environment
   - **Act**: Execute the action being tested
   - **Assert**: Verify the results

4. **Effective Mocking**:
   - Use `jest.mock()` for complete modules
   - Use `jest.fn()` and `jest.spyOn()` for specific functions 