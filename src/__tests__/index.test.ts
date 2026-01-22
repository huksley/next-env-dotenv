import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  loadEnvConfig,
  resetEnv,
  updateInitialEnv,
  resetInitialEnv,
} from "../index";

describe("next-env-dotenv", () => {
  let testDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Reset module state
    resetInitialEnv();

    // Create a temporary directory for test files
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), "next-env-test-"));
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    // Restore original environment
    process.env = { ...originalEnv };
  });

  test("loads .env file", () => {
    // Create a .env file
    const envContent = "TEST_VAR=test_value\nANOTHER_VAR=another_value";
    fs.writeFileSync(path.join(testDir, ".env"), envContent);

    // Load env config
    const result = loadEnvConfig(testDir);

    expect(result.loadedEnvFiles).toHaveLength(1);
    expect(result.loadedEnvFiles[0].path).toBe(".env");
    expect(process.env.TEST_VAR).toBe("test_value");
    expect(process.env.ANOTHER_VAR).toBe("another_value");
  });

  test("loads .env.NODE_ENV file when NODE_ENV is set", () => {
    // Set NODE_ENV
    process.env.NODE_ENV = "production";
    updateInitialEnv({ NODE_ENV: "production" });

    // Create .env and .env.production files
    fs.writeFileSync(
      path.join(testDir, ".env"),
      "BASE_VAR=base\nOVERRIDE_VAR=base_value",
    );
    fs.writeFileSync(
      path.join(testDir, ".env.production"),
      "PROD_VAR=prod\nOVERRIDE_VAR=prod_value",
    );

    // Load env config
    const result = loadEnvConfig(testDir, false, console, true);

    expect(result.loadedEnvFiles).toHaveLength(2);
    expect(result.loadedEnvFiles[0].path).toBe(".env.production");
    expect(result.loadedEnvFiles[1].path).toBe(".env");
    expect(process.env.BASE_VAR).toBe("base");
    expect(process.env.PROD_VAR).toBe("prod");
    // .env.production should NOT override .env in our implementation
    // because .env.production is loaded first and priority goes to first loaded
    expect(process.env.OVERRIDE_VAR).toBe("prod_value");
  });

  test("handles dotenv expansion", () => {
    // Create a .env file with variable expansion
    const envContent = "BASE_PATH=/home/user\nFULL_PATH=${BASE_PATH}/project";
    fs.writeFileSync(path.join(testDir, ".env"), envContent);

    // Load env config
    loadEnvConfig(testDir, false, console, true);

    expect(process.env.BASE_PATH).toBe("/home/user");
    expect(process.env.FULL_PATH).toBe("/home/user/project");
  });

  test("does not override existing environment variables", () => {
    // Set an existing environment variable
    process.env.EXISTING_VAR = "existing_value";
    updateInitialEnv({ EXISTING_VAR: "existing_value" });

    // Create a .env file that tries to override it
    fs.writeFileSync(path.join(testDir, ".env"), "EXISTING_VAR=new_value");

    // Load env config
    loadEnvConfig(testDir, false, console, true);

    // Should not override existing env var
    expect(process.env.EXISTING_VAR).toBe("existing_value");
  });

  test("handles missing .env files gracefully", () => {
    // Load env config without any .env files
    const result = loadEnvConfig(testDir, false, console, true);

    expect(result.loadedEnvFiles).toHaveLength(0);
  });

  test("loads only .env when NODE_ENV is not set", () => {
    // Make sure NODE_ENV is not set
    delete process.env.NODE_ENV;

    // Create multiple .env files
    fs.writeFileSync(path.join(testDir, ".env"), "BASE_VAR=base");
    fs.writeFileSync(path.join(testDir, ".env.development"), "DEV_VAR=dev");
    fs.writeFileSync(path.join(testDir, ".env.production"), "PROD_VAR=prod");

    // Load env config
    const result = loadEnvConfig(testDir, false, console, true);

    // Should only load .env
    expect(result.loadedEnvFiles).toHaveLength(1);
    expect(result.loadedEnvFiles[0].path).toBe(".env");
    expect(process.env.BASE_VAR).toBe("base");
    expect(process.env.DEV_VAR).toBeUndefined();
    expect(process.env.PROD_VAR).toBeUndefined();
  });

  test("resetEnv restores initial environment", () => {
    // Create a .env file
    fs.writeFileSync(path.join(testDir, ".env"), "NEW_VAR=new_value");

    // Load env config
    loadEnvConfig(testDir, false, console, true);
    expect(process.env.NEW_VAR).toBe("new_value");

    // Reset env
    resetEnv();

    // NEW_VAR should be removed (or undefined if it wasn't in initial env)
    expect(process.env.NEW_VAR).toBeUndefined();
  });
});
