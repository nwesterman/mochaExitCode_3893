const assert = require('chai').assert
const Joi = require('joi')

describe('joi', () => {
    describe('Joi.Validate()', () => {
        let schema
        beforeEach(() => {
            schema = Joi.object().keys({
                stringA: Joi.string(),
                intA: Joi.number(),
                booleanA: Joi.boolean(),
                objectA: Joi.object(),
                dateA: Joi.date(),
                arrayA: Joi.array(),
            })
        })

        it(`Doesn't set errors on expected values`, () => {
            const joiValidation = Joi.validate({
                stringA: '15',
                intA: 6,
                booleanA: true,
                objectA: {},
                arrayA: [1, 2, 3],
            }, schema)
            assert.isNull(joiValidation.error, 'Unexpected Error set')
            assert.deepEqual(joiValidation.value, {
                stringA: '15',
                intA: 6,
                booleanA: true,
                objectA: {},
                arrayA: [1, 2, 3],
            })
        })

        describe('Required/Optional', () => {
            it('Notes an error if a required value is missing', () => {
                schema = Joi.object().keys({
                    reqValue: Joi.string().required(),
                    reqValue2: Joi.number().required(),
                })
                const joiValidation = Joi.validate({reqValue: 'hello' }, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"reqValue2" is required`)
            })
            it('Does not set an error if an optional value is missing', () => {
                schema = Joi.object().keys({
                    reqValue: Joi.string().required(),
                    reqValue2: Joi.number().optional(),
                })
                const joiValidation = Joi.validate({reqValue: 'hello' }, schema)
                assert.isNull(joiValidation.error)
            })
            it('Defaults to optional', () => {
                schema = Joi.object().keys({
                    notSpecified: Joi.string(),
                })
                const joiValidation = Joi.validate({}, schema)
                assert.isNull(joiValidation.error)
            })
        })
        // By default Joi will make simplistic attemtps to convert values to the schema types
        // Notably, converts JSON/value like strings to the regular types. I.e '6' => 6; '{"myProp": true}' => {myProp: true}
        // Effectively giving us guarantees `==` values instead of strict equal `===` values
        // Joi provides an option to disable this, but unfortunatly the conversion functionality must be enabled
        // for string truncation to work, even though truncation itself is not enabled by default.
        // Truncation was not originally part of our requirements, but to make things work for AgSync it is being added.
        // When values are converted during validation the originals are NOT updated, they must be manually taken from the returned 'value' property
        describe('Joi conversion', () => {
            it(`Converts numeric strings to numbers`, () => {
                const joiValidation = Joi.validate({intA: '15' }, schema)
                const errors = joiValidation.error
                const testVal = joiValidation.value

                assert.isNull(errors, 'Error thrown')
                assert.isNumber(testVal.intA, 'chai isNumber')
                assert.isNotString(testVal.intA, 'chai isNotString')
                assert.strictEqual(testVal.intA, 15, 'value check')
                assert.strictEqual(typeof testVal.intA, 'number', 'typeof check')
            })
            it(`Converts 'true'/'false' strings to bools`, () => {
                const joiValidation = Joi.validate({booleanA: 'true'}, schema)
                const errors = joiValidation.error
                const testVal = joiValidation.value
                const joiValidation2 = Joi.validate({booleanA: 'false'}, schema)
                const errors2 = joiValidation2.error
                const testVal2 = joiValidation2.value

                assert.isNull(errors, 'Error thrown')
                assert.isNull(errors2, 'Error thrown')
                assert.isNotString(testVal.booleanA, 'chai isNotString, true')
                assert.isNotString(testVal2.booleanA, 'chai isNotString, false')
                assert.isBoolean(testVal.booleanA, 'chai isBoolean, true')
                assert.isBoolean(testVal2.booleanA, 'chai isBoolean, false')
                assert.strictEqual(testVal.booleanA, true, 'strict equal check, true')
                assert.strictEqual(testVal2.booleanA, false, 'strict equal check, false')
                assert.typeOf(testVal.booleanA, 'boolean', 'typeof check, true')
                assert.typeOf(testVal2.booleanA, 'boolean', 'typeof check, false')
            })
            it(`Converts JSON strings to objects`, () => {
                const joiValidation = Joi.validate({objectA: '{"myProp": true}'}, schema)
                const errors = joiValidation.error
                const testVal = joiValidation.value

                assert.isNull(errors, 'Expected Error to be thrown')
                assert.isObject(testVal.objectA, 'chai isObject')
                assert.isNotString(testVal.objectA, 'chai isNotString')
                assert.deepEqual(testVal.objectA, {myProp: true}, 'object value deep equals')
                assert.typeOf(testVal.objectA, 'object', 'typeof check')
            })
            it(`Converts a string containing an array to an actual array`, () => {
                const joiValidation = Joi.validate({arrayA: '[1, 2, 3]'}, schema)
                const errors = joiValidation.error
                const testVal = joiValidation.value
                assert.isNull(errors, 'Expected Error to be thrown')
                assert.isArray(testVal.arrayA, 'chai isArray')
                assert.isNotString(testVal.objectA, 'chai isNotString')
                assert.deepEqual(testVal.arrayA, [1, 2, 3], 'object value deep equals')
                assert.typeOf(testVal.arrayA, 'array', 'typeof check')
            })
        })
        describe('Joi.Number()', () => {
            it(`Does set errors when given bools for numbers`, () => {
                const joiValidation = Joi.validate({intA: true}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"intA" must be a number`)
            })
            it(`Does throw errors when given objects for numbers`, () => {
                const joiValidation = Joi.validate({intA: {intA: 1}}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"intA" must be a number`)
            })
            it(`Does throw errors when given arrays for numbers`, () => {
                const joiValidation = Joi.validate({intA: [1]}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"intA" must be a number`)
            })
        })
        describe('Joi.String()', () => {
            it(`Does throw errors when given numbers for strings`, () => {
                const joiValidation = Joi.validate({stringA: 26}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"stringA" must be a string`)
            })
            it(`Does throw errors when given objects for strings`, () => {
                const joiValidation = Joi.validate({stringA: {stringA: 'string me'}}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"stringA" must be a string`)
            })
            it(`Does throw errors when given bools for strings`, () => {
                const joiValidation = Joi.validate({stringA: true}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"stringA" must be a string`)
            })
            it(`Does throw errors when given arrays for strings`, () => {
                const joiValidation = Joi.validate({stringA: ['string me']}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"stringA" must be a string`)
            })
        })
        describe('Joi.Object()', () => {
            it(`Does throw errors when given numbers for objects`, () => {
                const joiValidation = Joi.validate({objectA: 53}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"objectA" must be an object`)
            })
            it(`Does throw errors when given bools for objects`, () => {
                const joiValidation = Joi.validate({objectA: false}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"objectA" must be an object`)
            })
            it(`Does throw errors when given arrays for objects`, () => {
                const joiValidation = Joi.validate({objectA: [{}]}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"objectA" must be an object`)
            })
        })
        describe('Joi.Boolean()', () => {
            it(`Does throw errors when given numbers for bools`, () => {
                const joiValidation = Joi.validate({booleanA: 0}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"booleanA" must be a boolean`)
            })
            it(`Does throw errors when given objects for bools`, () => {
                const joiValidation = Joi.validate({booleanA: {booleanA: true}}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"booleanA" must be a boolean`)
            })
            it(`Does throw errors when given arrays for bools`, () => {
                const joiValidation = Joi.validate({booleanA: [true]}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"booleanA" must be a boolean`)
            })
        })
        describe('Joi.Array()', () => {
            it(`Does throw errors when given numbers for arrays`, () => {
                const joiValidation = Joi.validate({arrayA: 0}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"arrayA" must be an array`)
            })
            it(`Does throw errors when given objects for arrays`, () => {
                const joiValidation = Joi.validate({arrayA: {arrayA: [1, 2, 3]}}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"arrayA" must be an array`)
            })
            it(`Does throw errors when given booleans for arrays`, () => {
                const joiValidation = Joi.validate({arrayA: false}, schema)
                assert.isNotEmpty(joiValidation.error, 'Expected error to be set')
                assert.include(joiValidation.error.message, `"arrayA" must be an array`)
            })
        })
        describe('Max', () => {
            let schema
            beforeEach(() => {
                schema = Joi.object().keys({
                    stringA: Joi.string().max(10),
                })
            })
            it(`Accepts short enough values`, () => {
                const joiValidation = Joi.validate({ stringA: '5char'}, schema)
                assert.isNull(joiValidation.error)
                assert.strictEqual(joiValidation.value.stringA, '5char')
            })
            it(`Rejects longer values`, () => {
                const joiValidation = Joi.validate({ stringA: 'MuchTooLongString'}, schema)
                assert.isNotNull(joiValidation.error, 'Expected Error to be set')
                assert.include(joiValidation.error.message, `"stringA" length must be less than or equal to 10 characters long`)
            })
        })
        describe('Truncate', () => {
            let schema
            beforeEach(() => {
                schema = Joi.object().keys({
                    stringA: Joi.string().max(10).truncate(),
                })
            })
            it(`Accepts short enough values`, () => {
                const joiValidation = Joi.validate({ stringA: '5char'}, schema)
                assert.isNull(joiValidation.error)
                assert.strictEqual(joiValidation.value.stringA, '5char')
            })
            it(`Accepts longer values, returns truncated value`, () => {
                const joiValidation = Joi.validate({ stringA: 'MuchTooLongString'}, schema)
                assert.isNull(joiValidation.error)
                assert.strictEqual(joiValidation.value.stringA, 'MuchTooLon')
            })
        })
    })
    describe('Our Entity Application', () => {
        let schema
        let TestEntity
        beforeEach(() => {
            schema = Joi.object().keys({
                id: Joi.number().integer(),
                neverSet: Joi.number().integer().allow(null),
                name: Joi.string().max(32).required().truncate(),
                deprecated: Joi.boolean(),
                ownerPartyId: Joi.number().integer().required(),
                nullValue: Joi.string().max(36).allow(null, ''),
            })
            class _TestEntity {
                constructor(data) {
                    const source = {...data}
                    Object.assign(this, source)
                    this.validate()
                }

                validate() {
                    const joiValidation = Joi.validate(this, schema)
                    if (joiValidation.error) { throw joiValidation.error }
                    else { Object.assign(this, joiValidation.value) }
                }
            }
            TestEntity = _TestEntity
        })
        it(`Stores any applied Joi conversions as proper values`, () => {
            let errors = null
            let testVal
            const testData = {
                id: '1',
                name: 'My Test Ingredient',
                deprecated: 'false',
                ownerPartyId: '22',
                nullValue: null,
            }
            try {
                testVal = new TestEntity(testData)
                testVal.validate()
            }
            catch (e) {
                errors = e
            }
            assert.isNull(errors, 'Unexpected Error Thrown')
            assert.strictEqual(testVal.id, 1, 'id string => num')
            assert.strictEqual(testVal.name, 'My Test Ingredient')
            assert.strictEqual(testVal.deprecated, false)
            assert.strictEqual(testVal.ownerPartyId, 22)
            assert.strictEqual(testVal.nullValue, null)
            assert.strictEqual(testVal.neverSet, undefined)
        })
        it(`Truncates too long of strings`, () => {
            let errors = null
            let testVal
            const testData = {
                id: 1,
                name: 'LetMeMakeAReallyLongString_30_32_AND BREAK',
                deprecated: false,
                ownerPartyId: 22,
                nullValue: null,
            }
            try {
                testVal = new TestEntity(testData)
                testVal.validate()
            }
            catch (e) {
                errors = e
            }
            assert.isNull(errors, 'Unexpected Error Thrown')
            assert.strictEqual(testVal.id, 1)
            assert.strictEqual(testVal.name, 'LetMeMakeAReallyLongString_30_32')
            assert.strictEqual(testVal.deprecated, false)
            assert.strictEqual(testVal.ownerPartyId, 22)
            assert.strictEqual(testVal.nullValue, null)
            assert.strictEqual(testVal.neverSet, undefined)
        })
        describe('Nested Entities', () => {
            let parentSchema
            let ParentEntity
            beforeEach(() => {
                parentSchema = Joi.object().keys({
                    id: Joi.number().integer().min(1),
                    name: Joi.string().max(32).required().truncate(),
                    child: Joi.object().type(TestEntity).allow(null),
                })

                class _ParentEntity {
                    constructor(data) {
                        const source = {...data}
                        Object.assign(this, source)
                        if (this.child) {
                            this.child = new TestEntity(this.child)
                        }
                        this.validate()
                    }

                    validate() {
                        const joiValidation = Joi.validate(this, parentSchema)
                        if (joiValidation.error) { throw joiValidation.error }
                        else { Object.assign(this, joiValidation.value) }
                        if (this.child) this.child.validate()
                    }
                }
                ParentEntity = _ParentEntity
            })
            it('Winds up with all values converted', () => {
                let errors = null
                let testVal
                const testData = {
                    id: '3',
                    name: 'SecondTakeReallyLongString_30_32_AND BREAK',
                    child: {
                        id: 1,
                        name: 'LetMeMakeAReallyLongString_30_32_AND BREAK',
                        deprecated: 'false',
                        ownerPartyId: '22',
                        nullValue: null,
                    },
                }
                try {
                    testVal = new ParentEntity(testData)
                    testVal.validate()
                }
                catch (e) {
                    errors = e
                }
                assert.strictEqual(testVal.name, 'SecondTakeReallyLongString_30_32', 'parent name')
                assert.strictEqual(testVal.id, 3, 'parent id')
                assert.strictEqual(testVal.child.id, 1, 'child id')
                assert.strictEqual(testVal.child.name, 'LetMeMakeAReallyLongString_30_32', 'child name')
                assert.strictEqual(testVal.child.deprecated, false, 'deprecated')
                assert.strictEqual(testVal.child.ownerPartyId, 22, 'owner party')
                assert.strictEqual(testVal.child.nullValue, null, 'null value')
                assert.strictEqual(testVal.child.neverSet, undefined, 'where did you come from')
                assert.isNull(errors, 'Unexpected Error Thrown')
            })
            it('Rejects error in parent level', () => {
                let errors = null
                let testVal
                const testData = {
                    id: 3,
                    child: null,
                }
                try {
                    testVal = new ParentEntity(testData)
                    testVal.validate()
                }
                catch (e) {
                    errors = e
                }
                assert.isNotEmpty(errors, 'Expected Error to be set')
                assert.include(errors.message, '"name" is required')
            })
            it('Rejects error in child level', () => {
                let errors = null
                let testVal
                const testData = {
                    id: 3,
                    name: `Hi kid i'm dad`,
                    child: {
                        id: 1,
                        name: 'Reasonable Name',
                    },
                }
                try {
                    testVal = new ParentEntity(testData)
                    testVal.validate()
                }
                catch (e) {
                    errors = e
                }
                assert.isNotEmpty(errors, 'Expected Error to be set')
                assert.include(errors.message, '"ownerPartyId" is required')
            })
        })
    })
})
