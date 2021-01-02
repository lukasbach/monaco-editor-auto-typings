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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoTypings = void 0;
var DummySourceCache_1 = require("./DummySourceCache");
var UnpkgSourceResolver_1 = require("./UnpkgSourceResolver");
var AutoTypings = /** @class */ (function () {
    function AutoTypings(editor, options) {
        this.editor = editor;
        this.options = options;
    }
    AutoTypings.create = function (editor, options) {
        return new AutoTypings(editor, __assign({ fileRootPath: 'inmemory://model/', onlySpecifiedPackages: false, preloadPackages: false, shareCache: false, sourceCache: new DummySourceCache_1.DummySourceCache(), sourceResolver: new UnpkgSourceResolver_1.UnpkgSourceResolver() }, options));
    };
    AutoTypings.prototype.setVersions = function (versions) { };
    AutoTypings.prototype.getVersions = function (versions) { };
    return AutoTypings;
}());
exports.AutoTypings = AutoTypings;
