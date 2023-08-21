// @ts-ignore
import debounce from "lodash.debounce";
import {CodeEditorContext, CodeToolData} from "../types";

import {EditorView, minimalSetup, } from "codemirror"
import { EditorState, Compartment } from '@codemirror/state';
import { lineNumbers, keymap } from '@codemirror/view';
import {indentWithTab} from "@codemirror/commands"
import { foldGutter } from '@codemirror/language';

// language support
import LANGUAGES_MAPPING from './languages'

// theme support
import * as themes from '@uiw/codemirror-themes-all';

export class Editor {

    private readonly data:CodeToolData;

    private context: CodeEditorContext;

    private editor: EditorView | null = null;

    private readonly themeComp: Compartment;

    private readonly readonlyComp: Compartment;
    private readonly languageComp: Compartment;

    constructor(context: CodeEditorContext) {

        this.context = context;

        this.data = Object.assign({}, this.context.data)

        this.updateData = debounce(this.updateData, 300)

        this.themeComp = new Compartment();
        this.readonlyComp = new Compartment();
        this.languageComp = new Compartment();
    }

    render(container:HTMLElement) {
        container.addEventListener('paste', (e:Event)=> {
            e.stopPropagation();
            e.preventDefault();
        });

        this.editor = new EditorView({
            doc: this.data.code,
            extensions: [
                minimalSetup,

                keymap.of([indentWithTab]),

                lineNumbers(),
                foldGutter({
                    // closedText: '▶',
                    // openText: '▼'
                }),
                EditorView.theme({
                    // "&": {maxHeight: "400px"},
                    ".cm-scroller": {overflow: "auto"},
                    // ".cm-content, .cm-gutter": {minHeight: "200px"}
                }),

                this.readonlyComp.of(EditorState.readOnly.of(this.context.readOnly)),

                // @ts-ignore
                this.themeComp.of(themes[this.data.theme || this.context.config.defaultTheme || 'abcdef']),

                // @ts-ignore
                this.languageComp.of(LANGUAGES_MAPPING[this.data.language || this.context.config.defaultLanguage || 'java']),

                EditorView.updateListener.of((e)=> {
                    if (e.docChanged) {
                        this.updateData({code: e.state.doc.toString()})
                    }
                })
            ],
            parent: container
        });

        setTimeout(()=> this.setReadOnly(this.context.readOnly), 0)
    }

    updateData(data:any) {
        Object.assign(this.data, data)
        this.context.block.dispatchChange();
    }

    getData() {
        return this.data;
    }

    setReadOnly(readOnly: boolean) {
        this.editor?.dispatch({
            effects: this.readonlyComp.reconfigure(EditorState.readOnly.of(readOnly))
        });
        if (readOnly) {
            this.editor?.contentDOM.classList.add('readonly')
            this.editor?.contentDOM.setAttribute('contenteditable', "false")
        } else {
            this.editor?.contentDOM.classList.remove('readonly')
            this.editor?.contentDOM.setAttribute('contenteditable', "true")
        }
    }

    setTheme(theme:string) {
        this.editor?.dispatch({
            // @ts-ignore
            effects: this.themeComp.reconfigure(themes[theme])
        });
        this.updateData({theme})
    }

    setLanguage(language: string) {
        this.editor?.dispatch({
            // @ts-ignore
            effects: this.languageComp.reconfigure(LANGUAGES_MAPPING[language])
        });
        this.updateData({language})
    }

    getAllThemes() {
        return Object.keys(themes)
            .filter(name => !name.endsWith("Init"))
            .filter(name => !name.startsWith("defaultSettings"))
    }

    getAllLanguage() {
        return Object.keys(LANGUAGES_MAPPING);
    }
}