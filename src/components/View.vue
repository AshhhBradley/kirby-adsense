<template>
	<div class="analytics-overview">
		<div v-if="!hideHeadline" class="analytics-overview-headline">
			<k-headline>{{ headline || 'Google AdSense Analytics' }}</k-headline>
		</div>

		<div class="analytics-overview-top">
			<div class="selection scroll">
				<div v-for="(date_range, index) in params" :class="['analytics-date-range', {active: index == active.key}]" @click="handler(date_range, index)">{{ date_range.name }}</div>
			</div>

			<div v-if="cache != null" class="refresh-button-container">
				<div v-if="!cache.disabled && !dropdown.hidden">
					<k-dropdown v-if="dropdown.enabled">
						<k-button class="refresh-button" @click="$refs.cache_dropdown.toggle()" icon="undo">Refresh</k-button>
						<k-dropdown-content ref="cache_dropdown" align="right">
							<k-dropdown-item class="refresh-active" icon="refresh" @click="clear('clear_active')">Refresh {{ this.active.title }}</k-dropdown-item>
							<k-dropdown-item class="refresh-all" icon="layers" @click="clear('clear_all')">Clear All</k-dropdown-item>
						</k-dropdown-content>
					</k-dropdown>

					<k-button class="refresh-button" v-if="!dropdown.enabled && dropdown.clearActive" icon="refresh" @click="cache.prompt ? $refs.refresh_prompt.open() : clear('clear_active')">Refresh</k-button>
					<k-button class="refresh-button" v-if="!dropdown.enabled && dropdown.clearAll" @click="cache.prompt ? $refs.refresh_prompt.open() : clear('clear_all')">Clear Cache</k-button>

					<k-dialog class="refresh-prompt" ref="refresh_prompt">
						<template>
							<k-text v-if="!dropdown.enabled && dropdown.clearActive">Are you sure you want to refresh <strong>{{active.title}}</strong>?</k-text>
							<k-text v-if="!dropdown.enabled && dropdown.clearAll">Are you sure you want to clear all cache?</k-text>
						</template>

						<template slot="footer">
							<k-button-group>
								<k-button icon="times" @click="$refs.refresh_prompt.close()">Cancel</k-button>
								<k-button v-if="!dropdown.enabled && dropdown.clearActive" icon="undo" theme="negative" @click="clear('clear_active')">Refresh</k-button>
								<k-button v-if="!dropdown.enabled && dropdown.clearAll" icon="trash" theme="negative" @click="clear('clear_all')">Clear All</k-button>
							</k-button-group>
						</template>
					</k-dialog>
				</div>
			</div>
		</div>

		<div class="analytics-overview-container">
			<div class="analytics-overview-block">
				<div class="top">
					<h5 v-if="!getReport.empty">{{ getReport.response.headers[0].name | nameFormat }}</h5>
					<h5 v-else>Page views</h5>
					<div class="big-number">
						<span v-if="loading"><span class="loader"></span></span>
						<span v-else-if="!getReport.empty">{{ getReport.response.rows[0][0] | numberFormat }}</span>
						<span v-else>0</span>
					</div>
					<div class="details">total page views currently</div>
				</div>
			</div>
      <div class="analytics-overview-block">
				<div class="top">
					<h5 v-if="!getReport.empty">{{ getReport.response.headers[1].name | nameFormat }}</h5>
					<h5 v-else>Clicks</h5>
					<div class="big-number">
						<span v-if="loading"><span class="loader"></span></span>
						<span v-else-if="!getReport.empty">{{ getReport.response.rows[0][1] | numberFormat }}</span>
						<span v-else>0</span>
					</div>
					<div class="details">number of advert clicks recieved</div>
				</div>
			</div>
      <div class="analytics-overview-block">
				<div class="top">
					<h5 v-if="!getReport.empty">{{ getReport.response.headers[2].name | nameFormat }}</h5>
					<h5 v-else>Cost per click</h5>
					<div class="big-number">
						<span v-if="loading"><span class="loader"></span></span>
						<span v-else-if="!getReport.empty">{{ getReport.response.rows[0][2] | numberFormat }}</span>
						<span v-else>0.00</span>
					</div>
					<div class="details">average payment for each click</div>
				</div>
			</div>
      <div class="analytics-overview-block">
				<div class="top">
					<h5 v-if="!getReport.empty">{{ getReport.response.headers[3].name | nameFormat }}</h5>
					<h5 v-else>Earnings</h5>
					<div class="big-number">
						<span v-if="loading"><span class="loader"></span></span>
						<span v-else-if="!getReport.empty">{{ getReport.response.rows[0][3] | numberFormat }}</span>
						<span v-else>0.00</span>
					</div>
					<div class="details">overall amount earned so far</div>
				</div>
				<div class="currency"><span>{{ currency }}</span></div>
			</div>
		</div>

		<div v-if="error !== null" class="analytics-overview-error">
			<k-box theme="negative" v-html="error.message"></k-box>
    </div>
    <div v-else class="analytics-overview-bottom">
			<div v-if="!hideConnect && admin" class="connect-button">
		    <k-button v-if="!connected.status" icon="add" @click="connect">Connect Account</k-button>
				<k-button v-else class="connected" :icon="connected.icon" v-on:mouseover="mouseover" v-on:mouseleave="mouseleave" @click="disconnect">{{ connected.text }}</k-button>
			</div>
			<div v-if="!getReport.empty && !hideLastUpdated" class="last-updated">
				<span>Last Updated: {{ getReport.response.prettyDate }} at {{ getReport.response.timeCreated }}</span>
			</div>
    </div>

	</div>
</template>

<script>
export default {
	data() {
		return {
			loading: true,
			error: null,
			connected: {
				status: false,
				text: 'Account Connected!',
				icon: 'check',
			},
			active: {
				key: 'today',
				title: 'Today',
			},
			admin: false,
			account: null,
			report: null,
			filters: false,
			refresh: false,
		}
	},
  props: {
		headline: String,
		hideHeadline: Boolean,
		hideConnect: Boolean,
		hideLastUpdated: Boolean,
		defaults: {
      type: Object,
      required: true
    },
		cache: Object,
		params: {
      type: Object,
      required: true
    },
  },
	computed: {
		currency() {
			return (this.defaults != null ? this.defaults.currency || 'USD' : 'USD');
		},
		getReport() {
			let default_report = {
				rows: [ ["0", "0", "0.00", "0.00"] ]
			};

			if (this.report != null) {
				var default_rows = default_report.rows[0];
				if (this.report.rows == null) {
					this.report.rows = [default_rows];
				} else {
					for (var i = 0; i < this.report.rows[0].length; i++) {
						if (this.report.rows[0][i] == null) this.report.rows[0][i] = default_rows[i];
					}
				}
				return {
					empty: false,
					response: this.report,
				}
			} else {
				return {
					empty: true,
				}
			}
		},
		dropdown() {
			var enabled = false, clearActive = false, clearAll = false, hidden = false;

			if (this.cache.refresh != null) {
				if (this.cache.refresh.includes('clearActive')) clearActive = true;
				if (this.cache.refresh.includes('clearAll')) clearAll = true;
				if (this.cache.refresh.includes('hidden')) hidden = true;
				if (clearActive && clearAll) enabled = true;
			}

			return {
				enabled: enabled,
				clearActive: clearActive,
				clearAll: clearAll,
				hidden: hidden,
			}
		}
	},
	created() {
		this.load().then(response => {
			this.connected.status = response.connected;
			this.admin = response.admin;
			this.account = response.account;
			this.defaults = response.defaults;
			this.filters = response.filters;
			this.cache = response.cache;
			this.params = response.params;

			// check if localStorage value does not exist
			if (localStorage.getItem("active") === null) {
				var defaults_keys = Object.keys(response.defaults);
				var params_keys = Object.keys(response.params);

				// check if defaults includes valid active key and value, if it does then set it as active
				if (defaults_keys.includes('active') && params_keys.includes(this.active.key)) {
					localStorage.setItem('active', this.active.key);
				}
				// if defaults.active is not set or value is not found in params, set active as first available option
				else {
					this.active.key = params_keys[0];
					localStorage.setItem('active', this.active.key);
				}
			// otherwise if localStorage value does exist, set it as the active date range
			}	else {
				this.active.key = localStorage.getItem("active");
			}

		});
	},
  methods: {
    connect() {
      this.$api
        .get('plugin/adsense/auth')
        .then(response => {
          window.location.href = response.redirect;
        });
    },
		disconnect() {
			this.$api
				.get('plugin/adsense/disconnect')
				.then(response => {
					window.location.href = response.redirect;
				});
		},
		fetch() {
			this.loading = true;

			this.$api
				.get('plugin/adsense/report', this.config(this.params[this.active.key]))
				.then(response => {
					this.report = response;
					if (this.report == null) this.error = { message: 'Error has occurred. Failed to fetch data.' };
				})
				.catch(error => {
					this.error = error;
	        console.log(error);
		    })
				.finally(() => {
					this.loading = false;
				});
		},
		clear: function(method) {
			this.loading = true;

			this.$api
				.get('plugin/adsense/cache/clear', { method: method, filters: this.filters, active: this.$options.filters.fileName(this.active.title) })
				.then(response => {
					this.$store.dispatch("notification/open", {
						type: "success",
						message: "Cache Cleared!",
						timeout: 2000
					});
					this.fetch();
				})
				.catch(error => {
					this.error = error;
					console.log(error.message);
				});
		},
		handler: function(date_range, index) {
			this.loading = true;
			this.active.key = index;
			localStorage.setItem('active', this.active.key);

			if (this.connected.status) {
				this.fetch();

				this.$store.dispatch("notification/open", {
					type: "success",
					message: "Refreshing Data!",
					timeout: 1500
				});
			} else {
				this.loading = false;
			}
		},
		mouseover: function() {
			this.connected.text = 'Disconnect Account';
			this.connected.icon = 'remove';
		},
		mouseleave: function() {
      this.connected.text = 'Account Connected!';
			this.connected.icon = 'check';
    },
		config: function(active_date_range) {
			this.refresh = (this.cache.autoRefresh.includes(this.active.key)) ? true : false;

			let config = {
				file_name: this.$options.filters.fileName(active_date_range.name),
				account_id: this.account,
				start_date: active_date_range.startDate,
				end_date: active_date_range.endDate,
				filters: this.filters,
				cache: this.cache.disabled,
				refresh: this.refresh,
				interval: this.cache.autoRefreshInterval,
			}
			return config;
		},
  },
	updated: function () {
		this.$nextTick(function () {
			if (this.connected.status && this.getReport.empty && this.loading) this.fetch();
			this.active.title = this.params[this.active.key]['name'];
	  });
	},
	filters: {
		nameFormat: function (value) {
	    if (!value) return ''
	    value = value.replace(/_/g, " ").toLowerCase();
	    return value.charAt(0).toUpperCase() + value.slice(1);
	  },
		numberFormat: function (value) {
			if (!value) return ''
			value = value.toString()
			return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		fileName: function(value) {
			return value.replace(/ /g, "_").toLowerCase();
		},
	},

};
</script>

<style lang="scss">
  	@import '../assets/css/styles.scss';
</style>
