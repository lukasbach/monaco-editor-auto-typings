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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyParser = void 0;
var path = __importStar(require("path"));
var DependencyParser = /** @class */ (function () {
    function DependencyParser() {
        this.REGEX_CLEAN = /[\n|\r]/g;
        this.REGEX_DETECT_IMPORT = /(?:(?:import)|(?:export))(?:.)*?from\s+["']([^"']+)["']/g;
    }
    DependencyParser.prototype.parseDependencies = function (source, parent) {
        var _this = this;
        var cleaned = source; // source.replace(this.REGEX_CLEAN, '');
        return __spread(cleaned.matchAll(this.REGEX_DETECT_IMPORT)).map(function (x) { return x[1]; })
            .filter(function (x) { return !!x; })
            .map(function (imp) {
            var result = _this.resolvePath(imp, parent);
            console.log("Parsing", imp, " to ", result);
            return result;
        });
    };
    DependencyParser.prototype.resolvePath = function (importPath, parent) {
        if (typeof parent === 'string') {
            if (importPath.startsWith('.')) {
                return {
                    kind: 'relative',
                    importPath: importPath,
                    sourcePath: parent
                };
            }
            else if (importPath.startsWith('@')) {
                var segments = importPath.split('/');
                return {
                    kind: 'package',
                    packageName: segments[0] + "/" + segments[1],
                    importPath: segments.slice(2).join('/')
                };
            }
            else {
                var segments = importPath.split('/');
                return {
                    kind: 'package',
                    packageName: segments[0],
                    importPath: segments.slice(1).join('/')
                };
            }
        }
        else {
            switch (parent.kind) {
                case 'package':
                    throw Error("TODO?");
                case 'relative':
                    throw Error("TODO2?");
                case 'relative-in-package':
                    if (importPath.startsWith('.')) {
                        return {
                            kind: 'relative-in-package',
                            packageName: parent.packageName,
                            sourcePath: path.join(parent.sourcePath, parent.importPath),
                            importPath: importPath
                        };
                    }
                    else if (importPath.startsWith('@')) {
                        var segments = importPath.split('/');
                        return {
                            kind: 'package',
                            packageName: segments[0] + "/" + segments[1],
                            importPath: segments.slice(2).join('/')
                        };
                    }
                    else {
                        var segments = importPath.split('/');
                        return {
                            kind: 'package',
                            packageName: segments[0],
                            importPath: segments.slice(1).join('/')
                        };
                    }
            }
        }
    };
    return DependencyParser;
}());
exports.DependencyParser = DependencyParser;
