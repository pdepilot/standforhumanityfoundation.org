<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

$dataDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
$file = $dataDir . DIRECTORY_SEPARATOR . 'donations.json';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}
if (!file_exists($file)) {
    file_put_contents($file, '[]', LOCK_EX);
}

function sfhf_read_donations($file)
{
    $fp = fopen($file, 'c+');
    if (!$fp) {
        return array();
    }
    flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : array();
}

function sfhf_write_donations($file, $list)
{
    $json = json_encode(array_values($list), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    return file_put_contents($file, $json, LOCK_EX) !== false;
}

function sfhf_public_entry($entry)
{
    $anonymous = !empty($entry['anonymous']);
    return array(
        'id' => isset($entry['id']) ? $entry['id'] : '',
        'name' => $anonymous ? 'Anonymous Donor' : (isset($entry['name']) ? $entry['name'] : 'Supporter'),
        'phone' => isset($entry['phone']) ? $entry['phone'] : '',
        'description' => isset($entry['description']) ? $entry['description'] : '',
        'amount' => isset($entry['amount']) ? $entry['amount'] : 0,
        'currency' => isset($entry['currency']) ? $entry['currency'] : 'NGN',
        'cause' => isset($entry['cause']) ? $entry['cause'] : '',
        'anonymous' => $anonymous,
        'createdAt' => isset($entry['createdAt']) ? $entry['createdAt'] : ''
    );
}

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

if ($method === 'GET') {
    $list = sfhf_read_donations($file);
    $out = array();
    foreach ($list as $entry) {
        $out[] = sfhf_public_entry($entry);
    }
    echo json_encode(array('ok' => true, 'donations' => $out));
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(array('ok' => false, 'error' => 'Invalid request'));
        exit;
    }

    $name = trim(strip_tags(isset($input['name']) ? $input['name'] : ''));
    $amount = floatval(isset($input['amount']) ? $input['amount'] : 0);
    if ($name === '' || $amount <= 0) {
        http_response_code(400);
        echo json_encode(array('ok' => false, 'error' => 'Name and a donation amount are required.'));
        exit;
    }

    $allowedCurrency = array('NGN', 'USD', 'GBP', 'EUR');
    $currency = isset($input['currency']) ? strtoupper(trim($input['currency'])) : 'NGN';
    if (!in_array($currency, $allowedCurrency, true)) {
        $currency = 'NGN';
    }

    $entry = array(
        'id' => 'don-' . bin2hex(random_bytes(6)),
        'name' => substr($name, 0, 80),
        'email' => substr(trim(strip_tags(isset($input['email']) ? $input['email'] : '')), 0, 120),
        'phone' => substr(trim(strip_tags(isset($input['phone']) ? $input['phone'] : '')), 0, 40),
        'description' => substr(trim(strip_tags(isset($input['description']) ? $input['description'] : '')), 0, 200),
        'amount' => $amount,
        'currency' => $currency,
        'cause' => substr(trim(strip_tags(isset($input['cause']) ? $input['cause'] : '')), 0, 60),
        'paymentMethod' => substr(trim(strip_tags(isset($input['paymentMethod']) ? $input['paymentMethod'] : '')), 0, 40),
        'anonymous' => !empty($input['anonymous']),
        'createdAt' => gmdate('c')
    );

    $list = sfhf_read_donations($file);
    $list[] = $entry;
    if (count($list) > 500) {
        $list = array_slice($list, -500);
    }
    sfhf_write_donations($file, $list);

    echo json_encode(array('ok' => true, 'donation' => sfhf_public_entry($entry)));
    exit;
}

http_response_code(405);
echo json_encode(array('ok' => false, 'error' => 'Method not allowed'));
