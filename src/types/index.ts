import {API, BlockAPI, BlockToolData} from '@editorjs/editorjs';

export const CLASS_NAME = 'editorjs-code2'

/**
 * CodeTool Tool's input and output data format
 */
export interface CodeToolData extends BlockToolData {
    code?: string,
    theme?: string,
    language?: string
}

/**
 * CodeTool Tool's configuration object that passed through the initial Editor config
 */
export interface CodeToolConfig {
    defaultTheme: string,
    defaultLanguage: string
}

export interface CodeEditorContext {
    config: CodeToolConfig,
    api:API,
    block: BlockAPI,
    data:CodeToolData,
    readOnly:boolean,
}
