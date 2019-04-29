const assert = require('chai').assert
const crypto = require('crypto')

function hrw(item, value) {
    const hash = crypto.createHash('sha1')
    hash.update(Buffer.from(item, 'utf8'))
    hash.update(Buffer.from([0]))
    hash.update(Buffer.from(value, 'utf8'))

    return hash.digest()
}

function choose(array, value) {
    let highestItem = null
    let highestHrw = Buffer.from([])

    for (const item of array) {
        const buf = hrw(item, value)

        if (Buffer.compare(buf, highestHrw) > 0) {
            highestHrw = buf
            highestItem = item
        }
    }

    return highestItem
}

describe('highest-random-weight', () => {
    describe('hrw', () => {
        it('returns expected values', () => {
            // It's kinda hard to test this without knowing what the result
            // should be. The algorithm is Highest Random Weight (rendezvous
            // hashing), determined using sha1(host + '\0' + channel)
            assert.equal(hrw('1.some-host.com', '366626c3-8c9b-4875-bd70-f989ebcd5954').toString('hex'), 'e88e072fcb40304f83afcb1c7d9bff3a10148a1f')
            assert.equal(hrw('2.some-host.com', '366626c3-8c9b-4875-bd70-f989ebcd5954').toString('hex'), 'b5a47092bbe3ef3144ec685d41606bba766a7d91')
            assert.equal(hrw('1.some-host.com', '51b89ad3-f2e9-44c0-9ca2-e0ebd6b0e12e').toString('hex'), '90c281c3949ef05ec7e2e0ecc60a88f5beeaf584')
            assert.equal(hrw('2.some-host.com', '51b89ad3-f2e9-44c0-9ca2-e0ebd6b0e12e').toString('hex'), '6c954917e2768c5e70395472894cef4a780fe695')
        })
    })

    describe('choose', () => {
        it('chooses among the various values', () => {
            const result1 = choose([
                '1.some-host.com',
                '2.some-host.com',
            ], '366626c3-8c9b-4875-bd70-f989ebcd5954')

            assert.equal(result1, '1.some-host.com')

            const result2 = choose([
                '1.some-host.com',
                '2.some-host.com',
            ], '51b89ad3-f2e9-44c0-9ca2-e0ebd6b0e12e')

            assert.equal(result2, '1.some-host.com')
        })
        it('Guaranteed Error', () => assert.isFalse(true))
        it('is not affected by order', () => {
            const result1 = choose([
                '2.some-host.com',
                '1.some-host.com',
            ], '366626c3-8c9b-4875-bd70-f989ebcd5954')

            assert.equal(result1, '1.some-host.com')

            const result2 = choose([
                '1.some-host.com',
                '2.some-host.com',
            ], '51b89ad3-f2e9-44c0-9ca2-e0ebd6b0e12e')

            assert.equal(result2, '1.some-host.com')
        })
        it('Does not error an empty array', () => {
            const result1 = choose([], '366626c3-8c9b-4875-bd70-f989ebcd5954')

            assert.equal(result1, null)
        })
    })
})
