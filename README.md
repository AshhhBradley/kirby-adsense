# Google AdSense Analytics for Kirby 3

This plugin will display your Google AdSense metrics for a range of dimensions directly from within the Kirby 3 panel.

<br/>

## Overview

> This plugin is completely free and published under the MIT license.

- [1. Installation](#1-installation)
- [2. Authentication](#2-authentication)
- [3. Options](#3-options)
  * [3.1. Required Options](#31-required-options)
  * [3.2. Optional](#32-optional)
- [4. Blueprints](#4-blueprints)
  * [4.1. Basic blueprint example](#41-basic-blueprint-example)
  * [4.2. Hide elements](#42-hide-elements)
  * [4.3. Defaults](#43-defaults)
  * [4.4. Filters](#44-filters)
  * [4.5. Cache](#45-cache)
  * [4.6. Params](#46-params)
  * [4.7. Complete blueprint example](#47-complete-blueprint-example)
- [5. License](#5-license)
- [6. Credits](#6-credits)

<br/>

## 1. Installation

Download and copy this repository to ```/site/plugins/adsense```

Alternatively, you can install it with composer: ```composer require ashhhbradley/adsense```

> Note: If you have adblock installed you may recieve a failed to fetch error since it will block urls containing the word adsense. To fix this either disable adblock or add `@@||*/api/plugin/adsense/$xmlhttprequest` to your filters.

<br/>

## 2. Authentication

In order for this plugin to fetch data from the Google AdSense API, some credentials will need to be provided. You can follow a walk-through to learn how to create them here: [Wiki](wiki).

<br>

## 3. Options

Here is an overview of the available options with their default values:

```php
return [
    # required
    'ashhhbradley.adsense.client_secret'   => undefined,
    'ashhhbradley.adsense.client_id'       => undefined,
    'ashhhbradley.adsense.redirect_uri'    => undefined,

    # optional
    'ashhhbradley.adsense.token_file_path' => '/auth/token',
    'ashhhbradley.adsense.cache_file_path' => '/reports/cache/',
];
```
### 3.1. Required Options

#### 3.1.1. `client_secret`

This is where to insert your client secret value from https://console.developers.google.com.
> Please note that the client secret is private and shouldn't be made public. Once added, if you need to publish your code please create something like a duplicated `config.github.php` which will contain the non-sensitive information, and add your real `config.php` to your `.gitignore`.

> More info here: https://getkirby.com/docs/guide/security#secure-data-in-git-repositories

```php
'ashhhbradley.adsense.client_secret' => '#########################',
```
#### 3.1.2. `client_id`

This is where to insert your client id value from https://console.developers.google.com.
> Much like the client secret, the client id should also remain private and not be made public.

```php
'ashhhbradley.adsense.client_id' => 'example.apps.googleusercontent.com',
```
#### 3.1.3. `redirect_uri`

This value should be the url of the panel page which contains the plugin. It is used for redirection after connecting your google account and just makes the authentication flow a bit more seamless.

```php
'ashhhbradley.adsense.redirect_uri' => 'http(s)://<yourdomain>/panel/site',
```

### 3.2. Optional

#### 3.2.1. `token_file_path`
>Type: `String`, Default: `/auth/token`

This is the file path for where to store the access token.

>Note: This value must start with `/` & contain a directory followed by a filename.
```php
'ashhhbradley.adsense.token_file_path' => '/<dir>/<filename>',
```
#### 3.2.2. `cache_file_path`
>Type: `String`, Default: `/reports/cache/`

This is the file path for where to store the json responses from the Google Adsense API.

>Note: This value must start & end with `/`.

```php
'ashhhbradley.adsense.cache_file_path' => '/<dir>/<subdir>/',
```

<br/>

## 4. Blueprints

This section will cover all the available properties for this plugin and explain what each property does.

### 4.1. Basic blueprint example

> Please make sure that you have included the required options in your Kirby config and included your account ID in the blueprint.

Place this snippet in your blueprint:

```yaml
columns:
  - width: 2/3
    sections:
      analytics:
        type: adsense
        account: "pub-################"
```

#### 4.1.1. `account` (required)
This is where to add your AdSense account ID. You can also query this value from a panel page field such as `{{ kirby.user.account_id }}`. This will fetch the value from a field called `account_id` for the current user.

### 4.2. Hide elements
```yaml
  hideHeadline:    false
  hideConnect:     false
  hideLastUpdated: false
```
#### 4.2.1. `hideHeadline`
>Type: `Boolean`, Default: `false`

Setting this value to `true` will hide the default headline.
#### 4.2.2. `hideConnect`
>Type: `Boolean`, Default: `false`

After connecting your account, you may wish to hide the connect button and setting this value to `true` will do that. But remember if you wish to disconnect your account this will need to be set to false.
#### 4.2.3. `hideLastUpdated`
>Type: `Boolean`, Default: `false`

Setting this value to `true` will hide the last updated text below the component.

#### 4.3. Defaults
```yaml
  defaults:
    active: today
    currency: USD
```
#### 4.3.1. `active`
>Type: `String`, Default: `today`

This is used to set the active date range to load when the user first loads the plugin. So if you wanted "All Time" to initially be the active date range, set this value to `all_time`.

#### 4.3.2. `currency`
>Type: `String`, Default: `USD`

Set your currency code here, you can find a full list of currency codes over at the API docs.

See: https://developers.google.com/adsense/management/appendix/currencies

### 4.4. Filters
```yaml
  filters:
    AD_UNIT_NAME: "{{ kirby.user.ad_unit }}"
    PLATFORM_TYPE_CODE: "HighEndMobile"
```
>Type: `Array`, Default: `null`

You can filter your reports by adding dimensions and their values to the blueprint like this.
Important: these values are case sensitive any may return an error if not added correctly.

See: https://developers.google.com/adsense/management/metrics-dimensions#dimensions

### 4.5. Cache
```yaml
  cache:
    disabled: false
    prompt: true
    refresh:
      - clearActive
      - clearAll
    autoRefresh:
      - today
    autoRefreshInterval: '12 hours'
```

#### 4.5.1. `disabled`
>Type: `Boolean`, Default: `false`

Setting this value to `true` will disable saving reports to file. This is not recommending as the API has a limit of 10,000 requests per day. But if you want real time updates this is how to do it.
This option will also make all other options redundant when set to `true`.

#### 4.5.2. `prompt`
>Type: `Boolean`, Default: `true`

By default a prompt will appear asking for confirmation every time the user clicks the refresh cache button. To disable this simply set this option to `false`.

#### 4.5.3. `refresh`
>Type: `Array`, Default: `[hidden]`

By default the refresh button will be hidden. This property will accept the values `clearActive`, `clearAll` or both.

- `clearActive` will display a Refresh button which will only clear the cache for the active date range and fetch a new report to save to cache.
- `clearAll` will display a Clear All Cache button which will clear all reports from cache and fetch a new report for the active date range to save to cache.
- If both of these options are added, a dropdown menu will display with both options to choose from.

#### 4.5.4. `autoRefresh`
>Type: `Array`, Default: `empty`

When the page is refreshed, if the active date range is listed in this array, the last updated date will be compared to the current time and will automatically refresh the data if the refresh interval has elapsed.

#### 4.5.5. `autoRefreshInterval`
>Type: `String`, Default: `12 hours`

For a full list of accepted values see the PHP documentation.

See: https://www.php.net/manual/en/datetime.formats.relative.php

### 4.6. Params
```yaml
  params:
    today:
      name: Today
      startDate: today
      endDate: today
```
For the params you must specify a date range with a custom property name which includes the following nested properties: `name`, `startDate` & `endDate`.

>Note: the property name, for example 'today' is the value to reference in the defaults > active part of the blueprint as well as cache > autoRefresh.

#### 4.6.1. `name`
>Type: `String`, Default: `Today`

This is the name which will appear in the tabs list above the analytics component.

#### 4.6.2. `startDate` / `endDate`
>Type: `String`, Default: `today`

Here you can specify either a relative date name or a date in the format of `YYYY-MM-DD`.
For a full list of acceptable relative dates see the API docs.

See: https://developers.google.com/adsense/management/reporting/relative_dates


### 4.7. Complete blueprint example

Here's a complete example of how the blueprint will look with all the properties configured.

```yaml
columns:
  - width: 2/3
    sections:
      analytics:
        type: adsense
        headline: Google AdSense Analytics

        account: "pub-################"

        hideHeadline: false
        hideConnect: false
        hideLastUpdated: false

        defaults:
          active: today
          currency: USD

        filters:
          PLATFORM_TYPE_CODE: "HighEndMobile"

        cache:
          disabled: false
          prompt: true
          refresh:
            - clearActive
            - clearAll
          autoRefresh:
            - today
          autoRefreshInterval: "12 hours"

        params:
          today:
            name: Today
            startDate: today
            endDate: today
          yesterday:
            name: Yesterday
            startDate: today-1d
            endDate: today-1d
          month:
            name: This Month
            startDate: startOfMonth
            endDate: today
          year:
            name: This Year
            startDate: startOfYear
            endDate: today
          all_time:
            name: All Time
            startDate: 2003-01-01
            endDate: today

```
<br/>

## 5. License

MIT

<br/>

## 6. Credits

Credit to [Kirby Matomo](https://github.com/sylvainjule/kirby-matomo) by [@sylvainjule](https://github.com/sylvainjule) which was used as a learning resource and for styling of this plugin.
