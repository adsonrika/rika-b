import type { I18nErrorKey } from "../i18n";

export type ApiErrorCode = I18nErrorKey

export type ApiErrorResponse = {
    ok: false
    error: {
        code: string
        message: string
    }
}
