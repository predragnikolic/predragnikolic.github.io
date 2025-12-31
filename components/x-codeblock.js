customElements.define(
  "x-codeblock",
  class extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <style>
        :host {
          position: relative;
          font-size: 0.9rem;
          display: flex;
          align-content: start;
          flex-wrap: wrap;
          white-space: pre;
          font-family: "Jura";
          background: #000000;
          color: #fff;
          --padding: 1rem;
          border-radius: 1rem;
          overflow-x: auto;
          max-height: 300px;

          --syntax-keyword: #fcb6b6;
          --syntax-string: #fcd49e;
          --syntax-number: #b4b0e4;
          --syntax-operator: #ffffff80;
          --syntax-function: #7EAFD9;
          --syntax-comment: #ffffff50;
        }

        textarea {
          box-sizing: border-box;
          outline: none;
          background: transparent;
          color: transparent;
          top: 0;
          left: 0;
          position: absolute;
          caret-color: #fff;
          resize:none;
        }

        #highlighed-code, textarea {
          min-height: 1.6rem;
          max-width: 100%;
          font-size: 0.9rem;
          tab-size : 4;
          width: 100%;
          height: 100%;
          border: 0;
          padding:var(--padding);
          line-height: inherit;
          overflow: hidden;
          white-space: pre;
          word-break: break-word;
        }

        .syntax-keyword {
          color: var(--syntax-keyword);
        }

        .syntax-string {
          color: var(--syntax-string);
        }

        .syntax-number {
          color: var(--syntax-number);
        }

        .syntax-function {
          color: var(--syntax-function);
        }

        .syntax-operator {
          color: var(--syntax-operator);
        }

        .syntax-comment {
          color: var(--syntax-comment);
        }
        section:has(.file-name:empty) {
          display: none;
        }
        .file-name {
          min-width: 80px;
          text-align: center;
          display: inline-block;
          color: #fff;
          padding-top: var(--padding);
          padding-left: var(--padding);
          padding-right: var(--padding);
          padding-bottom: calc(var(--padding) / 2);
          border-bottom: 1px solid #fff;
          border-image-slice: 1;
          border-image-source: linear-gradient(to left, #000, #ffffff90, #000);

        }
        </style>
        <section style="width: 100%; position: sticky; top: 0; background: #000000; z-index:1; left:0;"><div class="file-name">Filename.css</div></section>
        <div style="position: relative; display: flex">
          <textarea></textarea>
          <code id="highlighed-code"></code>
        </div>
      `;
      this.code = ''
    }
    connectedCallback() {
      // Get the code from the innerHTML and sanitize it
      const textarea = this.shadowRoot.querySelector('textarea');
      this.render(this.getAttribute("code") ?? '');
      this.code = this.getAttribute("code")
      textarea.oninput = (e) => {
        this.code = e.target.value;
        this.render(e.target.value)
      }
      textarea.onkeydown = function(e){
          if(e.keyCode==9 || e.which==9){
              e.preventDefault();
              var s = this.selectionStart;
              this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
              this.selectionEnd = s+1;
          }
      }
    }

    render(code) {
        this.dispatchEvent(new CustomEvent('change-code', {
          bubbles: true,
          cancelable: true,
          detail: {
            code: this.code
          }
        }))
        const textarea = this.shadowRoot.querySelector('textarea');
        textarea.textContent = code;
        const codeElement = this.shadowRoot.querySelector('#highlighed-code');
        codeElement.innerHTML = this.highlightJS(code);
        const fileNameEl = this.shadowRoot.querySelector('.file-name');
        fileNameEl.innerHTML = this.getAttribute("filename") ?? '';
    }

    getCode() {
      return this.code
    }

    highlightJS(code) {
      const keywords = new Set([
        'new', 'function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do',
        'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally',
        'throw', 'typeof', 'instanceof', 'in', 'of', 'class', 'extends', 'super',
        'static', 'import', 'export', 'from', 'default', 'async', 'await', 'yield',
        'delete', 'void', 'this', 'null', 'undefined', 'true', 'false'
      ]);

      const operators = new Set([
        '+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '~', '?', ':',
        ';', ',', '.', '(', ')', '[', ']', '{', '}'
      ]);

      function tokenize(code) {
        const tokens = [];
        let i = 0;

        while (i < code.length) {
          const char = code[i];
          let twoChars = code[i] + (code[i+1] ?? '');
          let threeChars = code[i] + (code[i+1] ?? '') + (code[i+2] ?? '');

          if (/\s/.test(char)) {
            let whitespace = '';
            while (i < code.length && /\s/.test(code[i])) {
              whitespace += code[i];
              i++;
            }
            tokens.push({ type: 'whitespace', value: whitespace });
            continue;
          }

          if (twoChars === '//') {
            let comment = twoChars;
            i+=2;
            while (i < code.length && code[i] !== '\n') {
              twoChars = code[i] + (code[i+1] ?? '')
              comment += code[i];
              i += 1;
            }
            tokens.push({ type: 'comment', value: comment });
            continue;
          }

          if (twoChars === '/*') {
            let comment = twoChars;
            i+=2;
            while (i < code.length && twoChars !== '*/') {
              twoChars = code[i] + (code[i+1] ?? '')
              comment += code[i];
              i += 1;
            }
            if (i < code.length) {
              comment += code[i];
              i++;
            }
            tokens.push({ type: 'comment', value: comment });
            continue;
          }

          if (threeChars === '<--') {
            let comment = threeChars;
            i+=3;
            while (i < code.length && threeChars !== '-->') {
              threeChars = code[i] + (code[i+1] ?? '') + (code[i+2] ?? '')
              comment += code[i];
              i += 1;
            }
            if (i < code.length) {
              comment += code[i] + code[i+1];
              i+=2;
            }
            tokens.push({ type: 'comment', value: comment });
            continue;
          }

          if (char === '"' || char === "'") {
            const quote = char;
            let string = char;
            i++;

            while (i < code.length && code[i] !== quote) {
              if (code[i] === '\\' && i + 1 < code.length) {
                string += code[i] + code[i + 1];
                i += 2;
              } else {
                string += code[i];
                i++;
              }
            }

            if (i < code.length) {
              string += code[i];
              i++;
            }

            tokens.push({ type: 'string', value: string });
            continue;
          }

          if (/\d/.test(char)) {
            let number = '';
            while (i < code.length && /[\d.]/.test(code[i])) {
              number += code[i];
              i++;
            }
            tokens.push({ type: 'number', value: number });
            continue;
          }

          if (/[a-zA-Z_$]/.test(char)) {
            let identifier = '';
            while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
              identifier += code[i];
              i++;
            }

            const builtinConstructors = new Set(['Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'Math', 'JSON']);

            let j = i;
            while (j < code.length && /\s/.test(code[j])) j++;

            if (keywords.has(identifier)) {
              tokens.push({ type: 'keyword', value: identifier });
            } else if (builtinConstructors.has(identifier)) {
              tokens.push({ type: 'function', value: identifier });
            } else if (j < code.length && code[j] === '(') {
              tokens.push({ type: 'function', value: identifier });
            } else {
              tokens.push({ type: 'identifier', value: identifier });
            }
            continue;
          }

          if (operators.has(char)) {
            tokens.push({ type: 'operator', value: char });
            i++;
            continue;
          }

          tokens.push({ type: 'other', value: char });
          i++;
        }

        return tokens;
      }

      function tokensToHtml(tokens) {
        return tokens.map(token => {
          switch (token.type) {
            case 'keyword':
              return `<span class="syntax-keyword">${token.value}</span>`;
            case 'string':
              return `<span class="syntax-string">${token.value}</span>`;
            case 'number':
              return `<span class="syntax-number">${token.value}</span>`;
            case 'function':
              return `<span class="syntax-function">${token.value}</span>`;
            case 'comment':
              return `<span class="syntax-comment">${token.value}</span>`;
            case 'operator':
              return `<span class="syntax-operator">${token.value}</span>`;
            default:
              return token.value;
          }
        }).join('');
      }

      const tokens = tokenize(code);
      return tokensToHtml(tokens);
    }
  },
);
