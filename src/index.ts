/**
 * Import styles library
 */
import './index.css';

/**
 * Import icons
 */
import { IconBrackets} from '@codexteam/icons';

/**
 * Import types
 */
import {CodeToolData, CodeToolConfig, CLASS_NAME} from './types';
import { API, BlockAPI, BlockTool } from '@editorjs/editorjs';
import {Editor} from "./editor";

/**
 * CodeTool Tool for Editor.js
 */
export default class CodeTool implements BlockTool {
  /**
   * Code API — public methods to work with Editor
   *
   * @link https://editorjs.io/api
   */
   private readonly api: API;

  /**
   * Block API — methods and properties to work with Block instance
   *
   * @link https://editorjs.io/blockapi
   */
  private readonly block: BlockAPI;

  /**
   * Read-only mode flag
   */
  private readonly readOnly: boolean;

  /**
   * Tool data for input and output
   */
  private data: CodeToolData;

  /**
   * Configuration object that passed through the initial Editor configuration.
   */
  private config: CodeToolConfig;

  /**
   * Tool's HTML nodes
   */
  private nodes: {[key: string]: HTMLElement|null};

  /**
   * instance of code editor
   * @private
   */
  private editor: Editor|null = null;

  /**
   * Class constructor
   *
   * @link https://editorjs.io/tools-api#class-constructor
   */
  constructor({ data, config, api, block, readOnly }: { data: CodeToolData, config: CodeToolConfig, api: API, block: BlockAPI, readOnly: boolean }) {
    this.data = data;

    this.config = Object.assign({
      defaultTheme: 'okaidia',
      defaultLanguage: 'java'
    }, config);

    this.api = api;
    this.block = block;
    this.readOnly = readOnly;

    /**
     * Declare Tool's nodes
     */
    this.nodes = {
      wrapper: null,
    };

    this.editor = new Editor({
      api: this.api,
      config: this.config,
      data: this.data,
      block: this.block,
      readOnly: this.readOnly,
    });
  }

  /**
   * PUBLIC METHODS
   *
   * @link https://editorjs.io/tools-api#public-methods
   */

  /**
   * Creates UI of a Block
   * Required
   * @link https://editorjs.io/tools-api#render
   *
   * @returns {HTMLElement}
   */
  render() {
    this.nodes.wrapper = document.createElement('div');
    this.nodes.wrapper.classList.add(CLASS_NAME)
    this.nodes.wrapper.classList.add(this.api.styles.block);
    this.editor?.render(this.nodes.wrapper)

    if (!this.readOnly) {
      // detect keydown on the last item to escape List
      this.nodes.wrapper.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'Backspace':
            event.stopPropagation();
            break;
          case 'Tab':
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      }, false);
    }
    return this.nodes.wrapper;
  }

  /**
   * Extracts Block data from the UI
   * Required
   * @link https://editorjs.io/tools-api#save
   *
   * @returns {CodeToolData} saved data
   */
  save(): CodeToolData {
    return this.editor?.getData() || {};
  }

  /**
   * Validates Block data after saving
   * @link https://editorjs.io/tools-api#validate
   *
   * @param {CodeToolData} savedData
   * @returns {boolean} true if data is valid, otherwise false
   */
  // validate() {}

  /**
   *
   * Returns HTML that will be appended at the top of Block-settings
   * @link https://editorjs.io/tools-api#render-settings
   *
   * @returns {HTMLElement}
   */
  // renderSettings() {}

  /**
   * Clear Tools stuff: cache, variables, events.
   * Called when Editor instance is destroying.
   * @link https://editorjs.io/tools-api#destroy
   *
   * @returns {void}
   */
  // destroy() {}

  /**
   * Handle content pasted by ways that described by pasteConfig static getter
   * @link https://editorjs.io/tools-api#on-paste
   *
   * @param {PasteEvent} event - event with pasted content
   * @returns {void}
   */
  // onPaste() {}

  /**
   * Specifies how to merge two similar Blocks
   * @link https://editorjs.io/tools-api#merge
   *
   * @param {CodeToolData} data - data of second Block
   * @returns {CodeToolData} - merged data
   */
  // merge() {}

  /**
   * STATIC GETTERS
   *
   * @link https://editorjs.io/tools-api#static-getters
   */

  /**
   * Clean unwanted HTML tags or attributes
   * @link https://editorjs.io/tools-api#sanitize
   *
   * @returns {{[string]: boolean|object}} - Sanitizer rules
   */
  // static get sanitize() {
  //   return {};
  // }

  /**
   * Describe an icon and title here
   * Required if Tools should be added to the Toolbox
   * @link https://editorjs.io/tools-api#toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      title: 'Code',
      icon: IconBrackets,
    };
  }

  /**
   * Shortcut that fires render method and inserts new Block
   * @link https://editorjs.io/tools-api#shortcut
   *
   * @returns {string}
   */
  // static get shortcut() {
  //   // return 'CMD+SHIFT+I';
  // }


  /**
   * With this option, Editor.js won't handle Enter keydowns
   * @link https://editorjs.io/tools-api#enablelinebreaks
   *
   * @returns {boolean}
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * This flag tells core that current tool supports the read-only mode
   * @link https://editorjs.io/tools-api#isreadonlysupported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * LIFE CYCLE HOOKS
   *
   * These methods are called by Editor.js core
   * @link https://editorjs.io/tools-api#lifecycle-hooks
   */

  /**
   * Called each time Block contents is updated
   */
  // updated() {}

  /**
   * Called after Block contents is removed from the page but before Block instance deleted
   */
  // removed() {}

  /**
   * Called after Block is moved by move tunes or through API
   *
   * @param {MoveEvent} event
   */
  // moved(event) {}
};