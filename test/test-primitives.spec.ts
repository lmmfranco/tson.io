import { serialize, TSON } from "../src";

class MyClass {
    @serialize() name: string;
    @serialize() flag: boolean;
    @serialize() count: number;
    extra: string;
}

const defaultName = "Franco";
const defaultFlag = true;
const defaultCount = 1337;

describe("Tests serialization for primitive properties", () => {

    test("Deserialized object should contain only decorated properties", () => {
        // Given
        const json = `{
            "name": "${defaultName}",
            "flag": ${defaultFlag},
            "count": ${defaultCount},
            "extra": "lorem"
        }`;

        // When
        const parsed = TSON.parse(json, MyClass);

        // Then
        expect(parsed).toHaveProperty("name");
        expect(parsed).toHaveProperty("flag");
        expect(parsed).toHaveProperty("count");
        expect(parsed).not.toHaveProperty("extra");
        expect(parsed.name).toBe(defaultName);
        expect(parsed.flag).toBe(defaultFlag);
        expect(parsed.count).toBe(defaultCount);
    });

    test("Serialized object should contain only decorated properties", () => {
        // Given
        const object = new MyClass();
        object.name = defaultName;
        object.flag = defaultFlag;
        object.count = defaultCount;
        object.extra = "lorem";

        // When
        const json = TSON.stringify(MyClass, object);

        // Then
        expect(json).toContain("name");
        expect(json).toContain("flag");
        expect(json).toContain("count");
        expect(json).not.toContain("extra");
    });

    test("Serialized object should match JSON.stringify format", () => {
        // Given
        const object = new MyClass();
        object.name = defaultName;
        object.flag = defaultFlag;
        object.count = defaultCount;

        // When
        const expectedJson = JSON.stringify(object, null, 2);
        const actualJson = TSON.stringify(MyClass, object, null, 2);

        // Then
        expect(actualJson).toEqual(expectedJson);
    });

    test("Deserialized object should be of supplied type", () => {
        // Given
        const json = `{
            "name": "${defaultName}",
            "flag": ${defaultFlag},
            "count": ${defaultCount},
            "extra": "lorem"
        }`;

        // When
        const parsed = TSON.parse(json, MyClass);

        // Then
        expect(parsed).toBeInstanceOf(MyClass);
    });

    test("Deserialization should work with any javascript object", () => {
        // Given
        class OtherClass {
            constructor(
                public name: string,
                public flag: boolean,
                public count: number,
            ) {}
        }

        const sourceAnon = {
            name: defaultName,
            flag: defaultFlag,
            count: defaultCount,
        }

        const sourceTyped = new OtherClass(defaultName, defaultFlag, defaultCount);

        // When
        const parsedAnon = TSON.parse(sourceAnon, MyClass);
        const parsedTyped = TSON.parse(sourceTyped, MyClass);

        // Then
        expect(parsedAnon).toBeInstanceOf(MyClass);
        expect(parsedTyped).toBeInstanceOf(MyClass);
    });
});