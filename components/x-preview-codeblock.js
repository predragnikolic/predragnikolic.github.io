let count = 1
customElements.define(
  "x-preview-codeblock",
  class extends HTMLElement {
    constructor() {
        super()
        this.uuid = `x-preview-codeblock-${count}`
        count++
    }

    connectedCallback() {
        this.innerHTML = `
        <style>
        :host {
          display: flex;
          align-content: start;
          flex-wrap: wrap;
        }
          #html {
          overflow: hidden;
          overflow-x: auto;
          border: 0.1rem solid var(--text);
          border-radius: 1rem;
          background-image: radial-gradient(#00000020 1px, transparent 0);
          background-size: 10px 10px;
          background-position: -20px -20px;
          width: 100%;
          height: 100%;
          }

        </style>
        <div id="html"></div>
      `;
      this.setAttribute("id", this.uuid)
      // Get the code from the innerHTML and sanitize it
      const cssAttr = this.getAttribute("css")
      if (cssAttr) {
        let cssEl = document.querySelector(cssAttr)
        const myStyleSheet = new CSSStyleSheet();
        myStyleSheet.replace(cssEl.getCode());
        document.adoptedStyleSheets.push(myStyleSheet)
        cssEl.addEventListener('change-code', (event) => {
          myStyleSheet.replace(event.detail.code);
        })
      }
      const htmlAttr = this.getAttribute("html")
      if (htmlAttr) {
        let htmlEl = document.querySelector(htmlAttr)
        htmlEl.addEventListener('change-code', (_event) => {
          this.render();
        })
      }

      this.render();

      const scriptAttr = this.getAttribute("script")
      if (scriptAttr) {
        let scriptEl = document.querySelector(scriptAttr)
        let newScriptEl = document.createElement('script')

        newScriptEl.textContent = scriptEl.getCode();
        this.appendChild(newScriptEl)
        scriptEl.addEventListener('change-code', (event) => {
          newScriptEl.textContent = event.detail.code
        })
      }
    }

    render() {
        const thisHtmlEl = this.querySelector('#html');
        const htmlAttr = this.getAttribute("html")
        if (htmlAttr) {
          const htmlEl = document.querySelector(htmlAttr);
          thisHtmlEl.innerHTML = htmlEl.getCode()
        }
    }
  }
);
