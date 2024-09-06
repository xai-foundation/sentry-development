import{$ as y,a0 as k,a3 as a,N as w,Z as f,bp as C,a4 as S,a1 as x,R as p,_ as g,ad as A,aa as E,a6 as _,bq as m,a7 as c,a2 as O,br as L}from"./index-23e389d1.js";const T=y`
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

  wui-card {
    max-width: var(--w3m-modal-width);
    width: 100%;
    position: relative;
    animation: zoom-in 0.2s var(--wui-ease-out-power-2);
    animation-fill-mode: backwards;
    outline: none;
  }

  wui-card[shake='true'] {
    animation:
      zoom-in 0.2s var(--wui-ease-out-power-2),
      w3m-shake 0.5s var(--wui-ease-out-power-2);
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
      animation: slide-in 0.2s var(--wui-ease-out-power-2);
    }

    wui-card[shake='true'] {
      animation:
        slide-in 0.2s var(--wui-ease-out-power-2),
        w3m-shake 0.5s var(--wui-ease-out-power-2);
    }
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

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes w3m-view-height {
    from {
      height: var(--prev-height);
    }
    to {
      height: var(--new-height);
    }
  }
`;var l=globalThis&&globalThis.__decorate||function(u,e,t,o){var i=arguments.length,s=i<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,r;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(u,e,t,o);else for(var d=u.length-1;d>=0;d--)(r=u[d])&&(s=(i<3?r(s):i>3?r(e,t,s):r(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};const v="scroll-lock";let n=class extends k{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.open=a.state.open,this.caipAddress=w.state.caipAddress,this.isSiweEnabled=f.state.isSiweEnabled,this.connected=w.state.isConnected,this.loading=a.state.loading,this.shake=a.state.shake,this.initializeTheming(),C.prefetch(),this.unsubscribe.push(a.subscribeKey("open",e=>e?this.onOpen():this.onClose()),a.subscribeKey("shake",e=>this.shake=e),a.subscribeKey("loading",e=>{this.loading=e,this.onNewAddress(w.state.caipAddress)}),w.subscribeKey("isConnected",e=>this.connected=e),w.subscribeKey("caipAddress",e=>this.onNewAddress(e)),f.subscribeKey("isSiweEnabled",e=>this.isSiweEnabled=e)),S.sendEvent({type:"track",event:"MODAL_LOADED"})}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.open?x`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            <wui-card
              shake="${this.shake}"
              role="alertdialog"
              aria-modal="true"
              tabindex="0"
              data-testid="w3m-modal-card"
            >
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
              <w3m-snackbar></w3m-snackbar>
            </wui-card>
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}async onOverlayClick(e){e.target===e.currentTarget&&await this.handleClose()}async handleClose(){const e=p.state.view==="ConnectingSiwe",t=p.state.view==="ApproveTransaction";if(this.isSiweEnabled){const{SIWEController:o}=await g(()=>import("./index-e4fb6e70.js"),["assets/index-e4fb6e70.js","assets/index-23e389d1.js","assets/index-92b54f8c.css"]);o.state.status!=="success"&&(e||t)?a.shake():a.close()}else a.close()}initializeTheming(){const{themeVariables:e,themeMode:t}=L.state,o=A.getColorTheme(t);E(e,o)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),_.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement("style");e.dataset.w3m=v,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${v}"]`);e&&e.remove()}onAddKeyboardListener(){var t;this.abortController=new AbortController;const e=(t=this.shadowRoot)==null?void 0:t.querySelector("wui-card");e==null||e.focus(),window.addEventListener("keydown",o=>{if(o.key==="Escape")this.handleClose();else if(o.key==="Tab"){const{tagName:i}=o.target;i&&!i.includes("W3M-")&&!i.includes("WUI-")&&(e==null||e.focus())}},this.abortController)}onRemoveKeyboardListener(){var e;(e=this.abortController)==null||e.abort(),this.abortController=void 0}async onNewAddress(e){var r,d;if(!this.connected||this.loading)return;const t=m.getPlainAddress(this.caipAddress),o=m.getPlainAddress(e),i=m.getNetworkId(this.caipAddress),s=m.getNetworkId(e);if(this.caipAddress=e,this.isSiweEnabled){const{SIWEController:h}=await g(()=>import("./index-e4fb6e70.js"),["assets/index-e4fb6e70.js","assets/index-23e389d1.js","assets/index-92b54f8c.css"]),b=await h.getSession();if(b&&t&&o&&t!==o){(r=h.state._client)!=null&&r.options.signOutOnAccountChange&&(await h.signOut(),this.onSiweNavigation());return}if(b&&i&&s&&i!==s){(d=h.state._client)!=null&&d.options.signOutOnNetworkChange&&(await h.signOut(),this.onSiweNavigation());return}this.onSiweNavigation()}}onSiweNavigation(){this.open?p.push("ConnectingSiwe"):a.open({view:"ConnectingSiwe"})}};n.styles=T;l([c()],n.prototype,"open",void 0);l([c()],n.prototype,"caipAddress",void 0);l([c()],n.prototype,"isSiweEnabled",void 0);l([c()],n.prototype,"connected",void 0);l([c()],n.prototype,"loading",void 0);l([c()],n.prototype,"shake",void 0);n=l([O("w3m-modal")],n);export{n as W3mModal};
