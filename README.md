[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-request-panel.svg)](https://www.npmjs.com/package/@api-components/api-request-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-request-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/api-request-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/api-request-panel)

## &lt;api-request-panel&gt;

An complete request editor and response view panels in a single element.

**See breaking changes and list of required dependencies at the bottom of this document**


```html
<api-request-panel></api-request-panel>
```

### Working with AMF partial model

Only endpoint model with selection set to a method node that is already in the model make sense.
Because the model don't have server, protocols, and version definition it has to be computed and set manually.

```javascript
const elm = document.querySelector('api-request-panel');
const summaryModel = await downloadPartialApiModelSummary();
const endpointModel = await downloadPartialApiModelEndpoint();
elm.amfModel = endpointModel; // This must be set before any computation, it contains `@context` property.
elm.selected = '#123'; // Selected node ID, must be method ID that is in endpoint definition.
elm.server = elm._computeServer(summaryModel); // This is element's inherited method
elm.version = conputeApiVersion(summaryModel); // Compute version from `server` model.
elm.protocols = ['http', 'https']; // This is encoded in AMF model.
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @api-components/api-request-panel
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-request-panel/api-request-panel.js';
    </script>
  </head>
  <body>
    <api-request-panel></api-request-panel>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-request-panel/api-request-panel.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <api-request-panel></api-request-panel>
    `;
  }

  _authChanged(e) {
    console.log(e.detail);
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/api-request-panel
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```


## Breaking Changes in v3

The `bower-location` attribute becomes `auth-popup-location`. It is a path to `node_modules` directory. It can be both relative or absolute location. For example `/static/console/node_modules` will produce OAuth Redirect URI `/static/console/node_modules/@advanced-rest-client/oauth-authorization/oauth-popup.html`.

Due to completely different dependencies import algorithm the CodeMirror and it's dependencies has to
be included to the web application manually, outside the component.

Web Compoennts are ES6 modules and libraries like CodeMirror are not adjusted to
new spec. Therefore importing the library inside the component won't make it work
(no reference is created).

All the dependencies described below are installed with the package.

**Code Mirror support**

CodeMirror + JSON linter (body editor) + headers hints and syntax (headers editor) + basic syntax (body editor).

```html
<script src="../../../jsonlint/lib/jsonlint.js"></script>
<script src="../../../codemirror/lib/codemirror.js"></script>
<script src="../../../codemirror/addon/mode/loadmode.js"></script>
<script src="../../../codemirror/mode/meta.js"></script>
<script src="../../../codemirror/mode/javascript/javascript.js"></script>
<script src="../../../codemirror/mode/xml/xml.js"></script>
<script src="../../../codemirror/mode/htmlmixed/htmlmixed.js"></script>
<script src="../../../codemirror/addon/lint/lint.js"></script>
<script src="../../../codemirror/addon/lint/json-lint.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/headers-addon.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/show-hint.js"></script>
<script src="../../../@advanced-rest-client/code-mirror-hint/hint-http-headers.js"></script>
```

CodeMirror's modes location. May be skipped if all possible modes are already included into the app.

```html
<script>
/* global CodeMirror */
CodeMirror.modeURL = '../../../codemirror/mode/%N/%N.js';
</script>
```

**Dependencies for OAuth1 and Digest authorization methods.**

```html
<script src="../../../cryptojslib/components/core.js"></script>
<script src="../../../cryptojslib/rollups/sha1.js"></script>
<script src="../../../cryptojslib/components/enc-base64-min.js"></script>
<script src="../../../cryptojslib/rollups/md5.js"></script>
<script src="../../../cryptojslib/rollups/hmac-sha1.js"></script>
<script src="../../../jsrsasign/lib/jsrsasign-rsa-min.js"></script>
```
