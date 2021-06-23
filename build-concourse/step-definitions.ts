import { Env, IO, RESOURCES } from "./util";

export enum GIT_OR_ARCHIVE {
    GIT = 'git',
    ARCHIVE = 'archive'
}

export type NameInOutEnv = {
    name: string
    inputs: string[]
    outputs: string[]
    env: Env
}

// These are used both by CORGI when building a preview and by the webhosting pipeline
export const ARCHIVE_WEB_STEPS: NameInOutEnv[] = [
    {name: 'archive-fetch', inputs: [IO.BOOK], outputs: [IO.ARCHIVE_FETCHED], env: {}},
    {name: 'archive-fetch-metadata', inputs: [IO.BOOK, IO.ARCHIVE_FETCHED], outputs: [IO.ARCHIVE_FETCHED], env: {}},
    {name: 'archive-assemble', inputs: [IO.BOOK, IO.ARCHIVE_FETCHED], outputs: [IO.ARCHIVE_BOOK, IO.ARCHIVE_FETCHED], env: {}},
    {name: 'archive-assemble-metadata', inputs: [IO.BOOK, IO.ARCHIVE_FETCHED, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK, IO.ARCHIVE_FETCHED], env: {}},
    {name: 'archive-link-extras', inputs: [IO.BOOK, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK], env: {}},
    {name: 'archive-bake', inputs: [IO.BOOK, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK], env: {}},
    {name: 'archive-bake-metadata', inputs: [IO.BOOK, IO.ARCHIVE_FETCHED, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK, IO.ARCHIVE_FETCHED], env: {}},
    {name: 'archive-checksum', inputs: [IO.BOOK, IO.ARCHIVE_BOOK, IO.ARCHIVE_FETCHED], outputs: [IO.BOOK, IO.ARCHIVE_BOOK, IO.ARCHIVE_FETCHED], env: {}},
    {name: 'archive-disassemble', inputs: [IO.BOOK, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK], env: {}},
    {name: 'archive-patch-disassembled-links', inputs: [IO.BOOK, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK], env: {}},
    {name: 'archive-jsonify', inputs: [IO.BOOK, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK, IO.ARCHIVE_JSONIFIED, IO.ARTIFACTS], env: {}},
    {name: 'archive-validate-xhtml', inputs: [IO.BOOK, IO.ARCHIVE_JSONIFIED], outputs: [], env: {}}
]

export const archiveDequeue = {name: 'archive-dequeue-book', inputs: [RESOURCES.S3_QUEUE], outputs: [IO.BOOK], env: { S3_QUEUE: RESOURCES.S3_QUEUE, CODE_VERSION: true }}
export const archiveReportComplete = {name: 'archive-report-book-complete', inputs: [IO.BOOK], outputs: [], env: {CODE_VERSION: true, WEB_QUEUE_STATE_S3_BUCKET: true, AWS_ACCESS_KEY_ID: true, AWS_SECRET_ACCESS_KEY: true, AWS_SESSION_TOKEN: false}}

export function buildUploadStep(requireCorgiBucket: boolean, requireWebhostingBucket: boolean) {
    return {name: 'archive-upload-book', inputs: [IO.BOOK, IO.ARCHIVE_FETCHED, IO.ARCHIVE_JSONIFIED, IO.ARCHIVE_BOOK], outputs: [IO.ARCHIVE_BOOK, IO.ARCHIVE_FETCHED, IO.ARCHIVE_UPLOAD], env: {CORGI_ARTIFACTS_S3_BUCKET: requireCorgiBucket, WEB_S3_BUCKET: requireWebhostingBucket, AWS_ACCESS_KEY_ID: true, AWS_SECRET_ACCESS_KEY: true, AWS_SESSION_TOKEN: false}}
}

export function buildLookUpBook(gitOrArchive: GIT_OR_ARCHIVE, inputSource: RESOURCES): NameInOutEnv {
    return {name: gitOrArchive == GIT_OR_ARCHIVE.GIT ? 'git-look-up-book' : 'archive-look-up-book', inputs: [inputSource], outputs: [IO.BOOK, IO.COMMON_LOG], env: { INPUT_SOURCE_DIR: inputSource }}
}

export const archiveGdocSteps = [
    ...ARCHIVE_WEB_STEPS, // up to archive-validate-xhtml
    {name: 'archive-gdocify', inputs: [IO.ARCHIVE_BOOK, IO.ARCHIVE_FETCHED], outputs: [IO.ARCHIVE_GDOCIFIED], env: {}},
    {name: 'archive-convert-docx', inputs: [IO.ARCHIVE_GDOCIFIED], outputs: [IO.ARCHIVE_GDOCIFIED], env: {}},
    {name: 'archive-upload-docx', inputs: [IO.BOOK, IO.ARCHIVE_GDOCIFIED], outputs: [IO.ARCHIVE_GDOCIFIED], env: {GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: true, AWS_ACCESS_KEY_ID: true, AWS_SECRET_ACCESS_KEY: true, AWS_SESSION_TOKEN: false}},
]