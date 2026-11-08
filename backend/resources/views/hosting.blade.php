<!doctype html>
<html lang="vi" data-scroll-behavior="smooth" class="h-full antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $payload['title'] }}</title>
    <meta name="description" content="{{ $payload['description'] }}">
    <meta name="csrf-token" content="{{ $payload['csrf'] }}">
    <meta name="robots" content="{{ $private ? 'noindex,nofollow' : 'index,follow' }}">
    <link rel="canonical" href="{{ url()->current() }}">
    <meta property="og:title" content="{{ $payload['title'] }}">
    <meta property="og:description" content="{{ $payload['description'] }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    @if($currentGame?->image)<meta property="og:image" content="{{ url(\App\Support\HostingMedia::url($currentGame->image)) }}">@endif
    <link rel="icon" href="/favicon.ico">
    <link rel="stylesheet" href="{{ $manifest['style'] }}">
</head>
<body>
    <div id="site-root"><main class="page-shell route-loading" role="status">Đang mở trang…</main></div>
    <noscript><main class="page-shell">
        <h1>{{ $currentGame?->name ?? $payload['title'] }}</h1>
        @if($currentGame)
            <p>{{ strip_tags($currentGame->description ?? '') }}</p>
            <p>{{ strip_tags($currentGame->installation_guide ?? '') }}</p>
            @if($currentGame->is_downloadable && $currentGame->download_url)<a href="{{ $currentGame->download_url }}" rel="noopener noreferrer">Tải bản Việt hóa</a>@endif
        @else
            <p>Bật JavaScript để sử dụng đầy đủ website.</p>
            @foreach($games as $game)<p><a href="/games/{{ rawurlencode($game->slug) }}">{{ $game->name }}</a></p>@endforeach
        @endif
    </main></noscript>
    <script id="site-data" type="application/json">{!! json_encode($payload, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
    @foreach($manifest['scripts'] as $script)<script defer src="{{ $script }}"></script>@endforeach
</body>
</html>
