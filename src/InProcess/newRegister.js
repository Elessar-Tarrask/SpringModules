if (Cons.getCurrentPage().code === 'home_page') {

    function userOperations(user) {

        var passportDomain = (window.location.host == 'enbek.kz') ? 'passport.enbek.kz' : 'testpass.enbek.kz';
        var redirect = window.location.href;

        $('.links-box a').remove();


        console.log(user);
        $("#button-test").append('<a href = "https://' + passportDomain + '/ru/user/login?redirect_uri=' + redirect + '&sctict">Вход</a>');
        // if (user == null) {
        //     //
        //     $('.links-box').append('<a href = "https://' + passportDomain + '/ru/user/login?redirect_uri=' + redirect + '&sctict">Вход</a>');
        //     $('.links-box').append('<a href = "https://' + passportDomain + '/ru/user/register?redirect_uri=' + redirect + '">Регистрация</a>');
        // } else {
        //     $('.links-box').append('<a href = "https://' + passportDomain + '/ru/user/config?redirect_uri=' + redirect + '">Настройки</a>');
        //     $('.links-box').append('<a href = "https://' + passportDomain + '/ru/user/logout?redirect_uri=' + redirect + '">Выход</a>');
        // }

        console.log(user);
        // $('.user-data').html(JSON.stringify(user));
        //
        // $('.loading').remove();
        // $('.links-box').show();
        // $('.user-data').show();
    }

    // Переменные для конфигураций
    let passportDomain = (window.location.host == 'enbek.kz') ? 'passport.enbek.kz' : 'testpass.enbek.kz';
    let cookiePrefix = {
        'biztest.enbek.kz': 'sso_pasport_test_',
        'enbek.kz': 'sso_pasport_',
    };

    // По умолчанию пустой пользователь и переменная с сессией cookie
    let user = null;
    let sid = {name: null, value: null}

    // Ищем нужный нам cookie для записи в переменную сессий
    let cookies = document.cookie.split(';');
    cookies.forEach(function (cookieRow) {
        var cookie = cookieRow.split('=');
        if (cookie[0] !== undefined && cookie[1] !== undefined) {
            if ($.trim(cookie[0]).indexOf(cookiePrefix[window.location.host]) >= 0) {
                sid = {name: $.trim(cookie[0]), value: $.trim(cookie[1])};
                return false;
            }
        }

    });

    if (sid.name != null) {
        // Если сессия определена, то формируем параметры для POST запроса
        let request = {
            'appName': 'business.enbek.kz',
            'accessKey': 'Yq1fNpnPj0jmQhp5Br0VtzvVmvQrKeO0FS2PeW2K2Gai99dFgr',
            'sid': sid,
        }

        // Выполняем запрос на паспорт для получения информации о пользователе
        $.post('https://' + passportDomain + '/api/user', request, function (response) {
            if (response.user !== undefined) {
                user = response.user;
                userOperations(user);
            }
        });
    } else {
        // Если сессия не определена, значит кук не создавался, пользователь не авторизован
        // Запрос отсылать нет необходимости
        userOperations(user);
    }
}