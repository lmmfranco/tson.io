const TSON_META_KEY = Symbol("tson_meta");

declare type Type<T> = { new (): T }
declare type JsonReplacer = (number | string)[] | null;
declare type JsonSpacer = string | number;

interface PropertySerializationMeta {
    propName: string;
    serName: string;
    construct?: Function;
    isArray: boolean;
}

function getOrInitMetaArray(clazz: any) {
    clazz[TSON_META_KEY] = clazz[TSON_META_KEY] || [];
    return clazz[TSON_META_KEY];
}

export function serialize(param1?: string | Function, param2?: Function, isArray = false) {
    return function(clazz: any, propName: string) {
        const meta: PropertySerializationMeta = {
            propName: propName,
            serName: propName,
            isArray
        };

        if (param1 != null) {
            if(typeof param1 === "string") {
                meta.serName = param1;
            }
            if(typeof param1 === "function") {
                meta.construct = param1;
            }
        }

        if(param2 != null) {
            meta.construct = param2;
        }

        getOrInitMetaArray(clazz).push(meta)
    }
}

export function serializeArray(param1?: string | Function, param2?: Function) {
    return serialize(param1, param2, true);
}

class TSONConfig {
    // TODO: options will be added in a future version
}

export class TSON {
    static globalConfig: TSONConfig;
    private static _globalInstance: TSON;

    constructor(
        public config?: TSONConfig
    ) {}

    private static _getGlobalInstance() {
        if(!TSON._globalInstance) {
            TSON._globalInstance = new TSON(TSON.globalConfig);
        }
        return TSON._globalInstance;
    }

    static parse<T>(data: Object | string, clazz: Type<T>): T {
        return TSON._getGlobalInstance().parse(data, clazz);
    }

    static parseArray<T>(data: Array<any> | string, clazz: Type<T>): T[] {
        return TSON._getGlobalInstance().parseArray(data, clazz);
    }

    static stringify<T>(clazz: Type<T>, data: T|T[], replacer?: JsonReplacer, space?: JsonSpacer) {
        return TSON._getGlobalInstance().stringify(clazz, data, replacer, space);
    }

    parse<T>(data: Object | string, clazz: Type<T>): T {
        if(typeof data === "string") {
            return this._unmarshall(JSON.parse(data), clazz);
        } else {
            return this._unmarshall(data, clazz);
        }
    }

    parseArray<T>(data: Array<any> | string, clazz: Type<T>): T[] {
        if(Array.isArray(data)) {
            return data.map(item => this.parse(item, clazz));
        } else {
            const dataArray = JSON.parse(data);

            if(Array.isArray(dataArray)) {
                return dataArray.map(item => this.parse(item, clazz));
            } else {
                throw SyntaxError("TSON: Supplied data is not an array or json array.")
            }

        }
    }

    stringify<T>(clazz: Type<T>, data: T|T[], replacer?: JsonReplacer, space?: JsonSpacer): string  {
        if(Array.isArray(data)) {
            const parsedItems = data.map(item => this._marshall(clazz, item, null, null, true));
            return JSON.stringify(parsedItems, replacer, space);
        } else {
            return this._marshall(clazz, data, replacer, space) as string;
        }
    }

    fromJson<T>(data: Object | string, clazz: Type<T>): T {
        return this.parse(data, clazz);
    }

    toJson<T>(clazz: Type<T>, data: T|T[], replacer?: JsonReplacer, space?: JsonSpacer): string {
        return this.stringify(clazz, data, replacer, space);
    }

    private _unmarshall<T>(data: Object, clazz: Type<T>): T {
        const metaProps: PropertySerializationMeta[] = clazz.prototype[TSON_META_KEY];
        const instance = new clazz();

        for(const prop of metaProps) {
            const rawData = data[prop.serName];
            if(prop.isArray) {
                if(Array.isArray(rawData)) {
                    instance[prop.propName] = rawData.map(item => {
                        if(prop.construct) {
                            return this._unmarshall(item, <any> prop.construct);
                        } else {
                            return item;
                        }
                    });
                } else {
                    instance[prop.propName] = rawData;    
                }
            } else if(prop.construct) {
                instance[prop.propName] = this._unmarshall(rawData, <any> prop.construct);
            } else {
                instance[prop.propName] = rawData;
            }
        }

        return instance;
    }

    private _marshall<T>(clazz: Type<T>, data: T, replacer?: JsonReplacer, space?: JsonSpacer, innerCall = false): string | Object {
        const metaProps: PropertySerializationMeta[] = clazz.prototype[TSON_META_KEY];
        const newObject = {};

        for(const prop of metaProps) {
            const rawData = data[prop.propName];

            if(prop.isArray) {
                if(Array.isArray(rawData)) {
                    newObject[prop.serName] = rawData.map(item => {
                        if(prop.construct) {
                            return this._marshall(<any> prop.construct, item, replacer, space, true);
                        } else {
                            return item;
                        }
                    })
                } else {
                    newObject[prop.serName] = rawData;
                }
            } else if(prop.construct) {
                newObject[prop.serName] = this._marshall(<any> prop.construct, rawData, replacer, space, true);
            } else {
                newObject[prop.serName] = rawData;
            }
        }

        if(innerCall) {
            return newObject;
        } else {
            return JSON.stringify(newObject, replacer, space);
        }
    }
}
