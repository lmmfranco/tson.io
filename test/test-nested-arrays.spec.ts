import { serialize, serializeArray, TSON } from "../src";

class SimpleObject {
    @serialize() width: number;
    @serialize() height: number;
}

class ClassWithArrays {
    @serialize() param: string;
    @serializeArray() primitiveArray: number[];
    @serializeArray(SimpleObject) objectArray: SimpleObject[];
}

describe("Tests nested array serialization", () => {

    test("Deserialize json with array of primitives", () => {
        // Given
        const json = `{ "primitiveArray": [1,2,3,4,5] }`

        // When
        const parsed = TSON.parse(json, ClassWithArrays);

        // Then
        expect(parsed).toBeInstanceOf(ClassWithArrays);
        expect(parsed.primitiveArray).toHaveLength(5);
        expect(parsed.primitiveArray[2]).toEqual(3);
    });

    test("Deserialize json with array of objects", () => {
        // Given
        const json = `{ "objectArray": [
            {"width": 1, "height": 2},
            {"width": 3, "height": 4}
        ] }`

        // When
        const parsed = TSON.parse(json, ClassWithArrays);

        // Then
        expect(parsed).toBeInstanceOf(ClassWithArrays);
        expect(parsed.objectArray).toHaveLength(2);
        expect(parsed.objectArray[0]).toBeInstanceOf(SimpleObject);
        expect(parsed.objectArray[0].height).toEqual(2);

    });    

});