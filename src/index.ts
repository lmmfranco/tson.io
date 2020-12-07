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

    constructor(
        public config?: TSONConfig
    ) {}

    static parse<T>(data: Object | string, clazz: Type<T>): T {
        const instance = new TSON(TSON.globalConfig);
        return instance.fromJson(data, clazz);
    }

    static stringify<T>(clazz: Type<T>, data: T, replacer?: JsonReplacer, space?: JsonSpacer) {
        const instance = new TSON(TSON.globalConfig);
        return instance.toJson(clazz, data, replacer, space);
    }

    fromJson<T>(data: Object | string, clazz: Type<T>): T {
        if(typeof data === "string") {
            return this._unmarshall(JSON.parse(data), clazz);
        } else {
            return this._unmarshall(data, clazz);
        }
    }

    toJson<T>(clazz: Type<T>, data: T, replacer?: JsonReplacer, space?: JsonSpacer) {
        return this._marshall(clazz, data, replacer, space);
    }

    private _unmarshall<T>(data: Object, clazz: Type<T>): T {
        const metaProps: PropertySerializationMeta[] = clazz.prototype[TSON_META_KEY];
        const instance = new clazz();

        for(const prop of metaProps) {
            const rawData = data[prop.serName];

            if(prop.isArray && Array.isArray(rawData)) {
                instance[prop.propName] = rawData.map(item => {
                    if(prop.construct) {
                        return this._unmarshall(item, <any> prop.construct);
                    } else {
                        return item;
                    }
                })
            } else if(prop.construct) {
                instance[prop.propName] = this._unmarshall(rawData, <any> prop.construct);
            } else {
                instance[prop.propName] = rawData;
            }
        }

        return instance;
    }

    private _marshall<T>(clazz: Type<T>, data: T, replacer?: JsonReplacer, space?: JsonSpacer, innerCall = false) {
        const metaProps: PropertySerializationMeta[] = clazz.prototype[TSON_META_KEY];
        const newObject = {};

        for(const prop of metaProps) {
            const rawData = data[prop.propName];

            if(prop.isArray && Array.isArray(rawData)) {
                newObject[prop.serName] = rawData.map(item => {
                    if(prop.construct) {
                        return this._marshall(<any> prop.construct, item, replacer, space, true);
                    } else {
                        return item;
                    }
                })
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
