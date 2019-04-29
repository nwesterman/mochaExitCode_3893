const assert = require('chai').assert
const xmllint = require('xmllint')

const schema = `
<!-- Schema revision date 2015-05-26, Schema version 4.2, TC version 4, schema revision 2 -->
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">
    <xs:element name="Taskdata">
		<xs:complexType>
			<xs:attribute name="VersionMajor" use="required">
				<xs:simpleType>
					<xs:restriction base="xs:NMTOKEN"/>
				</xs:simpleType>
			</xs:attribute>
			<xs:attribute name="DataTransferOrigin" use="required">
				<xs:simpleType>
					<xs:restriction base="xs:NMTOKEN">
						<xs:enumeration value="1">
							<xs:annotation>
								<xs:documentation xml:lang="en">
									FMIS
								</xs:documentation>
							</xs:annotation>
						</xs:enumeration>
						<xs:enumeration value="2">
							<xs:annotation>
								<xs:documentation xml:lang="en">
									MICS
								</xs:documentation>
							</xs:annotation>
						</xs:enumeration>
					</xs:restriction>
				</xs:simpleType>
			</xs:attribute>
		</xs:complexType>
	</xs:element>
</xs:schema>`

describe('LinkListBuilder', () => {
    beforeEach(() => {    })
    it('Guaranteed Error', () => assert.isFalse(true))
    describe('XSD Compliance', () => {
        it('Test 1', () => {
            const linkErrors = xmllint.validateXML({
                xml: `<Taskdata VersionMajor="4"/>`,
                schema: schema,
            })
            assert.deepEqual(linkErrors, {errors: null}, 'Test 1')

        }).timeout(15000)
        it('Test 2', () => {
            const linkErrors = xmllint.validateXML({
                xml:`<Taskdata VersionMajor="4"/>`,
                schema: schema,
            })
            assert.deepEqual(linkErrors, {errors: null}, 'Test 2')
        }).timeout(15000)

        it('Test 3', () => {
            const mainErrors = xmllint.validateXML({
                xml: `<Taskdata DataTransferOrigin="1"/>`,
                schema: [schema],
            })
            assert.deepEqual(mainErrors, {errors: null}, 'Test 3')

        }).timeout(15000)
        it('Test 4', () => {
            const mainErrors = xmllint.validateXML({
                xml: `<Taskdata DataTransferOrigin="1"/>`,
                schema: [schema],
            })
            assert.deepEqual(mainErrors, {errors: null}, 'Errors in main file')
        }).timeout(15000)
        it('Guaranteed Error', () => assert.isFalse(true))
    })
})
