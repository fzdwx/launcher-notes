import MarkdownIt from "markdown-it";

export const attach = (m: MarkdownIt) => {
    hackLink(m)
}

const hackLink = (m: MarkdownIt) => {
    m.renderer.rules["link_open"] = function (tokens, idx, options, env, self) {
        const token = tokens[idx]
        const href = token.attrGet("href")
        return `<div class="a" onclick="shell.openUrl('${href}')">`
    }
    m.renderer.rules["link_close"] = function (tokens, idx, options, env, self) {
        return '</div>'
    }
}
