import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {IronScrollTargetBehavior} from '@polymer/iron-scroll-target-behavior/iron-scroll-target-behavior.js';
import {HeadersParserMixin} from '@advanced-rest-client/headers-parser-mixin/headers-parser-mixin.js';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@api-components/api-request-editor/api-request-editor.js';
import '@advanced-rest-client/response-view/response-view.js';
import '@api-components/raml-aware/raml-aware.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
/* eslint-disable max-len */
/**
 * Request editor and response view panels in a single element.
 *
 * This element is to replace `api-console-request` element from `mulesoft/api-console`
 * project repository.
 *
 * This is also a base case for any application that renders request and
 * response views.
 *
 * The element uses AMF model to render view based on API mnodel and current user
 * selection.
 *
 * It uses both `api-request-editor` and `response-view` elements and
 * listens to `api-request` and `api-response` events.
 * It also adds additional configuration options that exists in API console
 * (proxy, additional headers).
 *
 * ## `api-request` and `api-response` events
 *
 * See full documentation here:
 * https://github.com/advanced-rest-client/api-components-api/blob/master/docs/api-request-and-response.md
 *
 * ## Dependencies and changelog from included elements
 *
 * - XHR element is not included in the element. Use
 * `advanced-rest-client/xhr-simple-request` in your application or handle
 * `api-request` custom event to make a request.
 * - The element does not include any polyfills
 * - `redirectUrl` is now `redirectUri`
 * - `api-console-request` event is now `api-request` event
 * - `api-console-response` event is now `api-response` event
 * - Added more details to `api-request` custom event (comparing to
 * `api-console-request`)
 * - The user is able to enable/disable query parameters and headers. Set
 * `allow-disable-params` attribute to enable this behavior.
 * - The user is able to add custom query parameters or headers.
 * Set `allow-custom` attribute to enable this behavior.
 * - From authorization panel changes:
 *  - `auth-settings-changed` custom event is stopped from bubbling.
 *  Listen for `authorization-settings-changed` event instead.
 * - From auth-method-oauth2 changes:
 *  - Added `deliveryMethod` and `deliveryName` properties to the
 *  `detail.setting` object.
 * - Crypto library is no longer included into the element. Use
 *  `advanced-rest-client/cryptojs-lib` component to include the library
 *  if your project doesn't use crypto libraries already.
 *
 * ## Narrow view
 *
 * Generally the API components are flexible and mobile friendly. However,
 * it is possible to set `narrow` property to render form elements in
 * a mobile fieldly view. In most cases it means that forms controls are
 * rendered in different layout.
 *
 * ## api-navigation integration
 *
 * The element works with `api-navigation` element. Set `handle-navigation-events`
 * attribute when using `api-navigation` so the component will automatically
 * update selection when internal API navigation occurres.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @demo demo/navigation.html Automated navigation
 * @appliesMixin HeadersParserMixin
 * @polymerBehavior Polymer.IronScrollTargetBehavior
 * @appliesMixin EventsTargetMixin
 * @memberof ApiElements
 */
class ApiRequestPanel extends mixinBehaviors(
  [IronScrollTargetBehavior],
  EventsTargetMixin(HeadersParserMixin(PolymerElement))) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --api-request-panel;
    }

    response-view {
      margin-top: var(--api-request-panel-response-margin-top, 12px);
    }
    </style>
    <api-request-editor narrow="{{narrow}}" redirect-uri="[[redirectUri]]" selected="[[selected]]" amf-model="[[amfModel]]" no-url-editor="[[noUrlEditor]]" base-uri="[[baseUri]]" url="{{editorRequest.url}}" http-method="{{editorRequest.method}}" headers="{{editorRequest.headers}}" payload="{{editorRequest.payload}}" query-model="{{editorRequest.queryModel}}" path-model="{{editorRequest.pathModel}}" no-docs="[[noDocs]]" events-target="[[eventsTarget]]" allow-hide-optional="[[allowHideOptional]]" allow-disable-params="[[allowDisableParams]]" allow-custom="[[allowCustom]]"></api-request-editor>
    <template is="dom-if" if="[[hasResponse]]">
      <response-view request="[[request]]" response="[[response]]" response-error="[[responseError]]" is-error="[[isErrorResponse]]" is-xhr="[[responseIsXhr]]" loading-time="{{loadingTime}}" redirects="[[redirects]]" redirect-timings="[[redirectsTiming]]" response-timings="[[timing]]" sent-http-message="[[sourceMessage]]"></response-view>
    </template>
    <template is="dom-if" if="[[aware]]">
      <raml-aware raml="{{amfModel}}" scope="[[aware]]"></raml-aware>
    </template>
`;
  }

  static get is() {
    return 'api-request-panel';
  }
  static get properties() {
    return {
      /**
       * `raml-aware` scope property to use.
       */
      aware: String,
      /**
       * AMF HTTP method (operation in AMF vocabulary) ID.
       */
      selected: {
        type: String,
        observer: '_selectedChanged'
      },
      /**
       * By default application hosting the element must set `selected`
       * property. When using `api-navigation` element
       * by setting this property the element listens for navigation events
       * and updates the state
       */
      handleNavigationEvents: {
        type: Boolean,
        observer: '_handleNavChanged'
      },
      /**
       * A model's `@id` of selected documentation part.
       * Special case is for `summary` view. It's not part of an API
       * but most applications has some kind of summary view for the
       * API.
       */
      amfModel: Object,
      /**
       * Hides the URL editor from the view.
       * The editor is still in the DOM and the `urlInvalid` property still will be set.
       */
      noUrlEditor: Boolean,
      /**
       * A base URI for the API. To be set if RAML spec is missing `baseUri`
       * declaration and this produces invalid URL input. This information
       * is passed to the URL editor that prefixes the URL with `baseUri` value
       * if passed URL is a relative URL.
       */
      baseUri: String,
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       */
      redirectUri: String,
      /**
       * If set it will renders the view in the narrow layout.
       */
      narrow: {
        type: Boolean,
        notify: true,
        reflectToAttribute: true
      },
      /**
       * A request object that is generated from request edtor properties.
       * It contains the following properties:
       * - url
       * - method
       * - headers
       * - payload
       * - queryModel
       * - pathModel
       */
      editorRequest: {
        type: Object,
        notify: true,
        value: function() {
          return {};
        }
      },
      /**
       * Created by the transport ARFC `request` object
       */
      request: Object,
      /**
       * Created by the transport ARC `response` object.
       */
      response: Object,
      /**
       * Computed value, true, when the response object is set.
       */
      hasResponse: {
        type: Boolean,
        computed: '_computeHasResponse(response, responseError)'
      },
      /**
       * A flag indincating request error.
       */
      isErrorResponse: Boolean,
      /**
       * True if the response is made by the Fetch / XHR api.
       */
      responseIsXhr: {
        type: Boolean,
        value: true
      },
      /**
       * An error object associated with the response when error.
       */
      responseError: Object,
      /**
       * Response full loading time. This information is received from the
       * transport library.
       */
      loadingTime: Number,
      /**
       * If the transport method is able to collect detailed information about request timings
       * then this value will be set. It's the `timings` property from the HAR 1.2 spec.
       */
      timing: Object,
      /**
       * If the transport method is able to collect detailed information about redirects timings
       * then this value will be set. It's a list of `timings` property from the HAR 1.2 spec.
       */
      redirectsTiming: Array,
      /**
       * It will be set if the transport method can generate information about redirections.
       */
      redirects: Array,
      /**
       * Http message sent to the server.
       *
       * This information should be available only in case of advanced HTTP transport.
       */
      sourceMessage: String,
      // Main scroll target for the app.
      scrollTarget: HTMLElement,
      /**
       * Forces the console to send headers defined in this string overriding any used defined
       * header.
       * This should be an array of headers with `name` and `value` keys, e.g.:
       * ```
       * [{
       *   name: "x-token",
       *   value: "value"
       * }]
       * ```
       */
      appendHeaders: Array,
      /**
       * If set every request made from the console will be proxied by the service provided in this
       * value.
       * It will prefix entered URL with the proxy value. so the call to
       * `http://domain.com/path/?query=some+value` will become
       * `https://proxy.com/path/http://domain.com/path/?query=some+value`
       *
       * If the proxy require a to pass the URL as a query parameter define value as follows:
       * `https://proxy.com/path/?url=`. In this case be sure to set `proxy-encode-url`
       * attribute.
       */
      proxy: String,
      /**
       * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
       * `http://domain.com/path/?query=some+value` will become
       * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
       */
      proxyEncodeUrl: Boolean,
      /**
       * Location of the `node_modules` folder.
       * It should be a path from server's root path including node_modules.
       */
      authPopupLocation: {
        type: String,
        observer: '_updateRedirectUri'
      },
      /**
       * ID of latest request.
       * It is received from the `api-request-editor` when `api-request`
       * event is dispatched. When `api-response` event is handled
       * the id is compared and if match it dispays the result.
       *
       * This system allows to use different request panels on single app
       * and don't mix the results.
       *
       * @type {String|Number}
       */
      lastRequestId: String,
      /**
       * Prohibits rendering of the documentation (the icon and the
       * description).
       */
      noDocs: Boolean,
      /**
       * If set it computes `hasOptional` property and shows checkbox in the
       * form to show / hide optional properties.
       */
      allowHideOptional: Boolean,
      /**
       * If set, enable / disable param checkbox is rendered next to each
       * form item.
       */
      allowDisableParams: Boolean,
      /**
       * When set, renders "add custom" item button.
       * If the element is to be used withouth AMF model this should always
       * be enabled. Otherwise users won't be able to add a parameter.
       */
      allowCustom: Boolean
    };
  }

  static get observers() {
    return [
      '_editorRequestChanged(editorRequest.*)'
    ];
  }

  /**
   * @constructor
   */
  constructor() {
    super();
    this._apiResponseHandler = this._apiResponseHandler.bind(this);
    this._apiRequestHandler = this._apiRequestHandler.bind(this);
    this._navigationHandler = this._navigationHandler.bind(this);
  }

  ready() {
    super.ready();
    if (!this.redirectUri) {
      this._updateRedirectUri(this.authPopupLocation);
    }
  }

  _attachListeners() {
    window.addEventListener('api-response', this._apiResponseHandler);
    this.addEventListener('api-request', this._apiRequestHandler);
  }

  _detachListeners() {
    window.removeEventListener('api-response', this._apiResponseHandler);
    this.removeEventListener('api-request', this._apiRequestHandler);
    if (this.__navEventsRegistered) {
      this._unregisterNavigationEvents();
    }
  }
  /**
   * Registers `api-navigation-selection-changed` event listener handler
   * on window object.
   */
  _registerNavigationEvents() {
    this.__navEventsRegistered = true;
    window.addEventListener('api-navigation-selection-changed', this._navigationHandler);
  }
  /**
   * Removes event listener from window object for
   * `api-navigation-selection-changed` event.
   */
  _unregisterNavigationEvents() {
    this.__navEventsRegistered = false;
    window.removeEventListener('api-navigation-selection-changed', this._navigationHandler);
  }
  /**
   * Registers / unregisters event listeners depending on `state`
   *
   * @param {Boolean} state
   */
  _handleNavChanged(state) {
    if (state) {
      this._registerNavigationEvents();
    } else {
      this._unregisterNavigationEvents();
    }
  }
  /**
   * Handler for `api-navigation-selection-changed` event.
   *
   * @param {CustomEvent} e
   */
  _navigationHandler(e) {
    let id = e.detail.selected;
    if (e.detail.type !== 'method') {
      id = undefined;
    }
    this.selected = id;
  }
  /**
   * Sets OAuth 2 redirect URL for the authorization panel
   *
   * @param {?String} location Bower components location
   */
  _updateRedirectUri(location) {
    const a = document.createElement('a');
    if (!location) {
      location = 'node_modules/';
    }
    if (location && location[location.length - 1] !== '/') {
      location += '/';
    }
    a.href = location + '@advanced-rest-client/oauth-authorization/oauth-popup.html';
    this.redirectUri = a.href;
  }
  /**
   * Computes if there is a reponse object.
   *
   * @param {Object} response ARC response objects
   * @param {Boolean} responseError
   * @return {Boolean}
   */
  _computeHasResponse(response, responseError) {
    return !!response || !!responseError;
  }
  /**
   * A handler for the API call.
   * This handler will only check if there is authorization required
   * and if the user is authorizaed.
   *
   * @param {CustomEvent} e `api-request` event
   */
  _apiRequestHandler(e) {
    this.lastRequestId = e.detail.id;
    this._appendConsoleHeaders(e);
    this._appendProxy(e);
  }

  /**
   * Appends headers defined in the `appendHeaders` array.
   * @param {CustomEvent} e The `api-request` event.
   */
  _appendConsoleHeaders(e) {
    const headersToAdd = this.appendHeaders;
    if (!headersToAdd) {
      return;
    }
    let eventHeaders = e.detail.headers || '';
    for (let i = 0, len = headersToAdd.length; i < len; i++) {
      const header = headersToAdd[i];
      eventHeaders = this.replaceHeaderValue(eventHeaders, header.name, header.value);
    }
    e.detail.headers = eventHeaders;
  }
  /**
   * Sets the proxy URL if the `proxy` property is set.
   * @param {CustomEvent} e The `api-request` event.
   */
  _appendProxy(e) {
    const proxy = this.proxy;
    if (!proxy) {
      return;
    }
    let url = this.proxyEncodeUrl ? encodeURIComponent(e.detail.url) : e.detail.url;
    url = proxy + url;
    e.detail.url = url;
  }
  /**
   * Handler for the `api-response` custom event. Sets values on the response
   * panel when response is ready.
   *
   * @param {CustomEvent} e
   */
  _apiResponseHandler(e) {
    if (this.lastRequestId !== e.detail.id) {
      return;
    }
    this._propagateResponse(e.detail);
    setTimeout(() => {
      const panel = this.shadowRoot.querySelector('response-view');
      const position = panel.offsetTop;
      this.scroll(0, position);
    }, 1);
  }
  /**
   * Propagate `api-response` detail object.
   *
   * @param {Object} data Event's detail object
   */
  _propagateResponse(data) {
    this.isErrorResponse = data.isError;
    this.responseError = data.isError ? data.error : undefined;
    this.loadingTime = data.loadingTime;
    this.request = data.request;
    this.response = data.response;
    const isXhr = data.isXhr === false ? false : true;
    this.responseIsXhr = isXhr;
    this.redirects = isXhr ? undefined : data.redirects;
    this.redirectsTiming = isXhr ? undefined : data.redirectsTiming;
    this.timing = isXhr ? undefined : data.timing;
    this.sourceMessage = data.sentHttpMessage;
  }
  /**
   * Clears response panel when selected id changed.
   * @param {String} id
   */
  _selectedChanged(id) {
    if (!id) {
      return;
    }
    this.clearResponse();
  }
  /**
   * Clears response panel.
   */
  clearResponse() {
    this.isErrorResponse = undefined;
    this.responseError = undefined;
    if (this.loadingTime) {
      this.loadingTime = undefined;
    }
    if (this.request) {
      this.request = undefined;
    }
    if (this.response) {
      this.response = undefined;
    }
    if (this.responseIsXhr !== undefined) {
      this.responseIsXhr = undefined;
    }
    if (this.redirects) {
      this.redirects = undefined;
    }
    if (this.redirectsTiming) {
      this.redirectsTiming = undefined;
    }
    if (this.timing) {
      this.timing = undefined;
    }
    if (this.sourceMessage) {
      this.sourceMessage = undefined;
    }
  }
  /**
   * Dispatches `api-request-data-changed` custom event when any of the
   * request data changes.
   * @param {Object} record
   */
  _editorRequestChanged(record) {
    this.dispatchEvent(new CustomEvent('api-request-data-changed', {
      bubbles: true,
      composed: true,
      detail: record.base
    }));
  }
  /**
   * Dispatched when `editorRequest` change.
   * Contains all basic request data:
   * @event api-request-data-changed
   * @param {String} url
   * @param {String} method
   * @param {String} headers
   * @param {String} payload
   * @param {Array<Object>} queryModel
   * @param {Array<Object>} pathModel
   */
}

window.customElements.define(ApiRequestPanel.is, ApiRequestPanel);
