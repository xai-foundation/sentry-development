import{k as y,l as v,M as l,A as h,O as b,aU as C,E as x,x as k,_ as f,C as A,U as S,v as E,n as O,aV as m,R as _,o as u,m as L,aW as T}from"./index-45f04201.js";const N=y`
  :host {
    z-index: var(--w3m-z-index);
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: var(--wui-cover);
    transition: opacity 0.2s var(--wui-ease-out-power-2);
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
  }

  @keyframes zoom-in {
    0% {
      transform: scale(0.95) translateY(0);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes slide-in {
    0% {
      transform: scale(1) translateY(50px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  wui-card {
    max-width: var(--w3m-modal-width);
    width: 100%;
    position: relative;
    animation-duration: 0.2s;
    animation-name: zoom-in;
    animation-fill-mode: backwards;
    animation-timing-function: var(--wui-ease-out-power-2);
    outline: none;
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--wui-spacing-xxl) 0px;
    }
  }

  @media (max-width: 430px) {
    wui-flex {
      align-items: flex-end;
    }

    wui-card {
      max-width: 100%;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: none;
      animation-name: slide-in;
    }
  }
`;var d=globalThis&&globalThis.__decorate||function(w,e,t,o){var i=arguments.length,n=i<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")n=Reflect.decorate(w,e,t,o);else for(var r=w.length-1;r>=0;r--)(a=w[r])&&(n=(i<3?a(n):i>3?a(e,t,n):a(e,t))||n);return i>3&&n&&Object.defineProperty(e,t,n),n};const g="scroll-lock";let s=class extends v{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.open=l.state.open,this.caipAddress=h.state.caipAddress,this.isSiweEnabled=b.state.isSiweEnabled,this.connected=h.state.isConnected,this.loading=l.state.loading,this.initializeTheming(),C.prefetch(),this.unsubscribe.push(l.subscribeKey("open",e=>e?this.onOpen():this.onClose()),l.subscribeKey("loading",e=>{this.loading=e,this.onNewAddress(h.state.caipAddress)}),h.subscribeKey("isConnected",e=>this.connected=e),h.subscribeKey("caipAddress",e=>this.onNewAddress(e)),b.subscribeKey("isSiweEnabled",e=>this.isSiweEnabled=e)),x.sendEvent({type:"track",event:"MODAL_LOADED"})}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.open?k`
          <wui-flex @click=${this.onOverlayClick.bind(this)}>
            <wui-card role="alertdialog" aria-modal="true" tabindex="0">
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
              <w3m-snackbar></w3m-snackbar>
            </wui-card>
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}async onOverlayClick(e){e.target===e.currentTarget&&await this.handleClose()}async handleClose(){if(this.isSiweEnabled){const{SIWEController:e}=await f(()=>import("./index-5d16f36d.js"),["assets/index-5d16f36d.js","assets/index-45f04201.js","assets/index-a13362d3.css"]);e.state.status!=="success"&&this.connected&&await A.disconnect()}l.close()}initializeTheming(){const{themeVariables:e,themeMode:t}=T.state,o=S.getColorTheme(t);E(e,o)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),O.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement("style");e.dataset.w3m=g,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${g}"]`);e&&e.remove()}onAddKeyboardListener(){var t;this.abortController=new AbortController;const e=(t=this.shadowRoot)==null?void 0:t.querySelector("wui-card");e==null||e.focus(),window.addEventListener("keydown",o=>{if(o.key==="Escape")this.handleClose();else if(o.key==="Tab"){const{tagName:i}=o.target;i&&!i.includes("W3M-")&&!i.includes("WUI-")&&(e==null||e.focus())}},this.abortController)}onRemoveKeyboardListener(){var e;(e=this.abortController)==null||e.abort(),this.abortController=void 0}async onNewAddress(e){var a,r;if(!this.connected||this.loading)return;const t=m.getPlainAddress(this.caipAddress),o=m.getPlainAddress(e),i=m.getNetworkId(this.caipAddress),n=m.getNetworkId(e);if(this.caipAddress=e,this.isSiweEnabled){const{SIWEController:c}=await f(()=>import("./index-5d16f36d.js"),["assets/index-5d16f36d.js","assets/index-45f04201.js","assets/index-a13362d3.css"]),p=await c.getSession();if(p&&t&&o&&t!==o){(a=c.state._client)!=null&&a.options.signOutOnAccountChange&&(await c.signOut(),this.onSiweNavigation());return}if(p&&i&&n&&i!==n){(r=c.state._client)!=null&&r.options.signOutOnNetworkChange&&(await c.signOut(),this.onSiweNavigation());return}this.onSiweNavigation()}}onSiweNavigation(){this.open?_.push("ConnectingSiwe"):l.open({view:"ConnectingSiwe"})}};s.styles=N;d([u()],s.prototype,"open",void 0);d([u()],s.prototype,"caipAddress",void 0);d([u()],s.prototype,"isSiweEnabled",void 0);d([u()],s.prototype,"connected",void 0);d([u()],s.prototype,"loading",void 0);s=d([L("w3m-modal")],s);export{s as W3mModal};
