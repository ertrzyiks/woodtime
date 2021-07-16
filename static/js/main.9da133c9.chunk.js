(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{109:function(e,t,n){"use strict";(function(e){n.d(t,"a",(function(){return i})),n.d(t,"b",(function(){return o}));var c=n(134),r=function(e,t,n,c){return new(n||(n=Promise))((function(r,a){function i(e){try{s(c.next(e))}catch(t){a(t)}}function o(e){try{s(c.throw(e))}catch(t){a(t)}}function s(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,o)}s((c=c.apply(e,t||[])).next())}))},a=function(e,t){var n,c,r,a,i={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return a={next:o(0),throw:o(1),return:o(2)},"function"===typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function o(a){return function(o){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,c&&(r=2&a[0]?c.return:a[0]?c.throw||((r=c.return)&&r.call(c),0):c.next)&&!(r=r.call(c,a[1])).done)return r;switch(c=0,r&&(a=[2&a[0],r.value]),a[0]){case 0:case 1:r=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,c=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(r=(r=i.trys).length>0&&r[r.length-1])&&(6===a[0]||2===a[0])){i=0;continue}if(3===a[0]&&(!r||a[1]>r[0]&&a[1]<r[3])){i.label=a[1];break}if(6===a[0]&&i.label<r[1]){i.label=r[1],r=a;break}if(r&&i.label<r[2]){i.label=r[2],i.ops.push(a);break}r[2]&&i.ops.pop(),i.trys.pop();continue}a=t.call(e,i)}catch(o){a=[6,o],c=0}finally{n=r=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,o])}}};function i(){return r(this,void 0,void 0,(function(){var t;return a(this,(function(r){switch(r.label){case 0:return[4,(t=Object(c.createWorker)("object"===typeof e?{}:{corePath:n(201).default})).load()];case 1:return r.sent(),[4,t.loadLanguage("pol")];case 2:return r.sent(),[4,t.initialize("pol")];case 3:return r.sent(),[4,t.setParameters({tessedit_char_whitelist:"0123456789A\u0104BC\u0106D\u0118EFGHIJKL\u0141MN\u0143O\xd3PRS\u015aTUVWXYZ\u017b\u0179 !?-"})];case 4:return r.sent(),[2,t]}}))}))}function o(e,t){return r(this,void 0,void 0,(function(){return a(this,(function(n){switch(n.label){case 0:return[4,e.recognize(t)];case 1:return[2,n.sent().data.text]}}))}))}}).call(this,n(70))},161:function(e,t,n){},202:function(e,t,n){"use strict";n.r(t);var c,r,a,i,o,s,l=n(0),d=n.n(l),u=n(13),j=n.n(u),b=(n(161),n(48)),h=n.n(b),p=n(125),f=n(18),O=n(241),v=n(275),x=n(261),m=n(262),g=n(58),k=n(259),y=n(264),w=n(26),C=n(21),S=n(137),I=n(268),E=n(266),_=n(263),N=n(138),P=n(246),W=n(247),R=n(267),$=n(273),z=n(245),B=n(252),D=n(253),L=n(97),M=n.n(L),U=n(96),A=n.n(U),T=n(95),F=n.n(T),Q=n(132),G=n.n(Q),q=n(136),H=n(271),J=n(276),K=n(31),V=n(32),X=Object(V.a)(c||(c=Object(K.a)(["\n  query getEvents {\n    events {\n      id\n      name\n      checkpoint_count\n      created_at\n    }\n  }\n"]))),Y=Object(V.a)(r||(r=Object(K.a)(["\n  query getEvent($id: Int!) {\n    event(id: $id) {\n      id\n      name\n      checkpoint_count\n      checkpoints {\n        id\n        cp_id\n        cp_code\n        event_id\n        skipped\n        skip_reason\n      }\n    }\n  }\n"]))),Z=Object(V.a)(a||(a=Object(K.a)(["\n  mutation CreateEvent($name: String!, $checkpointCount: Int!) {\n    createEvent(name: $name, checkpointCount: $checkpointCount) {\n      event {\n        id\n        name\n        checkpoint_count\n        created_at\n        updated_at\n      }\n    }\n  }\n"]))),ee=Object(V.a)(i||(i=Object(K.a)(["\n  mutation CreateCheckpoint(\n    $eventId: Int!\n    $cpId: Int!\n    $cpCode: String\n    $skipped: Boolean\n    $skipReason: String\n  ) {\n    createCheckpoint(\n      event_id: $eventId\n      cp_id: $cpId\n      cp_code: $cpCode\n      skipped: $skipped\n      skip_reason: $skipReason\n    ) {\n      checkpoint {\n        id\n        event_id\n        cp_id\n        cp_code\n        skipped\n        skip_reason\n        created_at\n        updated_at\n      }\n    }\n  }\n"]))),te=Object(V.a)(o||(o=Object(K.a)(["\n  mutation DeleteEvent($id: Int!) {\n    deleteEvent(id: $id) {\n      id\n    }\n  }\n"]))),ne=Object(V.a)(s||(s=Object(K.a)(["\n  mutation DeleteCheckpoint($id: Int!) {\n    deleteCheckpoint(id: $id) {\n      id\n    }\n  }\n"]))),ce=n(272),re=n(244),ae=n(2),ie=Object(O.a)((function(e){return Object(v.a)({listWrapper:{padding:10}})})),oe=function(e){var t=ie();return Object(ae.jsxs)(ce.a,{"aria-labelledby":"simple-checklist-title",open:!0,onClose:e.handleClose,children:[Object(ae.jsx)(re.a,{id:"simple-checklist-title",children:"Rzeczy do zabrania"}),Object(ae.jsx)(z.a,{className:t.listWrapper,children:["4 kanapki","dwa bidony wody","kubek Kuby","jab\u0142ko w kawa\u0142kach","banan","ciastka","pampersy","chusteczki mokre","worek na \u015bmieci","chusteczki zwyk\u0142e","p\u0119seta","octenisept","\u017cel do dezynfekcji"].map((function(e,t){return Object(ae.jsx)(P.a,{dense:!0,children:Object(ae.jsx)(W.a,{primary:e,primaryTypographyProps:{variant:"body1"}})},t)}))})]})},se=d.a.createContext(!1),le=function(e){var t=e.children,n=Object(l.useState)(null),c=Object(f.a)(n,2),r=c[0],a=c[1],i=Object(l.useState)(!0),o=Object(f.a)(i,2),s=o[0],d=o[1],u=Object(C.g)();return Object(l.useEffect)((function(){r?r!==u.pathname&&d(!1):a(u.pathname)}),[r,u.pathname,s,d]),Object(ae.jsx)(se.Provider,{value:(!r||r===u.pathname)&&s,children:t})};function de(){return Object(l.useContext)(se)}var ue=Object(O.a)((function(e){return Object(v.a)({link:{display:"flex"},icon:{marginRight:e.spacing(.5),width:20,height:20}})})),je=n(248),be=Object(O.a)((function(e){return Object(v.a)({root:{height:4}})})),he=function(e){var t=e.active,n=be();return Object(ae.jsx)("div",{className:n.root,children:t&&Object(ae.jsx)(je.a,{color:"secondary"})})},pe=function(e){var t=e.id,n=e.name,c=e.createdAt;return Object(ae.jsx)(P.a,{button:!0,component:w.b,to:"/events/".concat(t),children:Object(ae.jsx)(W.a,{primary:n,secondary:Object(q.a)(new Date(c),"dd/MM/yyyy")})})},fe=Object(O.a)((function(e){return Object(v.a)({wrapper:{display:"flex",width:"100%"},deleteIcon:{},icons:{display:"flex",justifyContent:"space-between"},listWrapper:{position:"relative"},addEventButton:{position:"absolute",right:"1em",bottom:"1em"}})})),Oe=function(){var e=de(),t=Object(H.a)(X,{fetchPolicy:e?"cache-and-network":void 0,nextFetchPolicy:e?"cache-first":void 0}),n=t.loading,c=t.error,r=t.data,a=Object(l.useState)(!1),i=Object(f.a)(a,2),o=i[0],s=i[1],d=Object(J.a)(te,{refetchQueries:["getEvents"],awaitRefetchQueries:!0}),u=Object(f.a)(d,1)[0],j=fe(),b=ue();return n&&!r?Object(ae.jsx)("p",{children:"Loading..."}):c?Object(ae.jsx)("p",{children:"Error :("}):Object(ae.jsxs)("div",{className:j.listWrapper,children:[Object(ae.jsx)(R.a,{px:1,py:2,children:Object(ae.jsx)($.a,{"aria-label":"breadcrumb",children:Object(ae.jsxs)(g.a,{color:"textPrimary",className:b.link,children:[Object(ae.jsx)(F.a,{className:b.icon}),"Events"]})})}),Object(ae.jsx)(he,{active:n}),c&&Object(ae.jsx)("p",{children:"Error :("}),Object(ae.jsx)(z.a,{children:Object(N.a)(r.events).sort((function(e,t){return t.id-e.id})).map((function(e){var t=e.id,n=e.name,c=e.created_at;return Object(ae.jsxs)("div",{className:j.wrapper,children:[Object(ae.jsx)(pe,{id:t,name:n,createdAt:c}),Object(ae.jsxs)("div",{className:j.icons,children:[Object(ae.jsx)(B.a,{"aria-label":"checklist",onClick:function(){s(!0)},children:Object(ae.jsx)(G.a,{})}),Object(ae.jsx)(B.a,{"aria-label":"delete",onClick:function(){return u({variables:{id:t}})},children:Object(ae.jsx)(A.a,{})})]})]},t)}))}),o&&Object(ae.jsx)(oe,{handleClose:function(){s(!1)}}),Object(ae.jsx)(D.a,{className:j.addEventButton,color:"primary","aria-label":"add",component:w.b,to:"/events/new",children:Object(ae.jsx)(M.a,{})})]})},ve=n(254),xe=n(265),me=n(256),ge=n(257),ke=n(47),ye=function(){var e=Object(l.useState)(""),t=Object(f.a)(e,2),n=t[0],c=t[1],r=Object(l.useState)(""),a=Object(f.a)(r,2),i=a[0],o=a[1],s=Object(J.a)(Z,{refetchQueries:["getEvents"],awaitRefetchQueries:!0,onCompleted:function(e){u.push("/events/".concat(e.createEvent.event.id))}}),d=Object(f.a)(s,1)[0],u=Object(C.f)(),j=function(){u.push("/")};return Object(ae.jsxs)(ce.a,{open:!0,keepMounted:!0,onClose:j,"aria-labelledby":"alert-dialog-slide-title","aria-describedby":"alert-dialog-slide-description",children:[Object(ae.jsx)(re.a,{id:"alert-dialog-slide-title",children:"Create a new event"}),Object(ae.jsx)(ke.b,{onSubmit:function(){return d({variables:{name:n,checkpointCount:parseInt(i,10)}})},render:function(e){var t=e.handleSubmit;return Object(ae.jsxs)("form",{onSubmit:t,children:[Object(ae.jsxs)(ve.a,{children:[Object(ae.jsx)(ke.a,{name:"id",render:function(e){e.input;var t=e.meta;return Object(ae.jsxs)("div",{children:[Object(ae.jsx)(xe.a,{id:"standard-basic",label:"Name",required:!0,autoComplete:"off",onChange:function(e){return c(e.target.value)}}),t.touched&&t.error&&Object(ae.jsx)("span",{children:t.error})]})}}),Object(ae.jsx)(ke.a,{name:"code",render:function(e){e.input;var t=e.meta;return Object(ae.jsxs)("div",{children:[Object(ae.jsx)(xe.a,{id:"standard-basic",label:"Points",required:!0,autoComplete:"off",onChange:function(e){return o(e.target.value)}}),t.touched&&t.error&&Object(ae.jsx)("span",{children:t.error})]})}})]}),Object(ae.jsxs)(me.a,{children:[Object(ae.jsx)(ge.a,{variant:"contained",color:"primary",type:"submit",children:"Create"}),Object(ae.jsx)(ge.a,{onClick:j,color:"primary",children:"Cancel"})]})]})}})]})},we=n(41),Ce=n(140),Se=n(258),Ie=n(205),Ee=function(e){var t=e.scoredIds,n=e.max,c=Array(n).fill(n).map((function(e,t){return 1+t})).filter((function(e){return!t.includes(e)}));return 0===t.length||t.length===n?null:Object(ae.jsxs)(R.a,{mt:3,children:[Object(ae.jsx)(R.a,{minWidth:35,ml:1,mb:1,children:Object(ae.jsx)(g.a,{children:"Missing:"})}),Object(ae.jsx)(R.a,{display:"flex",alignItems:"center",children:Object(ae.jsx)(R.a,{width:"100%",ml:1,children:c.join(", ")})})]})},_e=Object(O.a)((function(e){return Object(v.a)({wrapper:{width:"100%"},header:{padding:10,paddingBottom:2,backgroundColor:"#c5cae9"},content:{border:"1px solid #c5cae9",width:"100%",paddingLeft:10,paddingRight:10,paddingBottom:10,padding:10,boxSizing:"border-box"},deleteIcon:{position:"absolute",top:-3,right:-5}})})),Ne=function(e){var t,n=e.checkpoint,c=Object(J.a)(ne,{refetchQueries:["getEvent"],awaitRefetchQueries:!0}),r=Object(f.a)(c,1)[0],a=_e();return Object(ae.jsxs)("div",{style:{display:"flex",flexDirection:"row",position:"relative"},children:[Object(ae.jsxs)("div",{className:a.wrapper,children:[Object(ae.jsx)("div",{className:a.header,children:Object(ae.jsx)(g.a,{variant:"button",color:"textSecondary",children:n.cp_id})}),Object(ae.jsx)("div",{className:a.content,children:Object(ae.jsx)(g.a,{variant:"subtitle1",children:Object(ae.jsx)("span",{children:n.skipped?"skipped":null===(t=n.cp_code)||void 0===t?void 0:t.toUpperCase()})})})]}),Object(ae.jsx)("div",{className:a.deleteIcon,children:Object(ae.jsx)(B.a,{"aria-label":"delete",onClick:function(){return e=n.id,r({variables:{id:e}});var e},children:Object(ae.jsx)(A.a,{})})})]})},Pe=function(e){var t=e.checkpoints,n=e.max,c=Array(n).fill(n).map((function(e,t){return 1+t})).map((function(e){var n=t.find((function(t){return t.cp_id===e}));return!n||n.skipped?"...":n.cp_code}));return Object(ae.jsxs)(R.a,{mt:3,children:[Object(ae.jsx)(R.a,{minWidth:35,ml:1,mb:1,children:Object(ae.jsx)(g.a,{variant:"h6",children:"Solution:"})}),Object(ae.jsx)(R.a,{display:"flex",alignItems:"center",children:Object(ae.jsx)(R.a,{width:"100%",ml:1,children:c.join(" ")})})]})},We=["current","max"];function Re(e){var t=e.current,n=e.max,c=Object(Ce.a)(e,We),r=100*t/n;return Object(ae.jsxs)(R.a,{display:"flex",alignItems:"center",children:[Object(ae.jsx)(R.a,{width:"100%",mr:1,children:Object(ae.jsx)(je.a,Object(we.a)(Object(we.a)({variant:"determinate"},c),{},{value:r}))}),Object(ae.jsx)(R.a,{minWidth:35,children:Object(ae.jsxs)(g.a,{variant:"body2",color:"textSecondary",children:[t,"/",n]})})]})}var $e=Object(O.a)((function(e){return Object(v.a)({root:{flexGrow:1,padding:20},paper:{width:80},item:{padding:5},control:{padding:e.spacing(2)},addCheckpointButton:{position:"absolute",right:"1em",bottom:"1em"}})})),ze=function(e){var t=e.event,n=e.newCheckpointPath,c=t.checkpoints,r=d.a.useState(2),a=Object(f.a)(r,1)[0],i=$e();return Object(ae.jsxs)(R.a,{m:1,children:[Object(ae.jsx)(g.a,{variant:"h6",children:t.name}),Object(ae.jsx)(Re,{current:c.length,max:t.checkpoint_count}),c.length>0&&Object(ae.jsx)(Se.a,{container:!0,className:i.root,spacing:2,children:Object(ae.jsx)(Se.a,{item:!0,xs:12,children:Object(ae.jsx)(Se.a,{container:!0,justify:"flex-start",spacing:a,children:c.map((function(e){return Object(ae.jsx)(Se.a,{item:!0,className:i.item,children:Object(ae.jsx)(Ie.a,{className:i.paper,children:Object(ae.jsx)(Ne,{checkpoint:e,eventId:t.id})})},e.cp_id)}))})})}),Object(ae.jsx)(D.a,{className:i.addCheckpointButton,color:"primary","aria-label":"add",component:w.b,to:n,children:Object(ae.jsx)(M.a,{})}),Object(ae.jsx)(Ee,{scoredIds:c.map((function(e){return e.cp_id})),max:t.checkpoint_count}),Object(ae.jsx)(Pe,{checkpoints:c,max:t.checkpoint_count})]})},Be=function(){var e=Object(C.h)().id,t=ue(),n=de(),c=Object(H.a)(Y,{variables:{id:parseInt(e,10)},fetchPolicy:n?"cache-and-network":void 0,nextFetchPolicy:n?"cache-first":void 0}),r=c.loading,a=c.error,i=c.data,o=null===i||void 0===i?void 0:i.event;return r&&!i?Object(ae.jsx)("p",{children:"Loading..."}):Object(ae.jsxs)("div",{children:[Object(ae.jsx)(R.a,{px:1,py:2,children:Object(ae.jsxs)($.a,{"aria-label":"breadcrumb",children:[Object(ae.jsxs)(k.a,{color:"inherit",component:w.b,to:"/",className:t.link,children:[Object(ae.jsx)(F.a,{className:t.icon}),"Events"]}),Object(ae.jsx)(g.a,{color:"textPrimary",children:o.name})]})}),Object(ae.jsx)(he,{active:r}),a&&Object(ae.jsx)("p",{children:"Error :("}),Object(ae.jsx)(ze,{event:o,newCheckpointPath:"/events/".concat(o.id,"/add-checkpoint")})]})},De=n(82),Le=n(260),Me=n(270),Ue=n(54),Ae=n(133),Te=n.n(Ae),Fe=function(e,t,n){var c=t*(4*n)+4*e;return[c,c+1,c+2,c+3]},Qe=function(e,t,n){return n*e+t};var Ge=n(109);var qe=function(){return(qe=Object.assign||function(e){for(var t,n=1,c=arguments.length;n<c;n++)for(var r in t=arguments[n])Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r]);return e}).apply(this,arguments)},He=function(e,t,n,c){return new(n||(n=Promise))((function(r,a){function i(e){try{s(c.next(e))}catch(t){a(t)}}function o(e){try{s(c.throw(e))}catch(t){a(t)}}function s(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,o)}s((c=c.apply(e,t||[])).next())}))},Je=function(e,t){var n,c,r,a,i={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return a={next:o(0),throw:o(1),return:o(2)},"function"===typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function o(a){return function(o){return function(a){if(n)throw new TypeError("Generator is already executing.");for(;i;)try{if(n=1,c&&(r=2&a[0]?c.return:a[0]?c.throw||((r=c.return)&&r.call(c),0):c.next)&&!(r=r.call(c,a[1])).done)return r;switch(c=0,r&&(a=[2&a[0],r.value]),a[0]){case 0:case 1:r=a;break;case 4:return i.label++,{value:a[1],done:!1};case 5:i.label++,c=a[1],a=[0];continue;case 7:a=i.ops.pop(),i.trys.pop();continue;default:if(!(r=(r=i.trys).length>0&&r[r.length-1])&&(6===a[0]||2===a[0])){i=0;continue}if(3===a[0]&&(!r||a[1]>r[0]&&a[1]<r[3])){i.label=a[1];break}if(6===a[0]&&i.label<r[1]){i.label=r[1],r=a;break}if(r&&i.label<r[2]){i.label=r[2],i.ops.push(a);break}r[2]&&i.ops.pop(),i.trys.pop();continue}a=t.call(e,i)}catch(o){a=[6,o],c=0}finally{n=r=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,o])}}},Ke=function(e){var t=e.onRead,n=Object(l.useRef)(),c=Object(l.useRef)(),r=Object(l.useRef)(),a=Object(l.useState)(null),i=a[0],o=a[1];return c.current||(c.current=document.createElement("canvas")),Object(l.useEffect)((function(){return Object(Ge.a)().then((function(e){return n.current=e})),function(){n.current&&n.current.terminate()}}),[n]),Object(l.useEffect)((function(){var e=!1,t=function(){e=!0,i&&i.getTracks().forEach((function(e){e.stop()}))};if(i)return t;var n=r.current;var c=navigator.mediaDevices.getSupportedConstraints();return navigator.mediaDevices.getUserMedia({audio:!1,video:qe({width:{exact:320},height:{exact:240}},c.facingMode?{facingMode:"environment"}:{})}).then((function(t){e||(o(t),n.srcObject=t)})).catch((function(t){e||console.log("navigator.MediaDevices.getUserMedia error: ",t)})),t}),[i,r]),Object(l.useEffect)((function(){var e=setInterval((function(){return He(void 0,void 0,void 0,(function(){var e,a,i,o,s;return Je(this,(function(l){switch(l.label){case 0:return e=c.current,0===(a=r.current).videoWidth||0===a.videoHeight?[2]:(e.width=a.videoWidth,e.height=a.videoHeight,(i=e.getContext("2d")).drawImage(a,0,0,e.width,e.height),function(e){for(var t=e.canvas,n=t.width,c=t.height,r=e.getImageData(0,0,n,c),a=r.data,i=[],o=0;o<n;o++)for(var s=0;s<c;s++){var l=Fe(o,s,n),d=l[0],u=l[1],j=l[2],b=a[d],h=a[u],p=a[j],f=Math.ceil(b+h+p)/3;i.push(f)}var O=Te()(i),v=i.map((function(e){return e>O}));for(o=0;o<n;o++)for(s=0;s<c;s++){var x=Qe(o,s,c),m=Fe(o,s,n),g=(d=m[0],u=m[1],j=m[2],m[3]);v[x]?(a[d]=255,a[u]=255,a[j]=255,a[g]=255):(a[d]=0,a[u]=0,a[j]=0,a[g]=255)}e.putImageData(r,0,0)}(i),n.current?[4,Object(Ge.b)(n.current,e.toDataURL())]:[2]);case 1:return o=l.sent(),(s=function(e){var t=e.match(/([0-9]{1,2})\s+(.{3})/);return t?{id:parseInt(t[1],10),code:t[2]}:null}(o))&&t(s),[2]}}))}))}),1e3);return function(){clearInterval(e)}}),[c,r]),l.createElement("div",{style:{width:300,height:225,overflow:"hidden"}},l.createElement("video",{playsInline:!0,autoPlay:!0,ref:r,style:{width:"100%",height:"calc(var(--width) * 0.75)"}}))},Ve=Object(O.a)((function(e){return Object(v.a)({margin:{margin:e.spacing(1)}})})),Xe=function(){var e=Object(l.useState)(!1),t=Object(f.a)(e,2),n=t[0],c=t[1],r=Object(l.useState)(null),a=Object(f.a)(r,2),i=a[0],o=a[1],s=Object(C.h)().id,d=Object(C.f)(),u=Object(J.a)(ee,{refetchQueries:["getEvent"],awaitRefetchQueries:!0,onCompleted:function(e){d.push("/events/".concat(e.createCheckpoint.checkpoint.event_id))}}),j=Object(f.a)(u,2),b=j[0],h=j[1],p=h.loading,O=h.error,v=Ve();return p?Object(ae.jsx)("p",{children:"Loading..."}):O?Object(ae.jsx)("p",{children:"Error :("}):Object(ae.jsx)(ke.b,{onSubmit:function(e){try{return b({variables:{eventId:parseInt(s,10),cpId:parseInt(e.cpId,10),cpCode:e.cpCode,skipped:e.skipped,skipReason:e.skipReason}})}catch(t){return t?t.message&&t.message.startsWith("Checkpoint")?{id:"Id already taken"}:Object(De.a)({},Ue.a,t.message||t):Object(De.a)({},Ue.a,"Something went wrong")}},initialValues:{skipped:!1},render:function(e){var t=e.values,r=e.submitError,a=e.handleSubmit;return t.skipped&&delete t.cpCode,Object(ae.jsxs)("form",{onSubmit:a,children:[r&&Object(ae.jsx)("div",{className:"error",children:r}),Object(ae.jsx)(ke.a,{name:"cpId",render:function(e){var t=e.input,n=e.meta;return Object(ae.jsxs)("div",{className:v.margin,children:[Object(ae.jsx)(xe.a,Object(we.a)(Object(we.a)({},t),{},{label:"Id",required:!0,autoComplete:"off"})),n.touched&&(n.error||n.submitError)&&Object(ae.jsx)("span",{children:n.error||n.submitError})]})}}),Object(ae.jsx)(ke.a,{name:"cpCode",render:function(e){var n=e.input,c=e.meta;return Object(ae.jsxs)("div",{className:v.margin,children:[Object(ae.jsx)(xe.a,Object(we.a)(Object(we.a)({},n),{},{label:"Code",required:!t.skipped,disabled:t.skipped,autoComplete:"off"})),c.touched&&(c.error||c.submitError)&&Object(ae.jsx)("span",{children:c.error||c.submitError})]})}}),Object(ae.jsx)(ke.a,{name:"skipped",type:"checkbox",render:function(e){var t=e.input;e.meta;return Object(ae.jsx)(R.a,{display:"flex",alignItems:"center",ml:1,children:Object(ae.jsx)(Le.a,{control:Object(ae.jsx)(Me.a,Object(we.a)(Object(we.a)({},t),{},{checked:t.value,name:"skipped",color:"primary"})),label:"Skip"})})}}),Object(ae.jsx)("div",{style:{marginTop:16,marginBottom:16,width:300,height:225},children:n?Object(ae.jsxs)("div",{style:{position:"relative"},children:[Object(ae.jsx)(Ke,{onRead:function(e){o(e)}}),Object(ae.jsx)(ge.a,{variant:"contained",color:"secondary",onClick:function(){return c(!1)},style:{position:"absolute",bottom:0,right:0},children:"Cancel"})]}):Object(ae.jsx)("div",{style:{width:300,height:225,background:"grey",display:"flex",alignItems:"center",justifyContent:"center"},children:Object(ae.jsx)(ge.a,{variant:"contained",color:"secondary",onClick:function(){return c(!0)},children:"Scan"})})}),i&&Object(ae.jsxs)("div",{children:[i.id," - ",i.code]}),Object(ae.jsx)(ge.a,{variant:"contained",color:"primary",type:"submit",children:"Submit"})]})}})},Ye=n(274),Ze=n(135),et=n.n(Ze),tt=Object(l.createContext)(null),nt=function(){var e=Object(l.useContext)(tt),t=Object(l.useState)(!1),n=Object(f.a)(t,2),c=n[0],r=n[1],a=Object(l.useState)(null),i=Object(f.a)(a,2),o=i[0],s=i[1];Object(l.useEffect)((function(){if(e){var t=function(e){s(e)};return e.onUpdate(t),function(){e.offUpdate(t)}}}),[e]);var u=function(){s(null)};return Object(ae.jsx)(Ye.a,{anchorOrigin:{vertical:"top",horizontal:"right"},open:Boolean(o),onClose:u,message:"A new version of the app is available!",action:Object(ae.jsxs)(d.a.Fragment,{children:[Object(ae.jsx)(ge.a,{color:"secondary",size:"small",onClick:function(){if(o){r(!0);var e=o.waiting;e&&(e.postMessage({type:"SKIP_WAITING"}),e.addEventListener("statechange",(function(e){var t=e.target?e.target:null;"activated"===(null===t||void 0===t?void 0:t.state)&&window.location.reload()})))}},disabled:c,children:"RELOAD"}),Object(ae.jsx)(B.a,{size:"small","aria-label":"close",color:"inherit",onClick:u,children:Object(ae.jsx)(et.a,{fontSize:"small"})})]})})},ct=n(110),rt=function(){return Object(S.a)({uri:"https://woodtime-api.ertrzyiks.me/woodtime"})},at=Object(O.a)((function(e){return Object(v.a)({root:{flexGrow:1},menuButton:{marginRight:e.spacing(2)},title:{flexGrow:1},loaderWrapper:{alignItems:"center",width:"100%",height:"100%",justifyContent:"center",display:"flex"}})}));var it=function(){var e=Object(l.useState)(null),t=Object(f.a)(e,2),n=t[0],c=t[1],r=at();return Object(l.useEffect)((function(){function e(){return(e=Object(p.a)(h.a.mark((function e(){var t;return h.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=new I.a,e.next=3,Object(ct.b)({cache:t,storage:new ct.a(window.localStorage)});case 3:c(new E.a({cache:t,link:rt()}));case 4:case"end":return e.stop()}}),e)})))).apply(this,arguments)}(function(){return e.apply(this,arguments)})().catch(console.error)}),[c]),Object(ae.jsxs)(w.a,{basename:"",children:[Object(ae.jsx)(nt,{}),Object(ae.jsxs)(le,{children:[Object(ae.jsx)(x.a,{position:"static",children:Object(ae.jsx)(m.a,{children:Object(ae.jsx)(g.a,{variant:"h6",className:r.title,children:Object(ae.jsx)(k.a,{component:w.b,to:"/",color:"inherit",children:"Woodtime"})})})}),n?Object(ae.jsx)(_.a,{client:n,children:Object(ae.jsxs)(C.c,{children:[Object(ae.jsx)(C.a,{path:"/",exact:!0,children:Object(ae.jsx)(Oe,{})}),Object(ae.jsxs)(C.a,{path:"/events/new",exact:!0,children:[Object(ae.jsx)(Oe,{}),Object(ae.jsx)(ye,{})]}),Object(ae.jsx)(C.a,{path:"/events/:id",exact:!0,children:Object(ae.jsx)(Be,{})}),Object(ae.jsx)(C.a,{path:"/events/:id/add-checkpoint",exact:!0,children:Object(ae.jsx)(Xe,{})})]})}):Object(ae.jsx)("div",{className:r.loaderWrapper,children:Object(ae.jsx)(y.a,{})})]})]})},ot=Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));function st(e,t){navigator.serviceWorker.register(e).then((function(e){e.onupdatefound=function(){var n=e.installing;null!=n&&(n.onstatechange=function(){"installed"===n.state&&(navigator.serviceWorker.controller?(console.log("New content is available and will be used when all tabs for this page are closed. See https://cra.link/PWA."),t&&t.onUpdate&&t.onUpdate(e)):(console.log("Content is cached for offline use."),t&&t.onSuccess&&t.onSuccess(e)))})}})).catch((function(e){console.error("Error during service worker registration:",e)}))}var lt=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,279)).then((function(t){var n=t.getCLS,c=t.getFID,r=t.getFCP,a=t.getLCP,i=t.getTTFB;n(e),c(e),r(e),a(e),i(e)}))},dt=[],ut=[],jt=function(e){var t=e.children,n={onSuccess:function(e){return dt.push(e)},offSuccess:function(e){return dt.filter((function(t){return t!==e}))},onUpdate:function(e){return ut.push(e)},offUpdate:function(e){return ut.filter((function(t){return t!==e}))}};return Object(ae.jsx)(tt.Provider,{value:n,children:t})};j.a.render(Object(ae.jsx)(d.a.StrictMode,{children:Object(ae.jsx)(jt,{children:Object(ae.jsx)(it,{})})}),document.getElementById("root")),function(e){if("serviceWorker"in navigator){if(new URL("",window.location.href).origin!==window.location.origin)return;window.addEventListener("load",(function(){var t="".concat("","/service-worker.js");ot?(!function(e,t){fetch(e,{headers:{"Service-Worker":"script"}}).then((function(n){var c=n.headers.get("content-type");404===n.status||null!=c&&-1===c.indexOf("javascript")?navigator.serviceWorker.ready.then((function(e){e.unregister().then((function(){window.location.reload()}))})):st(e,t)})).catch((function(){console.log("No internet connection found. App is running in offline mode.")}))}(t,e),navigator.serviceWorker.ready.then((function(){console.log("This web app is being served cache-first by a service worker. To learn more, visit https://cra.link/PWA")}))):st(t,e)}))}}({onUpdate:function(e){ut.forEach((function(t){return t(e)}))},onSuccess:function(){dt.forEach((function(e){return e()}))}}),lt()}},[[202,1,2]]]);
//# sourceMappingURL=main.9da133c9.chunk.js.map