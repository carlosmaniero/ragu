(()=>{var e={851:(e,t,a)=>{var n=a(837),r=a(958);e.exports.default=(r.default||r)(n.default||n)},446:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>n});const n=a.p+"abe08b70f7be7f400a7a953ec3f69468.png"},125:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>n});const n=a.p+"8e8b085f628be5cb84ec8ddb9e396305.png"},594:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>n});const n=a.p+"515acdd246559ae4e8e2e729dce9b65f.png"},3:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>n});const n={"dev-background":"_1CntSi9u-0A4hEzRhCsAKS",devBackground:"_1CntSi9u-0A4hEzRhCsAKS","main-features":"ziPm5ILafEb9q2iDApp4l",mainFeatures:"ziPm5ILafEb9q2iDApp4l","main-title":"ZxwMeEIkUBTIpR_nZiyOH",mainTitle:"ZxwMeEIkUBTIpR_nZiyOH",concept:"_1aKxNBfjlg6PRcEjVb9W-D","concept-content":"_10eSVb--ubFFggdIG46hD8",conceptContent:"_10eSVb--ubFFggdIG46hD8","feature-title-box":"_1InIjMRKMZegz9o2AaziiR",featureTitleBox:"_1InIjMRKMZegz9o2AaziiR","feature-title-box-icon":"_30WfJlu_MKNkR-9wvmMFar",featureTitleBoxIcon:"_30WfJlu_MKNkR-9wvmMFar"}},958:e=>{e.exports=e=>({hydrate:function(e,t,a){this.render(e,t,a)},render:function(t,a,n){t.raguSimpleAdapterData=e({element:t,params:a,state:n,isServer:!1}),t.raguSimpleAdapterData&&(t.raguSimpleAdapterData.html&&(t.innerHTML=t.raguSimpleAdapterData.html),t.raguSimpleAdapterData.connectedCallback&&t.raguSimpleAdapterData.connectedCallback())},disconnect:function(e){e.raguSimpleAdapterData&&e.raguSimpleAdapterData.disconnectedCallback&&e.raguSimpleAdapterData.disconnectedCallback(),delete e.raguSimpleAdapterData}})},837:function(e,t,a){"use strict";var n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});var r=n(a(3)),i=n(a(594)),o=n(a(446)),d=n(a(125)),l=function(e){var t=e.title,a=e.text,n=e.icon;return'\n  <section class="'+r.default.concept+'">\n    <div class="'+r.default.featureTitleBox+'">\n      <div class="'+r.default.featureTitleBoxIcon+'"><img src="'+n+'" width="80px"></div>\n      <h2>'+t+'</h2>\n    </div>\n    \n    <div class="'+r.default.conceptContent+'">\n      '+a+"\n    </div>\n  </section>\n"};t.default=function(e){var t,a;return{html:(t=e.params,a='\n    <div class="'+r.default.mainFeatures+'">\n      <h1 class="'+r.default.mainTitle+'">Core Concepts</h1>\n      \n      <div>\n        '+l({icon:i.default,title:"Server Side Rendering",text:"\n            <p>Ragu micro-frontends can be rendered at the server side improving the user experience and the load time.</p>\n\n            <p>Every micro-frontend has its own endpoint witch can be used to pre-fetch micro-frontends.</p>\n          "})+"\n        "+l({icon:o.default,title:"Build System",text:"\n            <p>Ragu Server comes with a build system on top of webpack.</p>\n\n            <p>There are adapters listed above that makes the integration with your favorite framework more straightforward.</p>\n          "})+"\n        "+l({icon:d.default,title:"Coupleless Integration",text:"\n            <p>Sharing code across projects using a npm package is hard to manage and requires a project build to apply changes.</p>\n\n            <p>Ragu enables independent deployment extending the concept of micro-services to the front-end.</p>\n          "})+"\n      </div>\n    </div>\n  ","dev"===t.env?'\n      <style>\n        body { margin: 0 }\n      </style>\n      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300&family=Poppins:wght@300;500&display=swap&family=Source+Code+Pro:wght@1;300" rel="stylesheet">\n\n      <div class="'+r.default.devBackground+'">'+a+"</div>\n    ":a)}}}},t={};function a(n){var r=t[n];if(void 0!==r)return r.exports;var i=t[n]={exports:{}};return e[n].call(i.exports,i,i.exports,a),i.exports}a.d=(e,t)=>{for(var n in t)a.o(t,n)&&!a.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),a.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.p="https://ragu-framework.github.io/ragu/compiled/client-side/";var n=a(851);window["main-features-mfe_main-features-mfe"]=n})();