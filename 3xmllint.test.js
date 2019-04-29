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
</xs:schema>
`
describe('Xmllint', () => {
    it('Test 1', () => {
        const mainErrors = xmllint.validateXML({
            xml: `<TEST></TEST>`,
            schema: [schema],
        })
        assert.deepEqual(mainErrors, {errors: ['something or another']})
    }).timeout(15000)
    it('Test 2', () => {
        const mainErrors = xmllint.validateXML({
            xml: `<Taskdata VersionMajor="4"></Taskdata>`,
            schema: [schema],
        })
        assert.deepEqual(mainErrors, {errors: null})
    }).timeout(15000)
    it('Guaranteed Error', () => assert.isFalse(true))
    it('Test 3', () => {
        const mainErrors = xmllint.validateXML({
            xml: `
            <Taskdata DataTransferOrigin="1"></Taskdata>`,
            schema: [schema],
        })
        assert.deepEqual(mainErrors, {errors: null})
    }).timeout(15000)
})
