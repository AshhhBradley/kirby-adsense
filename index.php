<?php

@include_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/lib/adsense.php';

Kirby::plugin('ashhhbradley/adsense', [
  'sections' => [
    'adsense' => [
      'props' => [
        'account' => function($account_id) {
          return $this->model()->toString($account_id);
        },
        'defaults' => function($defaults = ['active' => 'today', 'currency' => 'USD']) {
          if (empty($defaults)) $defaults = ['active' => 'today', 'currency' => 'USD'];
          // if key exists ? pass value if key exists : fallback
          $active = (array_key_exists('active', $defaults) ? $defaults['active'] : 'today');
          $currency = (array_key_exists('currency', $defaults) ? $defaults['currency'] : 'USD');

          return ['active' => $active, 'currency' => $currency];
        },
        'cache' => function($cache = ['disabled' => false, 'prompt' => true, 'refresh' => array('hidden'), 'autoRefresh' => array(), 'autoRefreshInterval' => '12 hours']) {
          if (empty($cache)) $cache = ['disabled' => false, 'prompt' => true, 'refresh' => array('hidden'), 'autoRefresh' => array(), 'autoRefreshInterval' => '12 hours'];
          // if key exists ? pass value if key exists : fallback
          $disabled = (array_key_exists('disabled', $cache) ? $cache['disabled'] : false);
          $prompt = (array_key_exists('prompt', $cache) ? $cache['prompt'] : true);
          $refresh = (array_key_exists('refresh', $cache) ? $cache['refresh'] : ['hidden']);
          $autoRefresh = (array_key_exists('autoRefresh', $cache) ? $cache['autoRefresh'] : []);
          $autoRefreshInterval = (array_key_exists('autoRefreshInterval', $cache) ? $cache['autoRefreshInterval'] : '12 hours');

          return ['disabled' => $disabled, 'prompt' => $prompt, 'refresh' => $refresh, 'autoRefresh' => $autoRefresh, 'autoRefreshInterval' => $autoRefreshInterval];
        },
        'filters' => function($filters = null) {
          if (!empty($filters)) {
            $filter = array();
            foreach($filters as $key => $value) {
              $filter[$key] = $this->model()->toString($value);
            }
            return str_replace("=", "==", http_build_query($filter));
          } else {
            return null;
          }
        },
        'params' => function($params = ['today' => array('name' => 'Today', 'startDate' => 'today', 'endDate' => 'today')]) {
          return $params;
        },
      ],
      'computed' => [
        'admin' => function() {
          return (kirby()->user()->isAdmin() ? true : false);
        },
        'connected' => function() {
          $token_file_path = (option('ashhhbradley.adsense.token_file_path') ? option('ashhhbradley.adsense.token_file_path') : '/auth/token');
          return (file_exists(__DIR__.$token_file_path) && filesize(__DIR__.$token_file_path) > 0 ? true : false);
        },
      ],
    ],
  ],
  'routes' => [
    [
      'pattern' => 'plugin/adsense/capture',
      'action' => function () {
        $redirect = option('ashhhbradley.adsense.redirect_uri');
        if (isset($_GET['code'])) {
          $adsense = new AdSense();
          $adsense->capture($_GET['code']);
          go(filter_var($redirect, FILTER_SANITIZE_URL));
          exit;
        } else {
          go(filter_var($redirect, FILTER_SANITIZE_URL));
        }
      }
    ],
  ],
  'api' => [
    'routes' => function ($kirby) {
      return [
        [
          'pattern' => 'plugin/adsense/auth',
          'action' => function () {
            $adsense = new AdSense();
            $auth_url = $adsense->generateAuthURL();

            return ['redirect' => $auth_url];
          }
        ],
        [
          'pattern' => 'plugin/adsense/disconnect',
          'action' => function () {
            $token_file_path = (option('ashhhbradley.adsense.token_file_path') ? __DIR__.option('ashhhbradley.adsense.token_file_path') : __DIR__.'/auth/token');
            array_map('unlink', glob("$token_file_path"));

            // redirect back to defined page which has plugin on
            $redirect = option('ashhhbradley.adsense.redirect_uri');
            return ['redirect' => $redirect];
          }
        ],
        [
          'pattern' => 'plugin/adsense/report',
          'action' => function () {

            try {
              $adsense = new AdSense();
              $ad_unit = false;
              $cache_file_path = (option('ashhhbradley.adsense.cache_file_path') ? option('ashhhbradley.adsense.cache_file_path') : '/reports/cache/');
              $file_path = __DIR__.$cache_file_path.get('file_name').'.json';
              $cache_disabled = get('cache');

              // check if any filters have been set and passed over from blueprint
              if (get('filters') != null) {
                parse_str(str_replace("==", "=", get('filters')), $filters);

                // check if ad unit name dimension is set in array
                if (array_key_exists('AD_UNIT_NAME', $filters)) {
                  $ad_unit = $filters['AD_UNIT_NAME'];
                  $dir_path = __DIR__.$cache_file_path.'/ad_units/'.$ad_unit;
                  $file_path = $dir_path.'/'.get('file_name').'.json';

                  // check if file directory already exists, if not create it
                  if (!file_exists($dir_path)) mkdir($dir_path, 755, true);
                }
              }

              $report_params = [
                'account_id' => get('account_id'),
                'ad_unit' => $ad_unit,
                'filters' => get('filters'),
                'start_date' => get('start_date'),
                'end_date' => get('end_date')
              ];

              // check if config.php has required options
              if ($adsense->hasConfig()) {

                // check if user has disabled cache
                if ($cache_disabled == 'true') {
                  $report = $adsense->generateReport('cache_disabled', $report_params);
                } else {
                  // check if report has already been generated and saved to cache
                  if (!file_exists($file_path) || filesize($file_path) <= 0) {
                    // if report doesnt exist in cache, fetch report and store in json file
                    $adsense->generateReport($file_path, $report_params);
                  }

                  // fetch cached report & check if it needs refreshing
                  $cache = $adsense->fetchCachedReport($file_path);
                  if (get('refresh') == 'true') {
                    $date = (new DateTime($cache['dateCreated'].' '.$cache['timeCreated']))->modify(get('interval'));
                    $now = new DateTime();

                    if ($date < $now) {
                      // dateCreated has expired interval - generate new report & return cache
                      $adsense->generateReport($file_path, $report_params);
                      $report = $adsense->fetchCachedReport($file_path);
                    } else {
                      $report = $cache;
                    }
                  } else {
                    $report = $cache;
                  }

                }

              } else {
                throw new Exception('Missing API credentials from config.php. You can create them here: <b><a href="https://console.cloud.google.com/apis/credentials">https://console.cloud.google.com/apis/credentials</a></b>');
              }
              return $report;
            }
            catch (Exception $e) {
              return ['status' => 'error', 'plugin' => 'adsense', 'date' => date('d M Y, h:i:s'), 'message' => $e->getMessage()];
            }
          }
        ],
        [
          'pattern' => 'plugin/adsense/cache/clear',
          'action' => function () {

            $method = get('method');
            $filters = get('filters');
            $active = get('active');
            $cache_dir_path = __DIR__.'/cache/';

            // check if any filters are set
            if (get('filters') != 'null') {
              parse_str(str_replace("==", "=", get('filters')), $filters);

              // check if ad unit name dimension is set in array, if it is change cache folder location
              if (array_key_exists('AD_UNIT_NAME', $filters)) {
                $ad_unit = $filters['AD_UNIT_NAME'];
                $cache_dir_path = __DIR__.'/cache/ad_units/'.$ad_unit.'/';
              }
            }

            if ($method == 'clear_active') {
              $file_path = $cache_dir_path.$active.'_report.json';
              if (file_exists($file_path)) unlink($file_path);
            }
            elseif ($method == 'clear_all') {
              $file_path = glob("$cache_dir_path*.json");
              array_map('unlink', $file_path);
            }

            return ['active' => get('active')];
          }
        ]
      ];
    }
  ]
]);
