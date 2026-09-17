<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

session_start();

$usersFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'users.json';

function sfhf_json($ok, $extra = array())
{
    echo json_encode(array_merge(array('ok' => $ok), $extra));
    exit;
}

function sfhf_public_user($user)
{
    return array(
        'name' => isset($user['name']) ? $user['name'] : 'Staff',
        'email' => isset($user['email']) ? $user['email'] : '',
        'role' => isset($user['role']) ? $user['role'] : 'Staff'
    );
}

function sfhf_load_users($file)
{
    if (!is_file($file)) {
        return array();
    }
    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : array();
}

$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';
$action = '';
$input = array();

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : 'session';
} else {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = $_POST;
    }
    $action = isset($input['action']) ? $input['action'] : 'login';
}

if ($action === 'session') {
    if (!empty($_SESSION['sfhf_portal_user'])) {
        sfhf_json(true, array('authenticated' => true, 'user' => $_SESSION['sfhf_portal_user']));
    }
    sfhf_json(true, array('authenticated' => false));
}

if ($action === 'logout') {
    $_SESSION = array();
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    sfhf_json(true, array('authenticated' => false));
}

if ($action === 'login') {
    if ($method !== 'POST') {
        http_response_code(405);
        sfhf_json(false, array('error' => 'Method not allowed'));
    }

    if (!isset($_SESSION['sfhf_login_attempts'])) {
        $_SESSION['sfhf_login_attempts'] = 0;
    }
    if ($_SESSION['sfhf_login_attempts'] >= 8) {
        http_response_code(429);
        sfhf_json(false, array('error' => 'Too many attempts. Please wait and try again.'));
    }

    $email = strtolower(trim(isset($input['email']) ? $input['email'] : ''));
    $password = isset($input['password']) ? strval($input['password']) : '';

    if ($email === '' || $password === '') {
        $_SESSION['sfhf_login_attempts']++;
        http_response_code(400);
        sfhf_json(false, array('error' => 'Enter your email and password.'));
    }

    $users = sfhf_load_users($usersFile);
    $matched = null;
    foreach ($users as $user) {
        $userEmail = strtolower(trim(isset($user['email']) ? $user['email'] : ''));
        if ($userEmail === $email && !empty($user['hash']) && password_verify($password, $user['hash'])) {
            $matched = $user;
            break;
        }
    }

    if (!$matched) {
        $_SESSION['sfhf_login_attempts']++;
        http_response_code(401);
        sfhf_json(false, array('error' => 'Those details were not recognised.'));
    }

    $_SESSION['sfhf_login_attempts'] = 0;
    $_SESSION['sfhf_portal_user'] = sfhf_public_user($matched);
    session_regenerate_id(true);
    sfhf_json(true, array('authenticated' => true, 'user' => $_SESSION['sfhf_portal_user']));
}

http_response_code(400);
sfhf_json(false, array('error' => 'Unknown action'));
