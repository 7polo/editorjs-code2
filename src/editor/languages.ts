import { javascript } from '@codemirror/lang-javascript'
import { java } from '@codemirror/lang-java'
import { json } from '@codemirror/lang-json'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { python } from '@codemirror/lang-python'
import { vue } from '@codemirror/lang-vue'

const mapping = {
    'javascript': javascript(),
    'java': java(),
    'json': json(),
    'html': html(),
    'css': css(),
    'python': python(),
    'vue': vue(),
}

export default mapping;