customElements.define(
  "x-preview-codeblock",
  class extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' }).innerHTML = `
        <style>
        :host {
          display: flex;
          align-content: start;
          flex-wrap: wrap;
          background-image: radial-gradient(#00000020 1px, transparent 0);
          background-size: 10px 10px;
          background-position: -20px -20px;
          --padding: 1rem;
          border: 0.1rem solid var(--text);
          border-radius: 1rem;
          overflow: hidden;
          overflow-x: auto;
        }
          #html {
            width: 100%;
          }

        </style>
        <div id="html"></div>
      `;
    }

    connectedCallback() {
      // Get the code from the innerHTML and sanitize it
      const cssAttr = this.getAttribute("css")
      if (cssAttr) {
        let cssEl = document.querySelector(cssAttr)
        const myStyleSheet = new CSSStyleSheet();
        myStyleSheet.replace(cssEl.getCode());
        this.shadowRoot.adoptedStyleSheets = [
          myStyleSheet
        ]
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

    }

    render() {
        const thisHtmlEl = this.shadowRoot.querySelector('#html');
        console.log(thisHtmlEl)
        const htmlAttr = this.getAttribute("html")
        if (htmlAttr) {
          const htmlEl = document.querySelector(htmlAttr);
          thisHtmlEl.innerHTML = htmlEl.getCode()
        }
    }
  }
);
