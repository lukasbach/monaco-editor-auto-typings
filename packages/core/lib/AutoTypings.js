"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoTypings = void 0;
var DummySourceCache_1 = require("./DummySourceCache");
var UnpkgSourceResolver_1 = require("./UnpkgSourceResolver");
var ImportResolver_1 = require("./ImportResolver");
var path = __importStar(require("path"));
var AutoTypings = /** @class */ (function () {
    function AutoTypings(editor, options) {
        var _this = this;
        this.editor = editor;
        this.options = options;
        this.importResolver = new ImportResolver_1.ImportResolver(options, options.sourceCache, options.sourceResolver);
        editor.onDidChangeModelContent(function (e) {
            console.log("Picked up change");
            var model = editor.getModel();
            if (!model)
                throw Error("No model");
            var content = model.getLinesContent();
            _this.importResolver.resolveImportsInFile(content.join('\n'), path.dirname(model.uri.toString()));
        });
    }
    AutoTypings.create = function (editor, options) {
        return new AutoTypings(editor, __assign({ fileRootPath: 'inmemory://model/', onlySpecifiedPackages: false, preloadPackages: false, shareCache: false, sourceCache: new DummySourceCache_1.DummySourceCache(), sourceResolver: new UnpkgSourceResolver_1.UnpkgSourceResolver() }, options));
    };
    AutoTypings.prototype.setVersions = function (versions) { };
    AutoTypings.prototype.getVersions = function (versions) { };
    return AutoTypings;
}());
exports.AutoTypings = AutoTypings;
