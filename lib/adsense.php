<?php

class AdSense {

  protected $client;
  protected $service;
  protected $config;

  public function __construct() {
    // client config
    $this->config = [
      'client_secret' => kirby()->option('ashhhbradley.adsense.client_secret'),
      'client_id' => kirby()->option('ashhhbradley.adsense.client_id'),
      'redirect_uri' => kirby()->site()->url() . '/plugin/adsense/capture',
    ];
    $this->client = new Google_Client($this->config);

    // set up authentication
    $this->client->addScope('https://www.googleapis.com/auth/adsense.readonly');
    $this->client->setAccessType('offline');

    // create service
    $this->service = new Google_Service_AdSense($this->client);
  }

  // check if config.php has required options set
  public function hasConfig() {
    if (!option('ashhhbradley.adsense.client_secret') || !option('ashhhbradley.adsense.client_id') || !option('ashhhbradley.adsense.redirect_uri')) {
			return false;
		}
    return true;
  }

  // generate auth url and return it to route for redirection
  public function generateAuthURL() {
    $this->client->setApprovalPrompt('force');
    return $this->client->createAuthUrl();
  }

  // exchange authorization code for an access token & save access token to file
  public function capture($auth_code) {
    $this->client->authenticate($auth_code);

    $response = $this->client->getAccessToken();
    $this->storeCredentials($response);
  }

  // save access token / refresh token to file
  public function storeCredentials($response) {
    $token_file_path = (option('ashhhbradley.adsense.token_file_path') ? option('ashhhbradley.adsense.token_file_path') : '/auth/token');
    $dir_path = __DIR__.'/..'.dirname($token_file_path, 1);
    if (!file_exists($dir_path)) mkdir($dir_path, 755, true);
    file_put_contents(__DIR__.'/..'.$token_file_path, json_encode($response, true));
  }

  // main function which fetches data from api and saves to file
  public function generateReport(string $file_path, array $options) {
    $token_file_path = (option('ashhhbradley.adsense.token_file_path') ? __DIR__.'/..'.option('ashhhbradley.adsense.token_file_path') : __DIR__.'/../auth/token');

    if (file_exists($token_file_path)) {
      if (filesize($token_file_path) > 0) {
        $token_file_contents = file_get_contents($token_file_path);
        $token = json_decode($token_file_contents, true);

        $this->client->setAccessToken($token);
        $refresh_token = $token['refresh_token'];

        // check if current access token has expired, if true request a new one and save it
        if ($this->client->isAccessTokenExpired()) {
          $response = $this->client->fetchAccessTokenWithRefreshToken($refresh_token);
          $this->storeCredentials($response);
        }

      } else {
        throw new Exception('Something went wrong. Error reading access token.');
      }
    }

    // report options
    $account_id = $options['account_id'];
    $ad_unit = $options['ad_unit'];
    $filters = $options['filters'];
    $start_date = $options['start_date'];
    $end_date = $options['end_date'];

    if ($filters != null) {
      $report_params = [
        'metric' => ['PAGE_VIEWS', 'CLICKS', 'COST_PER_CLICK', 'EARNINGS'],
        'filter' => [$filters],
      ];
    } else {
      $report_params = ['metric' => ['PAGE_VIEWS', 'CLICKS', 'COST_PER_CLICK', 'EARNINGS']];
    }

    // request report
    $report = $this->service->accounts_reports->generate($account_id, $start_date, $end_date, $report_params);
    $json_report = json_encode($report, JSON_PRETTY_PRINT);
    $modified_report = json_decode($json_report, true);

    // add data to report json
    if ($ad_unit !== false) $modified_report['AD_UNIT_NAME'] = $ad_unit;
    $modified_report['dateCreated'] = date('Y-m-d');
    $modified_report['timeCreated'] = date('H:i');
    $modified_report['prettyDate'] = date('M d, Y');

    if ($file_path == 'cache_disabled') {
      return json_encode($modified_report, JSON_PRETTY_PRINT);
    } else {
      // save to file
      $dir_path = dirname($file_path, 1);
      if (!file_exists($dir_path)) mkdir($dir_path, 755, true);
      file_put_contents($file_path, json_encode($modified_report, JSON_PRETTY_PRINT));
    }
  }

  // returns file contents - called after data has been saved to file
  public function fetchCachedReport(string $file_path) {
    $json_file = file_get_contents($file_path);
    $report = json_decode($json_file, true);
    return $report;
  }
}
