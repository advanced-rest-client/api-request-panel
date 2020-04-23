/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { html, css, LitElement } from 'lit-element';
import { HeadersParserMixin } from '@advanced-rest-client/headers-parser-mixin/headers-parser-mixin.js';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/api-request-editor/api-request-editor.js';
import '@api-components/api-server-selector/api-server-selector.js';
import '@advanced-rest-client/response-view/response-view.js';

/** @typedef {import('lit-html').TemplateResult} TemplateResult */

/**
 * @customElement
 * @demo demo/index.html
 * @demo demo/navigation.html Automated navigation
 * @mixes AmfHelperMixin
 * @mixes EventsTargetMixin
 * @mixes HeadersParserMixin
 * @extends LitElement
 */
export class ApiRequestPanel extends AmfHelperMixin(EventsTargetMixin(HeadersParserMixin(LitElement))) {
  get styles() {
    return css`
    :host { display: block; }
    response-view {
      margin-top: var(--api-request-panel-response-margin-top, 48px);
    }
    `;
  }

  get _hasResponse() {
    return !!this.response || !!this.responseError;
  }

  static get properties() {
    return {
      /**
       * AMF HTTP method (operation in AMF vocabulary) ID.
       */
      selected: { type: String },
      /**
       * By default application hosting the element must set `selected`
       * property. When using `api-navigation` element
       * by setting this property the element listens for navigation events
       * and updates the state
       */
      handleNavigationEvents: { type: Boolean },
      /**
       * Hides the URL editor from the view.
       * The editor is still in the DOM and the `urlInvalid` property still will be set.
       */
      noUrlEditor: { type: Boolean },
      /**
       * When set it renders a label with the computed URL.
       * This intended to be used with `noUrlEditor` set to true.
       * This way it replaces the editor with a simple label.
       */
      urlLabel: { type: Boolean },
      /**
       * A base URI for the API. To be set if RAML spec is missing `baseUri`
       * declaration and this produces invalid URL input. This information
       * is passed to the URL editor that prefixes the URL with `baseUri` value
       * if passed URL is a relative URL.
       */
      baseUri: { type: String },
      /**
       * OAuth2 redirect URI.
       * This value **must** be set in order for OAuth 1/2 to work properly.
       */
      redirectUri: { type: String },
      /**
       * If set it will renders the view in the narrow layout.
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * Enables compatibility with Anypoint styling
       */
      compatibility: { type: Boolean, reflect: true },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * When set all controls are disabled in the form
       */
      disabled: { type: Boolean },
      /**
       * Created by the transport ARFC `request` object
       */
      request: { type: Object },
      /**
       * Created by the transport ARC `response` object.
       */
      response: { type: Object },

      /**
       * A flag indincating request error.
       */
      isErrorResponse: { type: Boolean },
      /**
       * True if the response is made by the Fetch / XHR api.
       */
      responseIsXhr: { type: Boolean },
      /**
       * An error object associated with the response when error.
       */
      responseError: { type: Object },
      /**
       * Response full loading time. This information is received from the
       * transport library.
       */
      loadingTime: { type: Number },
      /**
       * If the transport method is able to collect detailed information about request timings
       * then this value will be set. It's the `timings` property from the HAR 1.2 spec.
       */
      timing: { type: Object },
      /**
       * If the transport method is able to collect detailed information about redirects timings
       * then this value will be set. It's a list of `timings` property from the HAR 1.2 spec.
       */
      redirectsTiming: { type: Array },
      /**
       * It will be set if the transport method can generate information about redirections.
       */
      redirects: { type: Array },
      /**
       * Http message sent to the server.
       *
       * This information should be available only in case of advanced HTTP transport.
       */
      sourceMessage: { type: String },
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
      appendHeaders: { type: Array },
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
      proxy: { type: String },
      /**
       * If `proxy` is set, it will URL encode the request URL before appending it to the proxy URL.
       * `http://domain.com/path/?query=some+value` will become
       * `https://proxy.com/?url=http%3A%2F%2Fdomain.com%2Fpath%2F%3Fquery%3Dsome%2Bvalue`
       */
      proxyEncodeUrl: { type: Boolean },
      /**
       * Location of the `node_modules` folder.
       * It should be a path from server's root path including node_modules.
       */
      authPopupLocation: { type: String },
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
      lastRequestId: { type: String },
      /**
       * Prohibits rendering of the documentation (the icon and the
       * description).
       */
      noDocs: { type: Boolean },
      /**
       * If set it computes `hasOptional` property and shows checkbox in the
       * form to show / hide optional properties.
       */
      allowHideOptional: { type: Boolean },
      /**
       * If set, enable / disable param checkbox is rendered next to each
       * form item.
       */
      allowDisableParams: { type: Boolean },
      /**
       * When set, renders "add custom" item button.
       * If the element is to be used withouth AMF model this should always
       * be enabled. Otherwise users won't be able to add a parameter.
       */
      allowCustom: { type: Boolean },
      /**
       * API server definition from the AMF model.
       *
       * This value to be set when partial AMF mnodel for an endpoint is passed
       * instead of web api to be passed to the `api-url-data-model` element.
       *
       * Do not set with full AMF web API model.
       */
      server: { type: Object },
      /**
       * Supported protocl versions.
       *
       * E.g.
       *
       * ```json
       * ["http", "https"]
       * ```
       *
       * This value to be set when partial AMF mnodel for an endpoint is passed
       * instead of web api to be passed to the `api-url-data-model` element.
       *
       * Do not set with full AMF web API model.
       */
      protocols: { type: Array },
      /**
       * API version name.
       *
       * This value to be set when partial AMF mnodel for an endpoint is passed
       * instead of web api to be passed to the `api-url-data-model` element.
       *
       * Do not set with full AMF web API model.
       */
      version: { type: String },
      /**
       * Holds the value of the currently selected server
       * Data type: URI
       */
      selectedServerValue: { type: String },
      /**
       * Holds the type of the currently selected server
       * Values: `server` | `slot` | `custom`
       */
      selectedServerType: { type: String },
      /**
       * Optional property to set
       * If true, the server selector is not rendered
       */
      noServerSelector: { type: Boolean },
      /**
       * Optional property to set
       * If true, the server selector custom base URI option is rendered
       */
      allowCustomBaseUri: { type: Boolean },
      /**
       * Holds the value for whether there are enough servers
       * to show the server selector.
       * If there are not enough servers, then this value is set to true and server selector is hidden
       */
      serverSelectorHidden: { type: Boolean },
    };
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._selected = value;
    this.requestUpdate('selected', old);
    this._selectedChanged(value);
  }

  get handleNavigationEvents() {
    return this._handleNavigationEvents;
  }

  set handleNavigationEvents(value) {
    const old = this._handleNavigationEvents;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._handleNavigationEvents = value;
    this._handleNavChanged(value);
  }

  get authPopupLocation() {
    return this._authPopupLocation;
  }

  set authPopupLocation(value) {
    const old = this._authPopupLocation;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._authPopupLocation = value;
    this._updateRedirectUri(value);
  }

  get serversCount() {
    return this._serversCount;
  }

  set serversCount(value) {
    const old = this._serversCount;
    if (old === value) {
      return;
    }
    this._serversCount = value;
    this._updateServer();
    this._computeServerSelectorHidden();
    this.requestUpdate('serversCount', old);
  }

  get selectedServerValue() {
    return this._selectedServerValue;
  }

  set selectedServerValue(value) {
    const old = this._selectedServerValue;
    if (old === value) {
      return;
    }
    this._selectedServerValue = value;
    this._updateServer();
    this.requestUpdate('selectedServerValue', old);
  }

  get noServerSelector() {
    return this._noServerSelector;
  }

  set noServerSelector(value) {
    const old = this.noServerSelector;
    if (old === value) {
      return;
    }

    this._noServerSelector = value;
    this.requestUpdate('noServerSelector', old);
    this._computeServerSelectorHidden();
  }

  /**
   * This is the final computed value for the baseUri to propagate downwards
   * If baseUri is defined, return baseUri
   * Else, return the selectedServerValue if selectedServerType is not `server`
   */
  get effectiveBaseUri() {
    if (this.baseUri) {
      return this.baseUri;
    }
    if (this.selectedServerType !== 'server') {
      return this.selectedServerValue;
    }
    return '';
  }

  /**
   * @constructor
   */
  constructor() {
    super();
    this._apiResponseHandler = this._apiResponseHandler.bind(this);
    this._apiRequestHandler = this._apiRequestHandler.bind(this);
    this._navigationHandler = this._navigationHandler.bind(this);
    this._handleNavigationChange = this._handleNavigationChange.bind(this);

    this.responseIsXhr = true;
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    if (!this.redirectUri) {
      this._updateRedirectUri(this.authPopupLocation);
    }
  }

  _attachListeners() {
    window.addEventListener('api-response', this._apiResponseHandler);
    this.addEventListener('api-request', this._apiRequestHandler);
    this.addEventListener('api-navigation-selection-changed', this._handleNavigationChange);
  }

  _detachListeners() {
    window.removeEventListener('api-response', this._apiResponseHandler);
    this.removeEventListener('api-request', this._apiRequestHandler);
    this.removeEventListener('api-navigation-selection-changed', this._handleNavigationChange);
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
    const { type, selected } = e.detail;
    this.selected = type === 'method' ? selected : undefined;
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

  _handleNavigationChange(e) {
    const { selected, type, endpointId } = e.detail;
    const serverDefinitionAllowedTypes = ['endpoint', 'method'];
    if (serverDefinitionAllowedTypes.indexOf(type) === -1) {
      return;
    }
    this.updateServers({ id: selected, type, endpointId });
  }

  /**
   * Handler for the `serverscountchanged` dispatched from the server selector.
   * @param {CustomEvent} e
   */
  _handleServersCountChange(e) {
    const { value } = e.detail;
    this.serversCount = value;
  }

  /**
   * Handler for the `apiserverchanged` dispatched from the server selector.
   * @param {CustomEvent} e
   */
  _serverChangeHandler(e) {
    const { value, type } = e.detail;
    this.selectedServerType = value;
    this.selectedServerValue = type;
    if (!value && type === 'server') {
      // TODO (Pawel): This is a situation where endpoint changed and current
      // selection no longer exists. This element should pick a default
      // selection.
      // This probably gonna be done by the selector with `autoSelect` option
      // enabled
    }
  }

  /**
   * Computes a current server value for selection made in the server selector.
   */
  _updateServer() {
    const { selectedServerValue, selectedServerType } = this;
    if (selectedServerType !== 'server') {
      this.server = undefined;
    } else {
      this.server = this._findServerByValue(selectedServerValue);
    }
  }

  /**
   * @param {String} value Server's base URI
   * @return {Object|undefined} An element associated with the base URI or
   * undefined if not found.
   */
  _findServerByValue(value) {
    const { servers = [] } = this;
    return servers.find((server) => this._getServerUri(server) === value);
  }

  /**
   * @param {Object} server Server definition.
   * @return {String|undefined} Value for server's base URI
   */
  _getServerUri(server) {
    const key = this._getAmfKey(this.ns.aml.vocabularies.core.urlTemplate);
    return this._getValue(server, key);
  }

  _computeServerSelectorHidden() {
    const { serversCount = 0, noServerSelector } = this;
    this.serverSelectorHidden = serversCount < 2 || noServerSelector;
  }

  /**
   * Updates the list of servers for current operation so a server for current
   * selection can be computed.
   * @param {String} id AMF model's ID for currently selected node.
   * @param {String} type API Component's internal main selection value.
   * @param {String=} endpointId If available, current endpoint ID
   */
  updateServers({ id, type, endpointId } = {}) {
    let methodId;
    if (type === 'method') {
      methodId = id;
    }
    if (type === 'endpoint') {
      endpointId = id;
    }
    this.servers = this._getServers({ endpointId, methodId });
  }

  __amfChanged() {
    this.updateServers();
  }

  render() {
    return html`<style>${this.styles}</style>
    ${this._renderServerSelector()}
    ${this._requestTemplate()}
    ${this._responseTemplate()}
    `;
  }

  /**
   * @return {TemplateResult} A template for the request panel
   */
  _requestTemplate() {
    const {
      narrow,
      redirectUri,
      selected,
      amf,
      noUrlEditor,
      urlLabel,
      effectiveBaseUri,
      noDocs,
      eventsTarget,
      allowHideOptional,
      allowDisableParams,
      allowCustom,
      server,
      protocols,
      version,
      readOnly,
      disabled,
      compatibility,
      outlined,
    } = this;
    return html`<api-request-editor
      ?narrow="${narrow}"
      .redirectUri="${redirectUri}"
      .selected="${selected}"
      .amf="${amf}"
      ?noUrlEditor="${noUrlEditor}"
      ?urlLabel="${urlLabel}"
      .baseUri="${effectiveBaseUri}"
      ?noDocs="${noDocs}"
      .eventsTarget="${eventsTarget}"
      ?allowHideOptional="${allowHideOptional}"
      ?allowDisableParams="${allowDisableParams}"
      ?allowCustom="${allowCustom}"
      .server="${server}"
      .protocols="${protocols}"
      .version="${version}"
      ?readOnly="${readOnly}"
      ?disabled="${disabled}"
      ?outlined="${outlined}"
      ?compatibility="${compatibility}">
    </api-request-editor>`;
  }

  /**
   * @return {TemplateResult|string} A template for the response view
   */
  _responseTemplate() {
    const { _hasResponse } = this;
    if (!_hasResponse) {
      return '';
    }
    return html`<response-view
      .request="${this.request}"
      .response="${this.response}"
      .responseError="${this.responseError}"
      .isError="${this.isErrorResponse}"
      .isXhr="${this.responseIsXhr}"
      .loadingTime="${this.loadingTime}"
      .redirects="${this.redirects}"
      .redirectTimings="${this.redirectsTiming}"
      .responseTimings="${this.timing}"
      .sentHttpMessage="${this.sourceMessage}"
      .compatibility="${this.compatibility}"></response-view>`;
  }

  /**
   * @return {TemplateResult} A template for the server selector
   */
  _renderServerSelector() {
    const { amf, selectedServerType, selectedServerValue, allowCustomBaseUri, serverSelectorHidden } = this;
    return html`
    <api-server-selector
      ?hidden="${serverSelectorHidden}"
      ?allowCustom="${allowCustomBaseUri}"
      .amf="${amf}"
      .value="${selectedServerValue}"
      .type="${selectedServerType}"
      @serverscountchanged="${this._handleServersCountChange}"
      @apiserverchanged="${this._serverChangeHandler}"
    >
      <slot name="custom-base-uri" slot="custom-base-uri"></slot>
    </api-server-selector>`;
  }
}
