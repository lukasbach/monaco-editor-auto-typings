"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummySourceCache = void 0;
var DummySourceCache = /** @class */ (function () {
    function DummySourceCache() {
    }
    DummySourceCache.prototype.getFile = function (uri) {
        return Promise.resolve(undefined);
    };
    DummySourceCache.prototype.isFileAvailable = function (uri) {
        return Promise.resolve(false);
    };
    DummySourceCache.prototype.storeFile = function (uri, content) {
        return Promise.resolve(undefined);
    };
    return DummySourceCache;
}());
exports.DummySourceCache = DummySourceCache;
