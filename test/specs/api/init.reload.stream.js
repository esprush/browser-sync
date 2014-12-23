"use strict";

var browserSync = require("../../../");

var sinon = require("sinon");
var File = require("vinyl");
var assert = require("chai").assert;

describe("API: .reload()", function () {

    var emitterStub, clock, bs;

    before(function (done) {
        browserSync.reset();
        bs = browserSync({logLevel: "silent"}, function (err, _bs) {
            emitterStub = sinon.spy(bs.emitter, "emit");
            done();
        });
        clock = sinon.useFakeTimers();
    });

    afterEach(function () {
        emitterStub.reset();
        clock.now = 0;
    });

    after(function () {
        bs.cleanup();
        clock.restore();
        emitterStub.restore();
    });

    it("should handle a single file changed", function () {
        var stream = browserSync.reload({
            stream: true
        });
        stream.write(new File({path: "styles.css"}));
        stream.end();
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {
            path:      "styles.css",
            log:       false,
            namespace: "core"
        });
    });
    it("should accept multiple files in stream", function () {
        var stream = browserSync.reload({stream: true});
        stream.write(new File({path: "styles.css"}));
        stream.write(new File({path: "styles2.css"}));
        stream.end();
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {
            path:      "styles.css",
            log:       false,
            namespace: "core"
        });
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {
            path:      "styles2.css",
            log:       false,
            namespace: "core"
        });
        sinon.assert.calledWithExactly(emitterStub, "stream:changed", {
            changed: ["styles.css", "styles2.css"]
        });
    });
    it("should reload browser if once:true given as arg", function () {
        var stream = browserSync.reload({stream: true, once: true});
        stream.write(new File({path: "styles.css"}));
        stream.write(new File({path: "styles2.css"}));
        stream.write(new File({path: "styles3.css"}));
        stream.end();
        sinon.assert.calledTwice(emitterStub);
        sinon.assert.calledWithExactly(emitterStub, "browser:reload");
    });
    it("should be able to call .reload after a stream", function () {
        browserSync.reload();
        sinon.assert.calledWithExactly(emitterStub, "browser:reload");

        var stream = browserSync.reload({stream: true});
        stream.write(new File({path: "styles.css"}));
        stream.end();

        sinon.assert.calledWithExactly(emitterStub, "browser:reload");
        sinon.assert.calledWithExactly(emitterStub, "file:changed", {
            path:      "styles.css",
            log:       false,
            namespace: "core"
        });
        sinon.assert.calledWithExactly(emitterStub, "stream:changed", {
            changed: ["styles.css"]
        });
    });
});
