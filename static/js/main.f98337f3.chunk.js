(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{109:function(e,t,n){"use strict";(function(e){n.d(t,"a",(function(){return i})),n.d(t,"b",(function(){return o}));var c=n(133),r=function(e,t,n,c){return new(n||(n=Promise))((function(r,a){function i(e){try{s(c.next(e))}catch(t){a(t)}}function o(e){try{s(c.throw(e))}catch(t){a(t)}}function s(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,o)}s((c=c.apply(e,t||[])).next())}))},a=function(e,t){var n,c,r,a,i={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return a={next:o(0),throw:o(1),return:o(2)},"function"===typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function o(a){return function(o){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,c&&(r=2&a[0]?c.return:a[0]?c.throw||((r=c.return)&&r.call(c),0):c.next)&&!(r=r.call(c,a[1])).done)return r;switch(c=0,r&&(a=[2&a[0],r.value]),a[0]){case 0:case 1:r=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,c=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(r=(r=i.trys).length>0&&r[r.length-1])&&(6===a[0]||2===a[0])){i=0;continue}if(3===a[0]&&(!r||a[1]>r[0]&&a[1]<r[3])){i.label=a[1];break}if(6===a[0]&&i.label<r[1]){i.label=r[1],r=a;break}if(r&&i.label<r[2]){i.label=r[2],i.ops.push(a);break}r[2]&&i.ops.pop(),i.trys.pop();continue}a=t.call(e,i)}catch(o){a=[6,o],c=0}finally{n=r=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,o])}}};function i(){return r(this,void 0,void 0,(function(){var t;return a(this,(function(r){switch(r.label){case 0:return[4,(t=Object(c.createWorker)("object"===typeof e?{}:{corePath:n(200).default})).load()];case 1:return r.sent(),[4,t.loadLanguage("pol")];case 2:return r.sent(),[4,t.initialize("pol")];case 3:return r.sent(),[4,t.setParameters({tessedit_char_whitelist:"0123456789A\u0104BC\u0106D\u0118EFGHIJKL\u0141MN\u0143O\xd3PRS\u015aTUVWXYZ\u017b\u0179 !?-"})];case 4:return r.sent(),[2,t]}}))}))}function o(e,t){return r(this,void 0,void 0,(function(){return a(this,(function(n){switch(n.label){case 0:return[4,e.recognize(t)];case 1:return[2,n.sent().data.text]}}))}))}}).call(this,n(70))},160:function(e,t,n){},201:function(e,t,n){"use strict";n.r(t);var c,r,a,i,o,s,l=n(0),d=n.n(l),u=n(13),j=n.n(u),b=(n(160),n(48)),h=n.n(b),p=n(125),f=n(20),O=n(240),v=n(274),x=n(260),m=n(261),g=n(58),w=n(258),y=n(263),k=n(26),C=n(21),I=n(136),S=n(267),E=n(265),_=n(262),N=n(137),P=n(244),W=n(245),$=n(266),R=n(271),B=n(249),D=n(250),L=n(251),M=n(96),U=n.n(M),A=n(95),T=n.n(A),z=n(94),F=n.n(z),Q=n(135),G=n(270),q=n(275),H=n(31),J=n(32),K=Object(J.a)(c||(c=Object(H.a)(["\n  query getEvents {\n    events {\n      id\n      name\n      checkpoint_count\n      created_at\n    }\n  }\n"]))),V=Object(J.a)(r||(r=Object(H.a)(["\n  query getEvent($id: Int!) {\n    event(id: $id) {\n      id\n      name\n      checkpoint_count\n      checkpoints {\n        id\n        cp_id\n        cp_code\n        event_id\n        skipped\n        skip_reason\n      }\n    }\n  }\n"]))),X=Object(J.a)(a||(a=Object(H.a)(["\n  mutation CreateEvent($name: String!, $checkpointCount: Int!) {\n    createEvent(name: $name, checkpointCount: $checkpointCount) {\n      event {\n        id\n        name\n        checkpoint_count\n        created_at\n        updated_at\n      }\n    }\n  }\n"]))),Y=Object(J.a)(i||(i=Object(H.a)(["\n  mutation CreateCheckpoint(\n    $eventId: Int!\n    $cpId: Int!\n    $cpCode: String\n    $skipped: Boolean\n    $skipReason: String\n  ) {\n    createCheckpoint(\n      event_id: $eventId\n      cp_id: $cpId\n      cp_code: $cpCode\n      skipped: $skipped\n      skip_reason: $skipReason\n    ) {\n      checkpoint {\n        id\n        event_id\n        cp_id\n        cp_code\n        skipped\n        skip_reason\n        created_at\n        updated_at\n      }\n    }\n  }\n"]))),Z=Object(J.a)(o||(o=Object(H.a)(["\n  mutation DeleteEvent($id: Int!) {\n    deleteEvent(id: $id) {\n      id\n    }\n  }\n"]))),ee=Object(J.a)(s||(s=Object(H.a)(["\n  mutation DeleteCheckpoint($id: Int!) {\n    deleteCheckpoint(id: $id) {\n      id\n    }\n  }\n"]))),te=n(3),ne=d.a.createContext(!1),ce=function(e){var t=e.children,n=Object(l.useState)(null),c=Object(f.a)(n,2),r=c[0],a=c[1],i=Object(l.useState)(!0),o=Object(f.a)(i,2),s=o[0],d=o[1],u=Object(C.g)();return Object(l.useEffect)((function(){r?r!==u.pathname&&d(!1):a(u.pathname)}),[r,u.pathname,s,d]),Object(te.jsx)(ne.Provider,{value:(!r||r===u.pathname)&&s,children:t})};function re(){return Object(l.useContext)(ne)}var ae=Object(O.a)((function(e){return Object(v.a)({link:{display:"flex"},icon:{marginRight:e.spacing(.5),width:20,height:20}})})),ie=n(242),oe=Object(O.a)((function(e){return Object(v.a)({root:{height:4}})})),se=function(e){var t=e.active,n=oe();return Object(te.jsx)("div",{className:n.root,children:t&&Object(te.jsx)(ie.a,{color:"secondary"})})},le=function(e){var t=e.id,n=e.name,c=e.createdAt;return Object(te.jsx)(P.a,{button:!0,component:k.b,to:"/events/".concat(t),children:Object(te.jsx)(W.a,{primary:n,secondary:Object(Q.a)(new Date(c),"dd/MM/yyyy")})})},de=Object(O.a)((function(e){return Object(v.a)({wrapper:{display:"flex",width:"100%"},deleteIcon:{},listWrapper:{},addEventButton:{position:"absolute",right:"1em",bottom:"1em"}})})),ue=function(){var e=re(),t=Object(G.a)(K,{fetchPolicy:e?"cache-and-network":void 0,nextFetchPolicy:e?"cache-first":void 0}),n=t.loading,c=t.error,r=t.data,a=Object(q.a)(Z,{refetchQueries:["getEvents"],awaitRefetchQueries:!0}),i=Object(f.a)(a,1)[0],o=de(),s=ae();return n&&!r?Object(te.jsx)("p",{children:"Loading..."}):Object(te.jsxs)("div",{className:o.listWrapper,children:[Object(te.jsx)($.a,{px:1,py:2,children:Object(te.jsx)(R.a,{"aria-label":"breadcrumb",children:Object(te.jsxs)(g.a,{color:"textPrimary",className:s.link,children:[Object(te.jsx)(F.a,{className:s.icon}),"Events"]})})}),Object(te.jsx)(se,{active:n}),c&&Object(te.jsx)("p",{children:"Error :("}),Object(te.jsx)(B.a,{children:Object(N.a)(r.events).sort((function(e,t){return t.id-e.id})).map((function(e){var t=e.id,n=e.name,c=e.created_at;return Object(te.jsxs)("div",{className:o.wrapper,children:[Object(te.jsx)(le,{id:t,name:n,createdAt:c},t),Object(te.jsx)("div",{className:o.deleteIcon,children:Object(te.jsx)(D.a,{"aria-label":"delete",onClick:function(){return i({variables:{id:t}})},children:Object(te.jsx)(T.a,{})})})]})}))}),Object(te.jsx)(L.a,{className:o.addEventButton,color:"primary","aria-label":"add",component:k.b,to:"/events/new",children:Object(te.jsx)(U.a,{})})]})},je=n(272),be=n(252),he=n(253),pe=n(264),fe=n(255),Oe=n(256),ve=n(47),xe=function(){var e=Object(l.useState)(""),t=Object(f.a)(e,2),n=t[0],c=t[1],r=Object(l.useState)(""),a=Object(f.a)(r,2),i=a[0],o=a[1],s=Object(q.a)(X,{refetchQueries:["getEvents"],awaitRefetchQueries:!0,onCompleted:function(e){u.push("/events/".concat(e.createEvent.event.id))}}),d=Object(f.a)(s,1)[0],u=Object(C.f)(),j=function(){u.push("/")};return Object(te.jsxs)(je.a,{open:!0,keepMounted:!0,onClose:j,"aria-labelledby":"alert-dialog-slide-title","aria-describedby":"alert-dialog-slide-description",children:[Object(te.jsx)(be.a,{id:"alert-dialog-slide-title",children:"Create a new event"}),Object(te.jsx)(ve.b,{onSubmit:function(){return d({variables:{name:n,checkpointCount:parseInt(i,10)}})},render:function(e){var t=e.handleSubmit;return Object(te.jsxs)("form",{onSubmit:t,children:[Object(te.jsxs)(he.a,{children:[Object(te.jsx)(ve.a,{name:"id",render:function(e){e.input;var t=e.meta;return Object(te.jsxs)("div",{children:[Object(te.jsx)(pe.a,{id:"standard-basic",label:"Name",required:!0,autoComplete:"off",onChange:function(e){return c(e.target.value)}}),t.touched&&t.error&&Object(te.jsx)("span",{children:t.error})]})}}),Object(te.jsx)(ve.a,{name:"code",render:function(e){e.input;var t=e.meta;return Object(te.jsxs)("div",{children:[Object(te.jsx)(pe.a,{id:"standard-basic",label:"Points",required:!0,autoComplete:"off",onChange:function(e){return o(e.target.value)}}),t.touched&&t.error&&Object(te.jsx)("span",{children:t.error})]})}})]}),Object(te.jsxs)(fe.a,{children:[Object(te.jsx)(Oe.a,{variant:"contained",color:"primary",type:"submit",children:"Create"}),Object(te.jsx)(Oe.a,{onClick:j,color:"primary",children:"Cancel"})]})]})}})]})},me=n(41),ge=n(139),we=n(257),ye=n(206),ke=function(e){var t=e.scoredIds,n=e.max,c=Array(n).fill(n).map((function(e,t){return 1+t})).filter((function(e){return!t.includes(e)}));return 0===t.length||t.length===n?null:Object(te.jsxs)($.a,{mt:3,children:[Object(te.jsx)($.a,{minWidth:35,ml:1,mb:1,children:Object(te.jsx)(g.a,{children:"Missing:"})}),Object(te.jsx)($.a,{display:"flex",alignItems:"center",children:Object(te.jsx)($.a,{width:"100%",ml:1,children:c.join(", ")})})]})},Ce=Object(O.a)((function(e){return Object(v.a)({wrapper:{width:"100%"},header:{padding:10,paddingBottom:2,backgroundColor:"#c5cae9"},content:{border:"1px solid #c5cae9",width:"100%",paddingLeft:10,paddingRight:10,paddingBottom:10,padding:10,boxSizing:"border-box"},deleteIcon:{position:"absolute",top:-3,right:-5}})})),Ie=function(e){var t,n=e.checkpoint,c=Object(q.a)(ee,{refetchQueries:["getEvent"],awaitRefetchQueries:!0}),r=Object(f.a)(c,1)[0],a=Ce();return Object(te.jsxs)("div",{style:{display:"flex",flexDirection:"row",position:"relative"},children:[Object(te.jsxs)("div",{className:a.wrapper,children:[Object(te.jsx)("div",{className:a.header,children:Object(te.jsx)(g.a,{variant:"button",color:"textSecondary",children:n.cp_id})}),Object(te.jsx)("div",{className:a.content,children:Object(te.jsx)(g.a,{variant:"subtitle1",children:Object(te.jsx)("span",{children:n.skipped?"skipped":null===(t=n.cp_code)||void 0===t?void 0:t.toUpperCase()})})})]}),Object(te.jsx)("div",{className:a.deleteIcon,children:Object(te.jsx)(D.a,{"aria-label":"delete",onClick:function(){return e=n.id,r({variables:{id:e}});var e},children:Object(te.jsx)(T.a,{})})})]})},Se=function(e){var t=e.checkpoints,n=e.max;if(t.length!==n)return null;t.sort((function(e,t){return e.cp_id>t.cp_id?1:-1}));var c=t.map((function(e){return e.skipped?"...":e.cp_code}));return Object(te.jsxs)($.a,{mt:3,children:[Object(te.jsx)($.a,{minWidth:35,ml:1,mb:1,children:Object(te.jsx)(g.a,{variant:"h6",children:"Solution:"})}),Object(te.jsx)($.a,{display:"flex",alignItems:"center",children:Object(te.jsx)($.a,{width:"100%",ml:1,children:c.join(" ")})})]})},Ee=["current","max"];function _e(e){var t=e.current,n=e.max,c=Object(ge.a)(e,Ee),r=100*t/n;return Object(te.jsxs)($.a,{display:"flex",alignItems:"center",children:[Object(te.jsx)($.a,{width:"100%",mr:1,children:Object(te.jsx)(ie.a,Object(me.a)(Object(me.a)({variant:"determinate"},c),{},{value:r}))}),Object(te.jsx)($.a,{minWidth:35,children:Object(te.jsxs)(g.a,{variant:"body2",color:"textSecondary",children:[t,"/",n]})})]})}var Ne=Object(O.a)((function(e){return Object(v.a)({root:{flexGrow:1,padding:20},paper:{width:80},item:{padding:5},control:{padding:e.spacing(2)},addCheckpointButton:{position:"absolute",right:"1em",bottom:"1em"}})})),Pe=function(e){var t=e.event,n=e.newCheckpointPath,c=t.checkpoints,r=d.a.useState(2),a=Object(f.a)(r,1)[0],i=Ne();return Object(te.jsxs)($.a,{m:1,children:[Object(te.jsx)(g.a,{variant:"h6",children:t.name}),Object(te.jsx)(_e,{current:c.length,max:t.checkpoint_count}),c.length>0&&Object(te.jsx)(we.a,{container:!0,className:i.root,spacing:2,children:Object(te.jsx)(we.a,{item:!0,xs:12,children:Object(te.jsx)(we.a,{container:!0,justify:"flex-start",spacing:a,children:c.map((function(e){return Object(te.jsx)(we.a,{item:!0,className:i.item,children:Object(te.jsx)(ye.a,{className:i.paper,children:Object(te.jsx)(Ie,{checkpoint:e,eventId:t.id})})},e.cp_id)}))})})}),Object(te.jsx)(L.a,{className:i.addCheckpointButton,color:"primary","aria-label":"add",component:k.b,to:n,children:Object(te.jsx)(U.a,{})}),Object(te.jsx)(ke,{scoredIds:c.map((function(e){return e.cp_id})),max:t.checkpoint_count}),Object(te.jsx)(Se,{checkpoints:c,max:t.checkpoint_count})]})},We=function(){var e=Object(C.h)().id,t=ae(),n=re(),c=Object(G.a)(V,{variables:{id:parseInt(e,10)},fetchPolicy:n?"cache-and-network":void 0,nextFetchPolicy:n?"cache-first":void 0}),r=c.loading,a=c.error,i=c.data,o=null===i||void 0===i?void 0:i.event;return r&&!i?Object(te.jsx)("p",{children:"Loading..."}):Object(te.jsxs)("div",{children:[Object(te.jsx)($.a,{px:1,py:2,children:Object(te.jsxs)(R.a,{"aria-label":"breadcrumb",children:[Object(te.jsxs)(w.a,{color:"inherit",component:k.b,to:"/",className:t.link,children:[Object(te.jsx)(F.a,{className:t.icon}),"Events"]}),Object(te.jsx)(g.a,{color:"textPrimary",children:o.name})]})}),Object(te.jsx)(se,{active:r}),a&&Object(te.jsx)("p",{children:"Error :("}),Object(te.jsx)(Pe,{event:o,newCheckpointPath:"/events/".concat(o.id,"/add-checkpoint")})]})},$e=n(79),Re=n(259),Be=n(269),De=n(53),Le=n(132),Me=n.n(Le),Ue=function(e,t,n){var c=t*(4*n)+4*e;return[c,c+1,c+2,c+3]},Ae=function(e,t,n){return n*e+t};var Te=n(109);var ze=function(){return(ze=Object.assign||function(e){for(var t,n=1,c=arguments.length;n<c;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}).apply(this,arguments)},Fe=function(e,t,n,c){return new(n||(n=Promise))((function(r,a){function i(e){try{s(c.next(e))}catch(t){a(t)}}function o(e){try{s(c.throw(e))}catch(t){a(t)}}function s(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,o)}s((c=c.apply(e,t||[])).next())}))},Qe=function(e,t){var n,c,r,a,i={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return a={next:o(0),throw:o(1),return:o(2)},"function"===typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function o(a){return function(o){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,c&&(r=2&a[0]?c.return:a[0]?c.throw||((r=c.return)&&r.call(c),0):c.next)&&!(r=r.call(c,a[1])).done)return r;switch(c=0,r&&(a=[2&a[0],r.value]),a[0]){case 0:case 1:r=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,c=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(r=(r=i.trys).length>0&&r[r.length-1])&&(6===a[0]||2===a[0])){i=0;continue}if(3===a[0]&&(!r||a[1]>r[0]&&a[1]<r[3])){i.label=a[1];break}if(6===a[0]&&i.label<r[1]){i.label=r[1],r=a;break}if(r&&i.label<r[2]){i.label=r[2],i.ops.push(a);break}r[2]&&i.ops.pop(),i.trys.pop();continue}a=t.call(e,i)}catch(o){a=[6,o],c=0}finally{n=r=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,o])}}},Ge=function(e){var t=e.onRead,n=Object(l.useRef)(),c=Object(l.useRef)(),r=Object(l.useRef)(),a=Object(l.useState)(null),i=a[0],o=a[1];return c.current||(c.current=document.createElement("canvas")),Object(l.useEffect)((function(){return Object(Te.a)().then((function(e){return n.current=e})),function(){n.current&&n.current.terminate()}}),[n]),Object(l.useEffect)((function(){var e=!1,t=function(){e=!0,i&&i.getTracks().forEach((function(e){e.stop()}))};if(i)return t;var n=r.current;var c=navigator.mediaDevices.getSupportedConstraints();return navigator.mediaDevices.getUserMedia({audio:!1,video:ze({width:{exact:320},height:{exact:240}},c.facingMode?{facingMode:"environment"}:{})}).then((function(t){e||(o(t),n.srcObject=t)})).catch((function(t){e||console.log("navigator.MediaDevices.getUserMedia error: ",t)})),t}),[i,r]),Object(l.useEffect)((function(){var e=setInterval((function(){return Fe(void 0,void 0,void 0,(function(){var e,a,i,o,s;return Qe(this,(function(l){switch(l.label){case 0:return e=c.current,0===(a=r.current).videoWidth||0===a.videoHeight?[2]:(e.width=a.videoWidth,e.height=a.videoHeight,(i=e.getContext("2d")).drawImage(a,0,0,e.width,e.height),function(e){for(var t=e.canvas,n=t.width,c=t.height,r=e.getImageData(0,0,n,c),a=r.data,i=[],o=0;o<n;o++)for(var s=0;s<c;s++){var l=Ue(o,s,n),d=l[0],u=l[1],j=l[2],b=a[d],h=a[u],p=a[j],f=Math.ceil(b+h+p)/3;i.push(f)}var O=Me()(i),v=i.map((function(e){return e>O}));for(o=0;o<n;o++)for(s=0;s<c;s++){var x=Ae(o,s,c),m=Ue(o,s,n),g=(d=m[0],u=m[1],j=m[2],m[3]);v[x]?(a[d]=255,a[u]=255,a[j]=255,a[g]=255):(a[d]=0,a[u]=0,a[j]=0,a[g]=255)}e.putImageData(r,0,0)}(i),n.current?[4,Object(Te.b)(n.current,e.toDataURL())]:[2]);case 1:return o=l.sent(),(s=function(e){var t=e.match(/([0-9]{1,2})\s+(.{3})/);return t?{id:parseInt(t[1],10),code:t[2]}:null}(o))&&t(s),[2]}}))}))}),1e3);return function(){clearInterval(e)}}),[c,r]),l.createElement("div",{style:{width:300,height:225,overflow:"hidden"}},l.createElement("video",{playsInline:!0,autoPlay:!0,ref:r,style:{width:"100%",height:"calc(var(--width) * 0.75)"}}))},qe=Object(O.a)((function(e){return Object(v.a)({margin:{margin:e.spacing(1)}})})),He=function(){var e=Object(l.useState)(!1),t=Object(f.a)(e,2),n=t[0],c=t[1],r=Object(l.useState)(null),a=Object(f.a)(r,2),i=a[0],o=a[1],s=Object(C.h)().id,d=Object(C.f)(),u=Object(q.a)(Y,{refetchQueries:["getEvent"],awaitRefetchQueries:!0,onCompleted:function(e){d.push("/events/".concat(e.createCheckpoint.checkpoint.event_id))}}),j=Object(f.a)(u,2),b=j[0],h=j[1],p=h.loading,O=h.error,v=qe();return p?Object(te.jsx)("p",{children:"Loading..."}):O?Object(te.jsx)("p",{children:"Error :("}):Object(te.jsx)(ve.b,{onSubmit:function(e){try{return b({variables:{eventId:parseInt(s,10),cpId:parseInt(e.cpId,10),cpCode:e.cpCode,skipped:e.skipped,skipReason:e.skipReason}})}catch(t){return t?t.message&&t.message.startsWith("Checkpoint")?{id:"Id already taken"}:Object($e.a)({},De.a,t.message||t):Object($e.a)({},De.a,"Something went wrong")}},initialValues:{skipped:!1},render:function(e){var t=e.values,r=e.submitError,a=e.handleSubmit;return t.skipped&&delete t.cpCode,Object(te.jsxs)("form",{onSubmit:a,children:[r&&Object(te.jsx)("div",{className:"error",children:r}),Object(te.jsx)(ve.a,{name:"cpId",render:function(e){var t=e.input,n=e.meta;return Object(te.jsxs)("div",{className:v.margin,children:[Object(te.jsx)(pe.a,Object(me.a)(Object(me.a)({},t),{},{label:"Id",required:!0,autoComplete:"off"})),n.touched&&(n.error||n.submitError)&&Object(te.jsx)("span",{children:n.error||n.submitError})]})}}),Object(te.jsx)(ve.a,{name:"cpCode",render:function(e){var n=e.input,c=e.meta;return Object(te.jsxs)("div",{className:v.margin,children:[Object(te.jsx)(pe.a,Object(me.a)(Object(me.a)({},n),{},{label:"Code",required:!t.skipped,disabled:t.skipped,autoComplete:"off"})),c.touched&&(c.error||c.submitError)&&Object(te.jsx)("span",{children:c.error||c.submitError})]})}}),Object(te.jsx)(ve.a,{name:"skipped",type:"checkbox",render:function(e){var t=e.input;e.meta;return Object(te.jsx)($.a,{display:"flex",alignItems:"center",ml:1,children:Object(te.jsx)(Re.a,{control:Object(te.jsx)(Be.a,Object(me.a)(Object(me.a)({},t),{},{checked:t.value,name:"skipped",color:"primary"})),label:"Skip"})})}}),Object(te.jsx)("div",{style:{marginTop:16,marginBottom:16,width:300,height:225},children:n?Object(te.jsxs)("div",{style:{position:"relative"},children:[Object(te.jsx)(Ge,{onRead:function(e){o(e)}}),Object(te.jsx)(Oe.a,{variant:"contained",color:"secondary",onClick:function(){return c(!1)},style:{position:"absolute",bottom:0,right:0},children:"Cancel"})]}):Object(te.jsx)("div",{style:{width:300,height:225,background:"grey",display:"flex",alignItems:"center",justifyContent:"center"},children:Object(te.jsx)(Oe.a,{variant:"contained",color:"secondary",onClick:function(){return c(!0)},children:"Scan"})})}),i&&Object(te.jsxs)("div",{children:[i.id," - ",i.code]}),Object(te.jsx)(Oe.a,{variant:"contained",color:"primary",type:"submit",children:"Submit"})]})}})},Je=n(273),Ke=n(134),Ve=n.n(Ke),Xe=Object(l.createContext)(null),Ye=function(){var e=Object(l.useContext)(Xe),t=Object(l.useState)(!1),n=Object(f.a)(t,2),c=n[0],r=n[1],a=Object(l.useState)(null),i=Object(f.a)(a,2),o=i[0],s=i[1];Object(l.useEffect)((function(){if(e){var t=function(e){s(e)};return e.onUpdate(t),function(){e.offUpdate(t)}}}),[e]);var u=function(){s(null)};return Object(te.jsx)(Je.a,{anchorOrigin:{vertical:"top",horizontal:"right"},open:Boolean(o),onClose:u,message:"A new version of the app is available!",action:Object(te.jsxs)(d.a.Fragment,{children:[Object(te.jsx)(Oe.a,{color:"secondary",size:"small",onClick:function(){if(o){r(!0);var e=o.waiting;e&&(e.postMessage({type:"SKIP_WAITING"}),e.addEventListener("statechange",(function(e){var t=e.target?e.target:null;"activated"===(null===t||void 0===t?void 0:t.state)&&window.location.reload()})))}},disabled:c,children:"RELOAD"}),Object(te.jsx)(D.a,{size:"small","aria-label":"close",color:"inherit",onClick:u,children:Object(te.jsx)(Ve.a,{fontSize:"small"})})]})})},Ze=n(110),et=function(){return Object(I.a)({uri:"https://woodtime-api.ertrzyiks.me/woodtime"})},tt=Object(O.a)((function(e){return Object(v.a)({root:{flexGrow:1},menuButton:{marginRight:e.spacing(2)},title:{flexGrow:1},loaderWrapper:{alignItems:"center",width:"100%",height:"100%",justifyContent:"center",display:"flex"}})}));var nt=function(){var e=Object(l.useState)(null),t=Object(f.a)(e,2),n=t[0],c=t[1],r=tt();return Object(l.useEffect)((function(){function e(){return(e=Object(p.a)(h.a.mark((function e(){var t;return h.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=new S.a,e.next=3,Object(Ze.b)({cache:t,storage:new Ze.a(window.localStorage)});case 3:c(new E.a({cache:t,link:et()}));case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}(function(){return e.apply(this,arguments)})().catch(console.error)}),[c]),Object(te.jsxs)(k.a,{basename:"",children:[Object(te.jsx)(Ye,{}),Object(te.jsxs)(ce,{children:[Object(te.jsx)(x.a,{position:"static",children:Object(te.jsx)(m.a,{children:Object(te.jsx)(g.a,{variant:"h6",className:r.title,children:Object(te.jsx)(w.a,{component:k.b,to:"/",color:"inherit",children:"Woodtime"})})})}),n?Object(te.jsx)(_.a,{client:n,children:Object(te.jsxs)(C.c,{children:[Object(te.jsx)(C.a,{path:"/",exact:!0,children:Object(te.jsx)(ue,{})}),Object(te.jsxs)(C.a,{path:"/events/new",exact:!0,children:[Object(te.jsx)(ue,{}),Object(te.jsx)(xe,{})]}),Object(te.jsx)(C.a,{path:"/events/:id",exact:!0,children:Object(te.jsx)(We,{})}),Object(te.jsx)(C.a,{path:"/events/:id/add-checkpoint",exact:!0,children:Object(te.jsx)(He,{})})]})}):Object(te.jsx)("div",{className:r.loaderWrapper,children:Object(te.jsx)(y.a,{})})]})]})},ct=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function rt(e,t){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var n=e.installing;null!=n&&(n.onstatechange=function(){"installed"===n.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}var at=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,278)).then((function(t){var n=t.getCLS,c=t.getFID,r=t.getFCP,a=t.getLCP,i=t.getTTFB;n(e),c(e),r(e),a(e),i(e)}))},it=[],ot=[],st=function(e){var t=e.children,n={onSuccess:function(e){return it.push(e)},offSuccess:function(e){return it.filter((function(t){return t!==e}))},onUpdate:function(e){return ot.push(e)},offUpdate:function(e){return ot.filter((function(t){return t!==e}))}};return Object(te.jsx)(Xe.Provider,{value:n,children:t})};j.a.render(Object(te.jsx)(d.a.StrictMode,{children:Object(te.jsx)(st,{children:Object(te.jsx)(nt,{})})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var t="".concat("","/service-worker.js");ct?(!function(e,t){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(n){var c=n.headers.get("content-type");404===n.status||null!=c&&-1===c.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):rt(e,t)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(t,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):rt(t,e)}))}}({onUpdate:function(e){ot.forEach((function(t){return t(e)}))},onSuccess:function(){it.forEach((function(e){return e()}))}}),at()}},[[201,1,2]]]);
//# sourceMappingURL=main.f98337f3.chunk.js.map