"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialEnv = void 0;
exports.updateInitialEnv = updateInitialEnv;
exports.resetInitialEnv = resetInitialEnv;
exports.processEnv = processEnv;
exports.resetEnv = resetEnv;
exports.loadEnvConfig = loadEnvConfig;
/* eslint-disable import/no-extraneous-dependencies */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const dotenv_expand_1 = require("dotenv-expand");
exports.initialEnv = undefined;
let combinedEnv = undefined;
let parsedEnv = undefined;
let cachedLoadedEnvFiles = [];
let previousLoadedEnvFiles = [];
function updateInitialEnv(newEnv) {
    exports.initialEnv = Object.assign(exports.initialEnv || {}, newEnv);
}
function resetInitialEnv() {
    exports.initialEnv = undefined;
    combinedEnv = undefined;
    parsedEnv = undefined;
    cachedLoadedEnvFiles = [];
    previousLoadedEnvFiles = [];
    delete process.env.__NEXT_PROCESSED_ENV;
}
function replaceProcessEnv(sourceEnv) {
    Object.keys(process.env).forEach(key => {
        // Allow mutating internal Next.js env variables after the server has initiated.
        // This is necessary for dynamic things like the IPC server port.
        if (!key.startsWith("__NEXT_PRIVATE")) {
            if (sourceEnv[key] === undefined || sourceEnv[key] === "") {
                delete process.env[key];
            }
        }
    });
    Object.entries(sourceEnv).forEach(([key, value]) => {
        process.env[key] = value;
    });
}
function processEnv(loadedEnvFiles, dir, log = console, forceReload = false, onReload) {
    if (!exports.initialEnv) {
        exports.initialEnv = Object.assign({}, process.env);
    }
    // only reload env when forceReload is specified
    if (!forceReload && (process.env.__NEXT_PROCESSED_ENV || loadedEnvFiles.length === 0)) {
        return [process.env];
    }
    // flag that we processed the environment values already.
    process.env.__NEXT_PROCESSED_ENV = "true";
    const origEnv = Object.assign({}, exports.initialEnv);
    const parsed = {};
    for (const envFile of loadedEnvFiles) {
        try {
            let result = {};
            result.parsed = dotenv.parse(envFile.contents);
            result = (0, dotenv_expand_1.expand)(result);
            if (result.parsed &&
                !previousLoadedEnvFiles.some(item => item.contents === envFile.contents && item.path === envFile.path)) {
                onReload === null || onReload === void 0 ? void 0 : onReload(envFile.path);
            }
            for (const key of Object.keys(result.parsed || {})) {
                if (typeof parsed[key] === "undefined" && typeof origEnv[key] === "undefined") {
                    parsed[key] = result.parsed[key];
                }
            }
            // Add the parsed env to the loadedEnvFiles
            envFile.env = result.parsed || {};
        }
        catch (err) {
            log.error(`Failed to load env from ${path.join(dir || "", envFile.path)}`, err);
        }
    }
    return [Object.assign(process.env, parsed), parsed];
}
function resetEnv() {
    if (exports.initialEnv) {
        replaceProcessEnv(exports.initialEnv);
    }
}
function loadEnvConfig(dir, dev, log = console, forceReload = false, onReload) {
    if (!exports.initialEnv) {
        exports.initialEnv = Object.assign({}, process.env);
    }
    // only reload env when forceReload is specified
    if (combinedEnv && !forceReload) {
        return { combinedEnv, parsedEnv, loadedEnvFiles: cachedLoadedEnvFiles };
    }
    replaceProcessEnv(exports.initialEnv);
    previousLoadedEnvFiles = cachedLoadedEnvFiles;
    cachedLoadedEnvFiles = [];
    // Simplified: only load .env and .env.NODE_ENV files
    const nodeEnv = process.env.NODE_ENV;
    const dotenvFiles = [nodeEnv && `.env.${nodeEnv}`, ".env"].filter(Boolean);
    for (const envFile of dotenvFiles) {
        // only load .env if the user provided has an env config file
        const dotEnvPath = path.join(dir, envFile);
        try {
            const stats = fs.statSync(dotEnvPath);
            // make sure to only attempt to read files or named pipes
            if (!stats.isFile() && !stats.isFIFO()) {
                continue;
            }
            const contents = fs.readFileSync(dotEnvPath, "utf8");
            cachedLoadedEnvFiles.push({
                path: envFile,
                contents,
                env: {} // This will be populated in processEnv
            });
        }
        catch (err) {
            if (err.code !== "ENOENT") {
                log.error(`Failed to load env from ${envFile}`, err);
            }
        }
    }
    const [env, parsed] = processEnv(cachedLoadedEnvFiles, dir, log, forceReload, onReload);
    combinedEnv = env;
    parsedEnv = parsed;
    return { combinedEnv, parsedEnv, loadedEnvFiles: cachedLoadedEnvFiles };
}
