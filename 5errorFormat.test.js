const assert = require('chai').assert
const sinon = require('sinon')

function determineErrorCode(err) {
    let isJoi = false
    err = Array.isArray(err) ? err : [err]
    for (const e of err) {
        if ((e.isJoi) || (e.error && e.error.isJoi)) {
            isJoi = true
        }
    }

    if (isJoi) { return 400 }
    else if (err.code) {
        const intCode = parseInt(err.code, 10)
        if (intCode >= 400 && intCode < 600) {
            return intCode
        }
    }

    return 500
}

function errorFormat(err, req, res, next) {
    const status = determineErrorCode(err)
    res.status(status)
    if (err.stack) err.stack = err.stack.split('\n')

    if (err.length) {
        res.json({
            error: true,
            message: err.map(e => e.message),
            stack: err.map(e => e.stack),
            _object: req.body,
        })
    }
    else {
        res.json({
            error: true,
            message: err.message,
            stack: err.stack,
            _object: req.body,
        })
    }
}

class mockResp {
    constructor() {
        this.statusCode = null
        this.body = null
    }
    status(code) {
        if (code) this.statusCode = code

        return this.statusCode
    }
    json(data) {
        this.body = JSON.stringify(data)
    }
}

describe('boundary', () => {
    it('should use error status code, if ones provided', () => {
        const err = new Error('418-Error')
        err.code = 418
        err.stack = 'fake-stack'
        const req = {
            body: ['test body'],
        }
        const res = new mockResp()

        errorFormat(err, req, res, null)

        assert.equal(res.status(), 418)
    })
    it('should return a 500 if a node-error.code is generated', () => {
        const err = new Error('test')
        err.code = 'ERR_ARG_NOT_ITERABLE'
        err.stack = 'fake-stack'
        const req = { body: ['test body'] }
        const res = new mockResp()
        errorFormat(err, req, res, null)

        assert.equal(res.status(), 500)
    })
    it('should return 500 if a >599 error code is set', () => {
        const err = new Error('test')
        err.code = 618
        err.stack = 'fake-stack'
        const req = { body: ['test body'] }
        const res = new mockResp()
        errorFormat(err, req, res, null)

        assert.equal(res.status(), 500)
    })
    it('should return 500 if a <500 error code is set', () => {
        const err = new Error('test')
        err.code = 215
        err.stack = 'fake-stack'
        const req = { body: ['test body'] }
        const res = new mockResp()
        errorFormat(err, req, res, null)

        assert.equal(res.status(), 500)
    })
    it('should return a 500 if no error info is provided', () => {
        const err = new Error('500-Error')
        err.stack = 'fake-stack'
        const req = {
            body: ['test body'],
        }
        const res = new mockResp()

        errorFormat(err, req, res, null)

        assert.equal(res.status(), 500)
    })
    it('returns json via res.json', () => {
        const err = new Error('Test-Error')
        err.stack = 'fake-stack'
        const req = {
            body: ['test body'],
        }
        const res = new mockResp()
        res.json = sinon.spy()

        errorFormat(err, req, res, null)

        assert.equal(res.status(), 500)
        assert.isTrue(res.json.called)
    })
})
