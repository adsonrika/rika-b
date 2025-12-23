import { type FilterByPrefix, type LeafPaths } from '../utils'

export type I18nConfigType = {
    app: {
        title: string,
        hello: string,
        language: string,
    },
    error: {
        internal: string,
        badRequest: string,
    },
}

export type I18nKey = LeafPaths<I18nConfigType>

export type I18nAppKey = FilterByPrefix<I18nKey, 'app'>

export type I18nErrorKey = FilterByPrefix<I18nKey, 'error'>
