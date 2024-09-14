// @ts-ignore
import debounce from "lodash.debounce";
import {CLASS_NAME, CodeEditorContext, CodeToolData} from "../types";

import {EditorView, minimalSetup,} from "codemirror"
import {EditorState, Compartment} from '@codemirror/state';
import {lineNumbers, keymap} from '@codemirror/view';
import {indentWithTab} from "@codemirror/commands"
import {foldGutter} from '@codemirror/language';
import {IconCopy} from '@codexteam/icons';

// language support
import LANGUAGES_MAPPING from './languages'

// theme support
import * as themes from '@uiw/codemirror-themes-all';

// @ts-ignore
import Choices from "choices.js";
import "./choices.css";

const DEFAULT_THEME = 'okaidia'

export class Editor {

    private readonly data: CodeToolData;

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

    render(container: HTMLElement) {
        container.addEventListener('paste', (e: Event) => {
            e.stopPropagation();
            e.preventDefault();
        });

        let themeName = this.data.theme || this.context.config.defaultTheme;
        if (this.getAllThemes().indexOf(themeName) == -1) {
            themeName = this.context.config.defaultTheme || DEFAULT_THEME
        }

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
                this.themeComp.of(themes[themeName]),

                // @ts-ignore
                this.languageComp.of(LANGUAGES_MAPPING[this.data.language || this.context.config.defaultLanguage || 'java']),

                EditorView.updateListener.of((e) => {
                    if (e.docChanged) {
                        this.updateData({code: e.state.doc.toString()})
                    }
                })
            ],
            parent: container
        });

        if (!this.context.readOnly) {
            this.renderedSelector()
        }

        setTimeout(() => this.setReadOnly(this.context.readOnly), 0)
    }

    renderedSelector() {

        const wrapper = document.createElement("div");
        wrapper.dataset.mutationFree = 'true'
        wrapper.classList.add(`${CLASS_NAME}_picker-wrapper`);

        // copy button
        let copyBtn = document.createElement("span");
        copyBtn.innerHTML = IconCopy
        copyBtn.classList.add(`${CLASS_NAME}_copy-btn`);
        copyBtn.onclick = () => {
            this.copyCode()
        }

        const languageEl = document.createElement("select");
        languageEl.dataset.mutationFree = 'true'

        const themeEl = document.createElement("select");
        themeEl.dataset.mutationFree = 'true'
        wrapper.append(languageEl, themeEl, copyBtn)
        this.editor?.dom.appendChild(wrapper)

        // theme
        const themePicker = new Choices(themeEl, {
            itemSelectText: '',
            searchEnabled: false,
            // @ts-ignore
            classNames: {
                containerOuter: ['choices', `${CLASS_NAME}_theme-picker`]
            },
            choices: this.getAllThemes().map(it => {
                return {
                    label: it,
                    value: it,
                    selected: it === this.data.theme
                }
            })
        });
        themePicker.passedElement.element.addEventListener('change', (e) => {
            // @ts-ignore
            this.setTheme(e.target?.value)
        })

        // language
        const languagePicker = new Choices(languageEl, {
            itemSelectText: '',
            searchEnabled: false,
            // @ts-ignore
            classNames: {
                containerOuter: ['choices', `${CLASS_NAME}_language-picker`]
            },
            choices: this.getAllLanguage().map(it => {
                return {
                    label: it,
                    value: it,
                    selected: it === this.data.theme
                }
            })
        });
        languagePicker.passedElement.element.addEventListener('change', (e) => {
            // @ts-ignore
            this.setLanguage(e.target?.value)
        })
    }

    updateData(data: any) {
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

    setTheme(theme: string) {
        if (theme === this.data.theme) {
            return
        }
        this.editor?.dispatch({
            // @ts-ignore
            effects: this.themeComp.reconfigure(themes[theme])
        });
        this.updateData({theme})
    }

    setLanguage(language: string) {
        if (language === this.data.language) {
            return
        }
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

    copyCode() {
        if (navigator.clipboard && this?.data?.code) {
            navigator.clipboard.writeText(this?.data?.code).then(() => {
                this.context.api.notifier.show({message: 'cope success'})
            })
        }
    }
}