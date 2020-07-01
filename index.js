(function () {var a={data:function(){return{loading:!0,error:null,connected:{status:!1,text:"Account Connected!",icon:"check"},active:{key:"today",title:"Today"},admin:!1,account:null,report:null,filters:!1,refresh:!1}},props:{headline:String,hideHeadline:Boolean,hideConnect:Boolean,hideLastUpdated:Boolean,defaults:{type:Object,required:!0},cache:Object,params:{type:Object,required:!0}},computed:{currency:function(){return null!=this.defaults&&this.defaults.currency||"USD"},getReport:function(){if(null!=this.report){var e=["0","0","0.00","0.00"];if(null==this.report.rows)this.report.rows=[e];else for(var t=0;t<this.report.rows[0].length;t++)null==this.report.rows[0][t]&&(this.report.rows[0][t]=e[t]);return{empty:!1,response:this.report}}return{empty:!0}},dropdown:function(){var e=!1,t=!1,i=!1,n=!1;return null!=this.cache.refresh&&(this.cache.refresh.includes("clearActive")&&(t=!0),this.cache.refresh.includes("clearAll")&&(i=!0),this.cache.refresh.includes("hidden")&&(n=!0),t&&i&&(e=!0)),{enabled:e,clearActive:t,clearAll:i,hidden:n}}},created:function(){var e=this;this.load().then(function(t){if(e.connected.status=t.connected,e.admin=t.admin,e.account=t.account,e.defaults=t.defaults,e.filters=t.filters,e.cache=t.cache,e.params=t.params,null===localStorage.getItem("active")){var i=Object.keys(t.defaults),n=Object.keys(t.params);i.includes("active")&&n.includes(e.active.key)?localStorage.setItem("active",e.active.key):(e.active.key=n[0],localStorage.setItem("active",e.active.key))}else e.active.key=localStorage.getItem("active")})},methods:{connect:function(){this.$api.get("plugin/adsense/auth").then(function(e){window.location.href=e.redirect})},disconnect:function(){this.$api.get("plugin/adsense/disconnect").then(function(e){window.location.href=e.redirect})},fetch:function(){var e=this;this.loading=!0,this.$api.get("plugin/adsense/report",this.config(this.params[this.active.key])).then(function(t){e.report=t,null==e.report&&(e.error={message:"Error has occurred. Failed to fetch data."})}).catch(function(t){e.error=t,console.log(t)}).finally(function(){e.loading=!1})},clear:function(e){var t=this;this.loading=!0,this.$api.get("plugin/adsense/cache/clear",{method:e,filters:this.filters,active:this.$options.filters.fileName(this.active.title)}).then(function(e){t.$store.dispatch("notification/open",{type:"success",message:"Cache Cleared!",timeout:2e3}),t.fetch()}).catch(function(e){t.error=e,console.log(e.message)})},handler:function(e,t){this.loading=!0,this.active.key=t,localStorage.setItem("active",this.active.key),this.connected.status?(this.fetch(),this.$store.dispatch("notification/open",{type:"success",message:"Refreshing Data!",timeout:1500})):this.loading=!1},mouseover:function(){this.connected.text="Disconnect Account",this.connected.icon="remove"},mouseleave:function(){this.connected.text="Account Connected!",this.connected.icon="check"},config:function(e){this.refresh=!!this.cache.autoRefresh.includes(this.active.key);var t={file_name:this.$options.filters.fileName(e.name),account_id:this.account,start_date:e.startDate,end_date:e.endDate,filters:this.filters,cache:this.cache.disabled,refresh:this.refresh,interval:this.cache.autoRefreshInterval};return t}},updated:function(){this.$nextTick(function(){this.connected.status&&this.getReport.empty&&this.loading&&this.fetch(),this.active.title=this.params[this.active.key].name})},filters:{nameFormat:function(e){return e?(e=e.replace(/_/g," ").toLowerCase()).charAt(0).toUpperCase()+e.slice(1):""},numberFormat:function(e){return e?(e=e.toString()).replace(/\B(?=(\d{3})+(?!\d))/g,","):""},fileName:function(e){return e.replace(/ /g,"_").toLowerCase()}}};if(typeof a==="function"){a=a.options}Object.assign(a,function(){var render=function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c("div",{staticClass:"analytics-overview"},[!_vm.hideHeadline?_c("div",{staticClass:"analytics-overview-headline"},[_c("k-headline",[_vm._v(_vm._s(_vm.headline||"Google AdSense Analytics"))])],1):_vm._e(),_vm._v(" "),_c("div",{staticClass:"analytics-overview-top"},[_c("div",{staticClass:"selection scroll"},_vm._l(_vm.params,function(date_range,index){return _c("div",{class:["analytics-date-range",{active:index==_vm.active.key}],on:{"click":function($event){return _vm.handler(date_range,index)}}},[_vm._v(_vm._s(date_range.name))])}),0),_vm._v(" "),_vm.cache!=null?_c("div",{staticClass:"refresh-button-container"},[!_vm.cache.disabled&&!_vm.dropdown.hidden?_c("div",[_vm.dropdown.enabled?_c("k-dropdown",[_c("k-button",{staticClass:"refresh-button",attrs:{"icon":"undo"},on:{"click":function($event){return _vm.$refs.cache_dropdown.toggle()}}},[_vm._v("Refresh")]),_vm._v(" "),_c("k-dropdown-content",{ref:"cache_dropdown",attrs:{"align":"right"}},[_c("k-dropdown-item",{staticClass:"refresh-active",attrs:{"icon":"refresh"},on:{"click":function($event){return _vm.clear("clear_active")}}},[_vm._v("Refresh "+_vm._s(this.active.title))]),_vm._v(" "),_c("k-dropdown-item",{staticClass:"refresh-all",attrs:{"icon":"layers"},on:{"click":function($event){return _vm.clear("clear_all")}}},[_vm._v("Clear All")])],1)],1):_vm._e(),_vm._v(" "),!_vm.dropdown.enabled&&_vm.dropdown.clearActive?_c("k-button",{staticClass:"refresh-button",attrs:{"icon":"refresh"},on:{"click":function($event){_vm.cache.prompt?_vm.$refs.refresh_prompt.open():_vm.clear("clear_active")}}},[_vm._v("Refresh")]):_vm._e(),_vm._v(" "),!_vm.dropdown.enabled&&_vm.dropdown.clearAll?_c("k-button",{staticClass:"refresh-button",on:{"click":function($event){_vm.cache.prompt?_vm.$refs.refresh_prompt.open():_vm.clear("clear_all")}}},[_vm._v("Clear Cache")]):_vm._e(),_vm._v(" "),_c("k-dialog",{ref:"refresh_prompt",staticClass:"refresh-prompt"},[[!_vm.dropdown.enabled&&_vm.dropdown.clearActive?_c("k-text",[_vm._v("Are you sure you want to refresh "),_c("strong",[_vm._v(_vm._s(_vm.active.title))]),_vm._v("?")]):_vm._e(),_vm._v(" "),!_vm.dropdown.enabled&&_vm.dropdown.clearAll?_c("k-text",[_vm._v("Are you sure you want to clear all cache?")]):_vm._e()],_vm._v(" "),_c("template",{slot:"footer"},[_c("k-button-group",[_c("k-button",{attrs:{"icon":"times"},on:{"click":function($event){return _vm.$refs.refresh_prompt.close()}}},[_vm._v("Cancel")]),_vm._v(" "),!_vm.dropdown.enabled&&_vm.dropdown.clearActive?_c("k-button",{attrs:{"icon":"undo","theme":"negative"},on:{"click":function($event){return _vm.clear("clear_active")}}},[_vm._v("Refresh")]):_vm._e(),_vm._v(" "),!_vm.dropdown.enabled&&_vm.dropdown.clearAll?_c("k-button",{attrs:{"icon":"trash","theme":"negative"},on:{"click":function($event){return _vm.clear("clear_all")}}},[_vm._v("Clear All")]):_vm._e()],1)],1)],2)],1):_vm._e()]):_vm._e()]),_vm._v(" "),_c("div",{staticClass:"analytics-overview-container"},[_c("div",{staticClass:"analytics-overview-block"},[_c("div",{staticClass:"top"},[!_vm.getReport.empty?_c("h5",[_vm._v(_vm._s(_vm._f("nameFormat")(_vm.getReport.response.headers[0].name)))]):_c("h5",[_vm._v("Page views")]),_vm._v(" "),_c("div",{staticClass:"big-number"},[_vm.loading?_c("span",[_c("span",{staticClass:"loader"})]):!_vm.getReport.empty?_c("span",[_vm._v(_vm._s(_vm._f("numberFormat")(_vm.getReport.response.rows[0][0])))]):_c("span",[_vm._v("0")])]),_vm._v(" "),_c("div",{staticClass:"details"},[_vm._v("total page views currently")])])]),_vm._v(" "),_c("div",{staticClass:"analytics-overview-block"},[_c("div",{staticClass:"top"},[!_vm.getReport.empty?_c("h5",[_vm._v(_vm._s(_vm._f("nameFormat")(_vm.getReport.response.headers[1].name)))]):_c("h5",[_vm._v("Clicks")]),_vm._v(" "),_c("div",{staticClass:"big-number"},[_vm.loading?_c("span",[_c("span",{staticClass:"loader"})]):!_vm.getReport.empty?_c("span",[_vm._v(_vm._s(_vm._f("numberFormat")(_vm.getReport.response.rows[0][1])))]):_c("span",[_vm._v("0")])]),_vm._v(" "),_c("div",{staticClass:"details"},[_vm._v("number of advert clicks recieved")])])]),_vm._v(" "),_c("div",{staticClass:"analytics-overview-block"},[_c("div",{staticClass:"top"},[!_vm.getReport.empty?_c("h5",[_vm._v(_vm._s(_vm._f("nameFormat")(_vm.getReport.response.headers[2].name)))]):_c("h5",[_vm._v("Cost per click")]),_vm._v(" "),_c("div",{staticClass:"big-number"},[_vm.loading?_c("span",[_c("span",{staticClass:"loader"})]):!_vm.getReport.empty?_c("span",[_vm._v(_vm._s(_vm._f("numberFormat")(_vm.getReport.response.rows[0][2])))]):_c("span",[_vm._v("0.00")])]),_vm._v(" "),_c("div",{staticClass:"details"},[_vm._v("average payment for each click")])])]),_vm._v(" "),_c("div",{staticClass:"analytics-overview-block"},[_c("div",{staticClass:"top"},[!_vm.getReport.empty?_c("h5",[_vm._v(_vm._s(_vm._f("nameFormat")(_vm.getReport.response.headers[3].name)))]):_c("h5",[_vm._v("Earnings")]),_vm._v(" "),_c("div",{staticClass:"big-number"},[_vm.loading?_c("span",[_c("span",{staticClass:"loader"})]):!_vm.getReport.empty?_c("span",[_vm._v(_vm._s(_vm._f("numberFormat")(_vm.getReport.response.rows[0][3])))]):_c("span",[_vm._v("0.00")])]),_vm._v(" "),_c("div",{staticClass:"details"},[_vm._v("overall amount earned so far")])]),_vm._v(" "),_c("div",{staticClass:"currency"},[_c("span",[_vm._v(_vm._s(_vm.currency))])])])]),_vm._v(" "),_vm.error!==null?_c("div",{staticClass:"analytics-overview-error"},[_c("k-box",{attrs:{"theme":"negative"},domProps:{"innerHTML":_vm._s(_vm.error.message)}})],1):_c("div",{staticClass:"analytics-overview-bottom"},[!_vm.hideConnect&&_vm.admin?_c("div",{staticClass:"connect-button"},[!_vm.connected.status?_c("k-button",{attrs:{"icon":"add"},on:{"click":_vm.connect}},[_vm._v("Connect Account")]):_c("k-button",{staticClass:"connected",attrs:{"icon":_vm.connected.icon},on:{"mouseover":_vm.mouseover,"mouseleave":_vm.mouseleave,"click":_vm.disconnect}},[_vm._v(_vm._s(_vm.connected.text))])],1):_vm._e(),_vm._v(" "),!_vm.getReport.empty&&!_vm.hideLastUpdated?_c("div",{staticClass:"last-updated"},[_c("span",[_vm._v("Last Updated: "+_vm._s(_vm.getReport.response.prettyDate)+" at "+_vm._s(_vm.getReport.response.timeCreated))])]):_vm._e()])])};var staticRenderFns=[];return{render:render,staticRenderFns:staticRenderFns,_compiled:true,_scopeId:null,functional:undefined}}());panel.plugin("ashhhbradley/adsense",{sections:{adsense:a}});})();