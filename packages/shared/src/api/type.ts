import type { I18nErrorKey } from '../i18n/index.js';

export type ApiErrorCode = I18nErrorKey

export type ApiErrorResponse = {
    ok: false
    error: {
        code: string
        message: string
    }
}

export type ApiHealthResponse = {
    ok: true
    now: string
}
