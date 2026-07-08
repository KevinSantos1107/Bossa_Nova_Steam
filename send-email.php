<?php
// ── Apenas aceita POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

// ── Rate limiting: máximo 5 envios por IP a cada 10 minutos ──
session_start();
$now      = time();
$window   = 600; // 10 minutos em segundos
$maxCalls = 5;

if (!isset($_SESSION['form_calls'])) {
    $_SESSION['form_calls'] = [];
}

// Remove chamadas antigas fora da janela de tempo
$_SESSION['form_calls'] = array_filter(
    $_SESSION['form_calls'],
    fn($t) => ($now - $t) < $window
);

if (count($_SESSION['form_calls']) >= $maxCalls) {
    http_response_code(429);
    exit(json_encode(['error' => 'Too many requests. Please try again later.']));
}

$_SESSION['form_calls'][] = $now;

// ── Credenciais do EmailJS (ficam seguras no servidor) ──
define('EMAILJS_SERVICE_ID',  'service_fsqdk9v');
define('EMAILJS_TEMPLATE_ID', 'template_up60b6k');
define('EMAILJS_PUBLIC_KEY',  'egrTyJ98qhSWd19H2');
define('EMAILJS_API_URL',     'https://api.emailjs.com/api/v1.0/email/send');

// ── Lê e valida o body JSON enviado pelo formulário ──
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (
    empty($data['from_name']) ||
    empty($data['phone'])     ||
    empty($data['email'])     ||
    empty($data['service'])
) {
    http_response_code(400);
    exit(json_encode(['error' => 'Missing required fields']));
}

$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid email address']));
}

// ── Sanitiza os campos ──
$templateParams = [
    'from_name' => htmlspecialchars(strip_tags($data['from_name'])),
    'phone'     => htmlspecialchars(strip_tags($data['phone'])),
    'email'     => htmlspecialchars(strip_tags($email)),
    'service'   => htmlspecialchars(strip_tags($data['service'])),
    'message'   => htmlspecialchars(strip_tags($data['message'] ?? '(no additional info)')),
    'reply_to'  => htmlspecialchars(strip_tags($email)),
];

// ── Monta o payload para o EmailJS ──
$payload = json_encode([
    'service_id'      => EMAILJS_SERVICE_ID,
    'template_id'     => EMAILJS_TEMPLATE_ID,
    'user_id'         => EMAILJS_PUBLIC_KEY,
    'template_params' => $templateParams,
]);

// ── Faz a requisição ao EmailJS via cURL ──
$ch = curl_init(EMAILJS_API_URL);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Origin: https://www.bossanovahomeservices.com',
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// ── Retorna o resultado ao navegador ──
header('Content-Type: application/json');
http_response_code($httpCode === 200 ? 200 : 500);
echo $httpCode === 200
    ? json_encode(['success' => true])
    : json_encode(['error'   => 'Failed to send email']);