"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportResolver = void 0;
var monaco = __importStar(require("monaco-editor/esm/vs/editor/editor.api"));
var editor_api_1 = require("monaco-editor/esm/vs/editor/editor.api");
var DependencyParser_1 = require("./DependencyParser");
var path = __importStar(require("path"));
var ImportResolver = /** @class */ (function () {
    function ImportResolver(options, cache, sourceResolver, versions) {
        this.options = options;
        this.cache = cache;
        this.sourceResolver = sourceResolver;
        this.versions = versions;
        this.loadedFiles = [];
        this.dependencyParser = new DependencyParser_1.DependencyParser();
    }
    ImportResolver.prototype.resolveImportsInFile = function (source, parent) {
        return __awaiter(this, void 0, void 0, function () {
            var imports, imports_1, imports_1_1, importCall, hash, e_1_1;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        imports = this.dependencyParser.parseDependencies(source, parent);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        imports_1 = __values(imports), imports_1_1 = imports_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!imports_1_1.done) return [3 /*break*/, 5];
                        importCall = imports_1_1.value;
                        hash = this.hashImportResourcePath(importCall);
                        if (!!this.loadedFiles.includes(hash)) return [3 /*break*/, 4];
                        this.loadedFiles.push(hash);
                        return [4 /*yield*/, this.resolveImport(importCall)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        imports_1_1 = imports_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (imports_1_1 && !imports_1_1.done && (_a = imports_1.return)) _a.call(imports_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ImportResolver.prototype.resolveImport = function (importResource) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = importResource.kind;
                        switch (_a) {
                            case 'package': return [3 /*break*/, 1];
                            case 'relative': return [3 /*break*/, 4];
                            case 'relative-in-package': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        _b = this.resolveImportInPackage;
                        return [4 /*yield*/, this.resolveImportFromPackageRoot(importResource)];
                    case 2: return [4 /*yield*/, _b.apply(this, [_c.sent()])];
                    case 3: return [2 /*return*/, _c.sent()];
                    case 4: throw Error('Not implemented yet');
                    case 5: return [4 /*yield*/, this.resolveImportInPackage(importResource)];
                    case 6: return [2 /*return*/, _c.sent()];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ImportResolver.prototype.resolveImportInPackage = function (importResource) {
        return __awaiter(this, void 0, void 0, function () {
            var content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadSourceFileContents(importResource)];
                    case 1:
                        content = _a.sent();
                        this.createModel(content, editor_api_1.Uri.parse(this.options.fileRootPath + "node_modules/" + importResource.packageName));
                        return [4 /*yield*/, this.resolveImportsInFile(content, importResource)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ImportResolver.prototype.resolveImportFromPackageRoot = function (importResource) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var pkgJson, pkg, typings, typingPackageName, pkgJsonTypings, pkg_1, typings;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.sourceResolver.resolvePackageJson(importResource.packageName, (_a = this.versions) === null || _a === void 0 ? void 0 : _a[importResource.packageName])];
                    case 1:
                        pkgJson = _c.sent();
                        if (!pkgJson) return [3 /*break*/, 5];
                        pkg = JSON.parse(pkgJson);
                        if (!(pkg.typings || pkg.types)) return [3 /*break*/, 2];
                        typings = pkg.typings || pkg.types;
                        this.createModel(pkgJson, editor_api_1.Uri.parse(this.options.fileRootPath + "node_modules/" + importResource.packageName + "/package.json"));
                        return [2 /*return*/, {
                                kind: 'relative-in-package',
                                packageName: importResource.packageName,
                                sourcePath: '',
                                importPath: typings.startsWith('./') ? typings.slice(2) : typings
                            }];
                    case 2:
                        typingPackageName = "@types/" + (importResource.packageName.startsWith('@')
                            ? importResource.packageName.slice(1).replace(/\//, '__')
                            : importResource.packageName);
                        return [4 /*yield*/, this.sourceResolver.resolvePackageJson(typingPackageName, (_b = this.versions) === null || _b === void 0 ? void 0 : _b[typingPackageName])];
                    case 3:
                        pkgJsonTypings = _c.sent();
                        if (pkgJsonTypings) {
                            pkg_1 = JSON.parse(pkgJsonTypings);
                            if (pkg_1.typings || pkg_1.types) {
                                typings = pkg_1.typings || pkg_1.types;
                                this.createModel(pkgJsonTypings, editor_api_1.Uri.parse(this.options.fileRootPath + "node_modules/" + typingPackageName + "/package.json"));
                                return [2 /*return*/, {
                                        kind: 'relative-in-package',
                                        packageName: typingPackageName,
                                        sourcePath: '',
                                        importPath: typings.startsWith('./') ? typings.slice(2) : typings
                                    }];
                            }
                            else {
                                throw Error(typingPackageName + " exists, but does not provide types.");
                            }
                        }
                        else {
                            throw Error("Package exists " + importResource.packageName + ", but does not provide typings, "
                                + ("and " + typingPackageName + " does not exist."));
                        }
                        _c.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5: throw Error("Cannot find package " + importResource.packageName);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ImportResolver.prototype.loadSourceFileContents = function (importResource) {
        return __awaiter(this, void 0, void 0, function () {
            var pkgName, version, appends, appends_1, appends_1_1, append, source, e_2_1;
            var e_2, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pkgName = importResource.packageName;
                        version = this.getVersion(importResource.packageName);
                        appends = ['.d.ts', '/index.d.ts', '.ts', '.tsx', '/index.ts', '/index.tsx'];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        appends_1 = __values(appends), appends_1_1 = appends_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!appends_1_1.done) return [3 /*break*/, 5];
                        append = appends_1_1.value;
                        return [4 /*yield*/, this.sourceResolver.resolveSourceFile(pkgName, version, path.join(importResource.sourcePath, importResource.sourcePath))];
                    case 3:
                        source = _b.sent();
                        if (source) {
                            return [2 /*return*/, source];
                        }
                        _b.label = 4;
                    case 4:
                        appends_1_1 = appends_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_2_1 = _b.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (appends_1_1 && !appends_1_1.done && (_a = appends_1.return)) _a.call(appends_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 8: throw Error("Could not resolve " + importResource.packageName + "/" + importResource.sourcePath + importResource.importPath);
                }
            });
        });
    };
    /*private async findTypingsRootFile(packageName: string): ImportResourcePath {
      const pkgJson = await this.sourceResolver.resolvePackageJson(
        packageName,
        this.versions?.[packageName]
      );
  
      if (pkgJson) {
        const pkg = JSON.parse(pkgJson);
        if (pkg.typings) {
          return {
            kind: 'relative-in-package',
            packageName: packageName,
            sourcePath: '',
            importPath: pkg.typings.startsWith('./') ? pkg.typings.slice(2) : pkg.typings
          }
        } else {
  
        }
      } else {
        throw Error(`Cannot find package ${packageName}`);
      }
    }*/
    ImportResolver.prototype.getVersion = function (packageName) {
        var _a;
        return (_a = this.versions) === null || _a === void 0 ? void 0 : _a[packageName];
    };
    ImportResolver.prototype.setVersions = function (versions) {
        this.versions = versions;
    };
    ImportResolver.prototype.createModel = function (source, uri) {
        monaco.editor.createModel(source, 'typescript', uri);
    };
    ImportResolver.prototype.hashImportResourcePath = function (p) {
        switch (p.kind) {
            case 'package':
                return p.packageName + "/" + p.importPath;
            case 'relative':
                return "." + p.sourcePath + "/" + p.importPath;
            case 'relative-in-package':
                return p.packageName + "/" + p.sourcePath + "/" + p.importPath;
        }
    };
    return ImportResolver;
}());
exports.ImportResolver = ImportResolver;
