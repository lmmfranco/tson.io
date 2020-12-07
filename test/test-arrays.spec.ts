import { serialize, TSON } from "../src";

class SimpleObject {
    @serialize() width: number;
    @serialize() height: number;

    constructor(w?: number,h?: number) {
        this.width = w;
        this.height = h;
    }
}

describe("Tests array serialization", () => {

    test("Deserialize json array of simple objects", () => {
        // Given
        const json = `[
            {"width": 1, "height": 2},
            {"width": 3, "height": 4},
            {"width": 5, "height": 6}
        ]`;

        // When
        const parsed = TSON.parseArray(json, SimpleObject)

        // Then
        expect(parsed).toBeInstanceOf(Array);
        expect(parsed).toHaveLength(3);
        expect(parsed[0]).toBeInstanceOf(SimpleObject);
    });

    test("Deserialize array of anonymous objects", () => {
        // Given
        const data = [
            {"width": 1, "height": 2},
            {"width": 3, "height": 4},
            {"width": 5, "height": 6}
        ]

        // When
        const parsed = TSON.parseArray(data, SimpleObject)

        // Then
        expect(parsed).toBeInstanceOf(Array);
        expect(parsed).toHaveLength(3);
        expect(parsed[0]).toBeInstanceOf(SimpleObject);
    });

    test("parseArray should error when json input is not an array", () => {
        // Given
        const data = `{"width": 1, "height": 2}`;

        // When
        expect(() => {
            const parsed = TSON.parseArray(data, SimpleObject)
        })
        // Then
        .toThrow(SyntaxError)
    });


    test("Serialize array of objects", () => {
        // Given
        const data = [
            new SimpleObject(1,2),
            new SimpleObject(3,4),
            new SimpleObject(5,6)
        ]
        const expected = JSON.stringify(data);

        // When
        const parsed = TSON.stringify(SimpleObject, data)

        // Then
        expect(parsed).toEqual(expected);
    });

});