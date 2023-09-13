---
title: Authentication Service v1.0.0
language_tabs:
  - javascript: JavaScript
  - javascript--nodejs: Node.JS
language_clients:
  - javascript: request
  - javascript--nodejs: ""
toc_footers: []
includes: []
search: false
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="authentication-service">Authentication Service v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

The authentication service

Base URLs:

* <a href="/">/</a>

# Authentication

- HTTP Authentication, scheme: bearer 

<h1 id="authentication-service-loginactivitycontroller">LoginActivityController</h1>

## LoginActivityController.getActiveUsers

<a id="opIdLoginActivityController.getActiveUsers"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/active-users/{range}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/active-users/{range}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /active-users/{range}`

<h3 id="loginactivitycontroller.getactiveusers-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|range|path|string|true|none|
|startDate|query|string(date-time)|false|none|
|endDate|query|string(date-time)|false|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="loginactivitycontroller.getactiveusers-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|LoginActivity model instance|Inline|

<h3 id="loginactivitycontroller.getactiveusers-responseschema">Response Schema</h3>

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## LoginActivityController.count

<a id="opIdLoginActivityController.count"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/login-activity/count',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/login-activity/count',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /login-activity/count`

<h3 id="loginactivitycontroller.count-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|where|query|object|false|none|

> Example responses

> 200 Response

```json
{
  "count": 0
}
```

<h3 id="loginactivitycontroller.count-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|LoginActivity model count|[loopback.Count](#schemaloopback.count)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## LoginActivityController.findById

<a id="opIdLoginActivityController.findById"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/login-activity/{id}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/login-activity/{id}',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /login-activity/{id}`

<h3 id="loginactivitycontroller.findbyid-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|id|path|string|true|none|
|filter|query|[login_activity.Filter](#schemalogin_activity.filter)|false|none|

> Example responses

> 200 Response

```json
{
  "id": "string",
  "actor": "string",
  "tenantId": "string",
  "loginTime": "2019-08-24T14:15:22Z",
  "tokenPayload": "string",
  "loginType": "string",
  "deviceInfo": "string",
  "ipAddress": "string"
}
```

<h3 id="loginactivitycontroller.findbyid-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|LoginActivity model instance|[LoginActivityWithRelations](#schemaloginactivitywithrelations)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## LoginActivityController.find

<a id="opIdLoginActivityController.find"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/login-activity',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/login-activity',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /login-activity`

<h3 id="loginactivitycontroller.find-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|filter|query|[login_activity.Filter](#schemalogin_activity.filter)|false|none|

> Example responses

> 200 Response

```json
[
  {
    "id": "string",
    "actor": "string",
    "tenantId": "string",
    "loginTime": "2019-08-24T14:15:22Z",
    "tokenPayload": "string",
    "loginType": "string",
    "deviceInfo": "string",
    "ipAddress": "string"
  }
]
```

<h3 id="loginactivitycontroller.find-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Array of LoginActivity model instances|Inline|

<h3 id="loginactivitycontroller.find-responseschema">Response Schema</h3>

Status Code **200**

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|*anonymous*|[[LoginActivityWithRelations](#schemaloginactivitywithrelations)]|false|none|[This is to maintain the daily login activity. (tsType: LoginActivityWithRelations, schemaOptions: { includeRelations: true })]|
|» LoginActivityWithRelations|[LoginActivityWithRelations](#schemaloginactivitywithrelations)|false|none|This is to maintain the daily login activity. (tsType: LoginActivityWithRelations, schemaOptions: { includeRelations: true })|
|»» id|string|false|none|none|
|»» actor|string|false|none|none|
|»» tenantId|string|false|none|none|
|»» loginTime|string(date-time)|false|none|none|
|»» tokenPayload|string|false|none|none|
|»» loginType|string|false|none|none|
|»» deviceInfo|string|false|none|none|
|»» ipAddress|string|false|none|none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

<h1 id="authentication-service-applelogincontroller">AppleLoginController</h1>

## AppleLoginController.appleCallback

<a id="opIdAppleLoginController.appleCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/apple-oauth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/apple-oauth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/apple-oauth-redirect`

<h3 id="applelogincontroller.applecallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|
|state|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="applelogincontroller.applecallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Apple Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## AppleLoginController.postLoginViaApple

<a id="opIdAppleLoginController.postLoginViaApple"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded'
};

fetch('/auth/oauth-apple',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded'
};

fetch('/auth/oauth-apple',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/oauth-apple`

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="applelogincontroller.postloginviaapple-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

<h3 id="applelogincontroller.postloginviaapple-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|POST Call for Apple based login|None|

<h3 id="applelogincontroller.postloginviaapple-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-authalogincontroller">AuthaLoginController</h1>

## AuthaLoginController.postLoginViaAutha

<a id="opIdAuthaLoginController.postLoginViaAutha"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/autha',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/autha',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/autha`

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="authalogincontroller.postloginviaautha-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="authalogincontroller.postloginviaautha-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|POST Call for Autha based login|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## AuthaLoginController.loginViaAutha

<a id="opIdAuthaLoginController.loginViaAutha"></a>

> Code samples

```javascript

fetch('/auth/autha',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

fetch('/auth/autha',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/autha`

<h3 id="authalogincontroller.loginviaautha-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|client_id|query|string|false|none|
|client_challenge|query|string|false|none|
|client_challenge_method|query|string|false|none|

<h3 id="authalogincontroller.loginviaautha-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|308|[Permanent Redirect](https://tools.ietf.org/html/rfc7538)|Redirect to Autha login page|None|

<aside class="success">
This operation does not require authentication
</aside>

## AuthaLoginController.authaCallback

<a id="opIdAuthaLoginController.authaCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/autha-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/autha-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/autha-redirect`

<h3 id="authalogincontroller.authacallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="authalogincontroller.authacallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Autha Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-azurelogincontroller">AzureLoginController</h1>

## AzureLoginController.postLoginViaAzure

<a id="opIdAzureLoginController.postLoginViaAzure"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/azure',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/azure',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/azure`

POST Call for azure based login

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="azurelogincontroller.postloginviaazure-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="azurelogincontroller.postloginviaazure-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Azure Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## AzureLoginController.getLoginViaAzure

<a id="opIdAzureLoginController.getLoginViaAzure"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/azure',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/azure',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/azure`

POST Call for azure based login

<h3 id="azurelogincontroller.getloginviaazure-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|client_id|query|string|false|none|
|client_secret|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="azurelogincontroller.getloginviaazure-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Azure Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## AzureLoginController.azureCallback

<a id="opIdAzureLoginController.azureCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/azure-oauth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/azure-oauth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/azure-oauth-redirect`

<h3 id="azurelogincontroller.azurecallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|
|state|query|string|false|none|
|session_state|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="azurelogincontroller.azurecallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Azure Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-logincontroller">LoginController</h1>

## LoginController.changePassword

<a id="opIdLoginController.changePassword"></a>

> Code samples

```javascript
const inputBody = '{
  "refreshToken": "string",
  "username": "string",
  "password": "string",
  "oldPassword": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Authorization':'string'
};

fetch('/auth/change-password',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "refreshToken": "string",
  "username": "string",
  "password": "string",
  "oldPassword": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Authorization':'string'
};

fetch('/auth/change-password',
{
  method: 'PATCH',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /auth/change-password`

> Body parameter

```json
{
  "refreshToken": "string",
  "username": "string",
  "password": "string",
  "oldPassword": "string"
}
```

<h3 id="logincontroller.changepassword-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|Authorization|header|string|false|none|
|body|body|[ResetPasswordPartial](#schemaresetpasswordpartial)|false|none|

<h3 id="logincontroller.changepassword-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|If User password successfully changed.|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## LoginController.login

<a id="opIdLoginController.login"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/login',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/login',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/login`

Gets you the code that will be used for getting token (webapps)

> Body parameter

```json
{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string"
}
```

<h3 id="logincontroller.login-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[LoginRequest](#schemaloginrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "code": "string"
}
```

<h3 id="logincontroller.login-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Auth Code that you can use to generate access and refresh tokens using the POST /auth/token API|[LoginCodeResponse](#schemalogincoderesponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="success">
This operation does not require authentication
</aside>

## LoginController.loginWithClientUser

<a id="opIdLoginController.loginWithClientUser"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/login-token',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/login-token',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/login-token`

Gets you refresh token and access token in one hit. (mobile app)

> Body parameter

```json
{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string"
}
```

<h3 id="logincontroller.loginwithclientuser-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[LoginRequest](#schemaloginrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="logincontroller.loginwithclientuser-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Token Response Model|[TokenResponse](#schematokenresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-otpcontroller">OtpController</h1>

## OtpController.checkQr

<a id="opIdOtpController.checkQr"></a>

> Code samples

```javascript

const headers = {
  'code':'string',
  'clientId':'string'
};

fetch('/auth/check-qr-code',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'code':'string',
  'clientId':'string'
};

fetch('/auth/check-qr-code',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/check-qr-code`

Returns isGenerated:true if secret_key already exist

<h3 id="otpcontroller.checkqr-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|header|string|false|none|
|clientId|header|string|false|none|

> Example responses

<h3 id="otpcontroller.checkqr-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|secret_key already exists|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<h3 id="otpcontroller.checkqr-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## OtpController.createQr

<a id="opIdOtpController.createQr"></a>

> Code samples

```javascript
const inputBody = '{
  "clientId": "string",
  "code": "string"
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/create-qr-code',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "clientId": "string",
  "code": "string"
};
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/create-qr-code',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/create-qr-code`

Generates a new qrCode for Authenticator App

> Body parameter

```json
{
  "clientId": "string",
  "code": "string"
}
```

<h3 id="otpcontroller.createqr-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AuthTokenRequest](#schemaauthtokenrequest)|false|none|

> Example responses

<h3 id="otpcontroller.createqr-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|qrCode that you can use to generate codes in Authenticator App|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<h3 id="otpcontroller.createqr-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## OtpController.sendOtp

<a id="opIdOtpController.sendOtp"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string",
  "key": "string"
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/send-otp',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string",
  "key": "string"
};
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/send-otp',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/send-otp`

Sends OTP

> Body parameter

```json
{
  "client_id": "string",
  "client_secret": "string",
  "key": "string"
}
```

<h3 id="otpcontroller.sendotp-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[OtpSendRequest](#schemaotpsendrequest)|false|none|

> Example responses

<h3 id="otpcontroller.sendotp-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Sends otp to user|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<h3 id="otpcontroller.sendotp-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## OtpController.verifyOtp

<a id="opIdOtpController.verifyOtp"></a>

> Code samples

```javascript
const inputBody = '{
  "key": "string",
  "otp": "string"
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/verify-otp',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "key": "string",
  "otp": "string"
};
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/verify-otp',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/verify-otp`

Gets you the code that will be used for getting token (webapps)

> Body parameter

```json
{
  "key": "string",
  "otp": "string"
}
```

<h3 id="otpcontroller.verifyotp-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[OtpLoginRequest](#schemaotploginrequest)|false|none|

> Example responses

<h3 id="otpcontroller.verifyotp-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Auth Code that you can use to generate access and refresh tokens using the POST /auth/token API|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<h3 id="otpcontroller.verifyotp-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-cognitologincontroller">CognitoLoginController</h1>

## CognitoLoginController.postLoginViaCognito

<a id="opIdCognitoLoginController.postLoginViaCognito"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/cognito',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/cognito',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/cognito`

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="cognitologincontroller.postloginviacognito-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="cognitologincontroller.postloginviacognito-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|POST Call for Cognito based login|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## CognitoLoginController.loginViaCognito

<a id="opIdCognitoLoginController.loginViaCognito"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/cognito',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/cognito',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/cognito`

<h3 id="cognitologincontroller.loginviacognito-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|client_id|query|string|false|none|
|client_secret|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="cognitologincontroller.loginviacognito-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Cognito Token Response (Deprecated: Possible security issue if secret is passed via query params, please use the post endpoint)|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## CognitoLoginController.cognitoCallback

<a id="opIdCognitoLoginController.cognitoCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/cognito-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/cognito-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/cognito-auth-redirect`

<h3 id="cognitologincontroller.cognitocallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|
|state|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="cognitologincontroller.cognitocallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Cognito Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-facebooklogincontroller">FacebookLoginController</h1>

## FacebookLoginController.postLoginViaFacebook

<a id="opIdFacebookLoginController.postLoginViaFacebook"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/facebook',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/facebook',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/facebook`

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="facebooklogincontroller.postloginviafacebook-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="facebooklogincontroller.postloginviafacebook-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|POST Call for Facebook based login|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## FacebookLoginController.facebookCallback

<a id="opIdFacebookLoginController.facebookCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/facebook-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/facebook-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/facebook-auth-redirect`

<h3 id="facebooklogincontroller.facebookcallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|
|state|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="facebooklogincontroller.facebookcallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Facebook Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-forgetpasswordcontroller">ForgetPasswordController</h1>

## ForgetPasswordController.forgetPassword

<a id="opIdForgetPasswordController.forgetPassword"></a>

> Code samples

```javascript
const inputBody = '{
  "username": "string",
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/forget-password',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "username": "string",
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/forget-password',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/forget-password`

> Body parameter

```json
{
  "username": "string",
  "client_id": "string",
  "client_secret": "string"
}
```

<h3 id="forgetpasswordcontroller.forgetpassword-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ForgetPasswordDto](#schemaforgetpassworddto)|false|none|

<h3 id="forgetpasswordcontroller.forgetpassword-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Success Response.|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## ForgetPasswordController.resetPassword

<a id="opIdForgetPasswordController.resetPassword"></a>

> Code samples

```javascript
const inputBody = '{
  "token": "string",
  "password": "string",
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/reset-password',
{
  method: 'PATCH',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "token": "string",
  "password": "string",
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/reset-password',
{
  method: 'PATCH',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`PATCH /auth/reset-password`

> Body parameter

```json
{
  "token": "string",
  "password": "string",
  "client_id": "string",
  "client_secret": "string"
}
```

<h3 id="forgetpasswordcontroller.resetpassword-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ResetPasswordWithClient](#schemaresetpasswordwithclient)|false|none|

<h3 id="forgetpasswordcontroller.resetpassword-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|If User password successfully changed.|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## ForgetPasswordController.verifyResetPasswordLink

<a id="opIdForgetPasswordController.verifyResetPasswordLink"></a>

> Code samples

```javascript

fetch('/auth/verify-reset-password-link?token=string',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

fetch('/auth/verify-reset-password-link?token=string',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/verify-reset-password-link`

<h3 id="forgetpasswordcontroller.verifyresetpasswordlink-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|token|query|string|true|none|

<h3 id="forgetpasswordcontroller.verifyresetpasswordlink-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Check if Token Is Valid and not Expired.|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-googlelogincontroller">GoogleLoginController</h1>

## GoogleLoginController.postLoginViaGoogle

<a id="opIdGoogleLoginController.postLoginViaGoogle"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/google',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/google',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/google`

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="googlelogincontroller.postloginviagoogle-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="googlelogincontroller.postloginviagoogle-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|POST Call for Google based login|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## GoogleLoginController.loginViaGoogle

<a id="opIdGoogleLoginController.loginViaGoogle"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/google',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/google',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/google`

<h3 id="googlelogincontroller.loginviagoogle-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|client_id|query|string|false|none|
|client_secret|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="googlelogincontroller.loginviagoogle-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Google Token Response,
         (Deprecated: Possible security issue if secret is passed via query params, 
          please use the post endpoint)|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## GoogleLoginController.googleCallback

<a id="opIdGoogleLoginController.googleCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/google-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/google-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/google-auth-redirect`

<h3 id="googlelogincontroller.googlecallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|
|state|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="googlelogincontroller.googlecallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Google Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-instagramlogincontroller">InstagramLoginController</h1>

## InstagramLoginController.postLoginViaInstagram

<a id="opIdInstagramLoginController.postLoginViaInstagram"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/instagram',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/instagram',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/instagram`

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="instagramlogincontroller.postloginviainstagram-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="instagramlogincontroller.postloginviainstagram-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|POST Call for Instagram based login|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## InstagramLoginController.instagramCallback

<a id="opIdInstagramLoginController.instagramCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/instagram-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/instagram-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/instagram-auth-redirect`

<h3 id="instagramlogincontroller.instagramcallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|
|state|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="instagramlogincontroller.instagramcallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Instagram Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-keycloaklogincontroller">KeycloakLoginController</h1>

## KeycloakLoginController.postLoginViaKeycloak

<a id="opIdKeycloakLoginController.postLoginViaKeycloak"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string"
}';
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/keycloak',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string"
};
const headers = {
  'Content-Type':'application/x-www-form-urlencoded',
  'Accept':'application/json'
};

fetch('/auth/keycloak',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/keycloak`

POST Call for keycloak based login

> Body parameter

```yaml
client_id: string
client_secret: string

```

<h3 id="keycloaklogincontroller.postloginviakeycloak-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ClientAuthRequest](#schemaclientauthrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="keycloaklogincontroller.postloginviakeycloak-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Keycloak Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## KeycloakLoginController.loginViaKeycloak

<a id="opIdKeycloakLoginController.loginViaKeycloak"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/keycloak',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/keycloak',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/keycloak`

<h3 id="keycloaklogincontroller.loginviakeycloak-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|client_id|query|string|false|none|
|client_secret|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="keycloaklogincontroller.loginviakeycloak-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Keycloak Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

## KeycloakLoginController.keycloakCallback

<a id="opIdKeycloakLoginController.keycloakCallback"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json'
};

fetch('/auth/keycloak-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json'
};

fetch('/auth/keycloak-auth-redirect',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/keycloak-auth-redirect`

<h3 id="keycloaklogincontroller.keycloakcallback-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|code|query|string|false|none|
|state|query|string|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="keycloaklogincontroller.keycloakcallback-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Keycloak Redirect Token Response|[TokenResponse](#schematokenresponse)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-tokenscontroller">TokensController</h1>

## TokensController.me

<a id="opIdTokensController.me"></a>

> Code samples

```javascript

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/me',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/me',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/me`

To get the user details

> Example responses

> 200 Response

```json
{
  "deleted": true,
  "deletedAt": "2019-08-24T14:15:22Z",
  "deletedBy": "string",
  "createdAt": "2019-08-24T14:15:22Z",
  "updatedAt": "2019-08-24T14:15:22Z",
  "createdBy": "string",
  "updatedBy": "string",
  "id": "string",
  "username": "string",
  "email": "string",
  "phone": "string",
  "name": "string",
  "designation": "string",
  "photoUrl": "string",
  "gender": "M",
  "dob": "2019-08-24T14:15:22Z",
  "defaultTenantId": "string",
  "authClientIds": [
    0
  ],
  "lastLogin": "2019-08-24T14:15:22Z",
  "permissions": [
    "string"
  ],
  "role": "string",
  "deviceInfo": {},
  "age": 0,
  "externalAuthToken": "string",
  "externalRefreshToken": "string",
  "authClientId": 0,
  "userPreferences": {},
  "tenantId": "string",
  "userTenantId": "string",
  "passwordExpiryTime": "2019-08-24T14:15:22Z",
  "status": 1
}
```

<h3 id="tokenscontroller.me-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|User Object|[AuthUser](#schemaauthuser)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## TokensController.getToken

<a id="opIdTokensController.getToken"></a>

> Code samples

```javascript
const inputBody = '{
  "clientId": "string",
  "code": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/token',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "clientId": "string",
  "code": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/token',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/token`

Send the code received from the POST /auth/login api and get refresh token and access token (webapps)

> Body parameter

```json
{
  "clientId": "string",
  "code": "string"
}
```

<h3 id="tokenscontroller.gettoken-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AuthTokenRequest](#schemaauthtokenrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="tokenscontroller.gettoken-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Token Response|[TokenResponse](#schematokenresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="success">
This operation does not require authentication
</aside>

## TokensController.exchangeToken

<a id="opIdTokensController.exchangeToken"></a>

> Code samples

```javascript
const inputBody = '{
  "refreshToken": "string",
  "tenantId": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/token-refresh',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "refreshToken": "string",
  "tenantId": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json'
};

fetch('/auth/token-refresh',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/token-refresh`

Gets you a new access and refresh token once your access token is expired

> Body parameter

```json
{
  "refreshToken": "string",
  "tenantId": "string"
}
```

<h3 id="tokenscontroller.exchangetoken-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AuthRefreshTokenRequest](#schemaauthrefreshtokenrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="tokenscontroller.exchangetoken-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|New Token Response|[TokenResponse](#schematokenresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="success">
This operation does not require authentication
</aside>

## TokensController.switchToken

<a id="opIdTokensController.switchToken"></a>

> Code samples

```javascript
const inputBody = '{
  "refreshToken": "string",
  "tenantId": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/token-switch',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "refreshToken": "string",
  "tenantId": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/token-switch',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/token-switch`

To switch the access-token

> Body parameter

```json
{
  "refreshToken": "string",
  "tenantId": "string"
}
```

<h3 id="tokenscontroller.switchtoken-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[AuthRefreshTokenRequest](#schemaauthrefreshtokenrequest)|false|none|

> Example responses

> 200 Response

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}
```

<h3 id="tokenscontroller.switchtoken-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Switch access token with the tenant id provided.|[TokenResponse](#schematokenresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

<h1 id="authentication-service-passwordlesscontroller">PasswordlessController</h1>

## PasswordlessController.startPasswordless

<a id="opIdPasswordlessController.startPasswordless"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string",
  "key": "string"
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/passwordless/start',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string",
  "key": "string"
};
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/passwordless/start',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/passwordless/start`

Sends OTP

> Body parameter

```json
{
  "client_id": "string",
  "client_secret": "string",
  "key": "string"
}
```

<h3 id="passwordlesscontroller.startpasswordless-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[OtpSendRequest](#schemaotpsendrequest)|false|none|

> Example responses

<h3 id="passwordlesscontroller.startpasswordless-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Sends otp to user|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<h3 id="passwordlesscontroller.startpasswordless-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## PasswordlessController.verifyPasswordless

<a id="opIdPasswordlessController.verifyPasswordless"></a>

> Code samples

```javascript
const inputBody = '{
  "key": "string",
  "otp": "string"
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/passwordless/verify',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "key": "string",
  "otp": "string"
};
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/passwordless/verify',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/passwordless/verify`

Gets you the code that will be used for getting token (webapps)

> Body parameter

```json
{
  "key": "string",
  "otp": "string"
}
```

<h3 id="passwordlesscontroller.verifypasswordless-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[OtpLoginRequest](#schemaotploginrequest)|false|none|

> Example responses

<h3 id="passwordlesscontroller.verifypasswordless-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Auth Code that you can use to generate access and refresh tokens using the POST /auth/token API|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<h3 id="passwordlesscontroller.verifypasswordless-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="authentication-service-signupcontroller">SignupController</h1>

## SignupController.requestSignup

<a id="opIdSignupController.requestSignup"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string",
  "email": "string",
  "data": {}
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/signup/create-token',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string",
  "email": "string",
  "data": {}
};
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/signup/create-token',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/signup/create-token`

> Body parameter

```json
{
  "client_id": "string",
  "client_secret": "string",
  "email": "string",
  "data": {}
}
```

<h3 id="signupcontroller.requestsignup-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[SignupRequestDto](#schemasignuprequestdto)|false|none|

<h3 id="signupcontroller.requestsignup-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Success Response.|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="success">
This operation does not require authentication
</aside>

## SignupController.signupWithToken

<a id="opIdSignupController.signupWithToken"></a>

> Code samples

```javascript
const inputBody = '{
  "email": "string",
  "password": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/signup/create-user',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "email": "string",
  "password": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/signup/create-user',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/signup/create-user`

> Body parameter

```json
{
  "email": "string",
  "password": "string"
}
```

<h3 id="signupcontroller.signupwithtoken-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[LocalUserEmailPasswordProfileDto](#schemalocaluseremailpasswordprofiledto)|false|none|

> Example responses

> 200 Response

```json
{
  "email": "string",
  "password": "string"
}
```

<h3 id="signupcontroller.signupwithtoken-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Success Response.|[LocalUserEmailPasswordProfileDto](#schemalocaluseremailpasswordprofiledto)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

## SignupController.signupFast

<a id="opIdSignupController.signupFast"></a>

> Code samples

```javascript
const inputBody = '{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string"
}';
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/signup/fast',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string"
};
const headers = {
  'Content-Type':'application/json'
};

fetch('/auth/signup/fast',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /auth/signup/fast`

> Body parameter

```json
{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string"
}
```

<h3 id="signupcontroller.signupfast-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[SignupFastRequestDto](#schemasignupfastrequestdto)|false|none|

<h3 id="signupcontroller.signupfast-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Success Response.|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="success">
This operation does not require authentication
</aside>

## SignupController.verifyInviteToken

<a id="opIdSignupController.verifyInviteToken"></a>

> Code samples

```javascript

const headers = {
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/signup/verify-token',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

const headers = {
  'Authorization':'Bearer {access-token}'
};

fetch('/auth/signup/verify-token',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /auth/signup/verify-token`

<h3 id="signupcontroller.verifyinvitetoken-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Success Response.|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

<h1 id="authentication-service-logoutcontroller">LogoutController</h1>

## LogoutController.logoutRedirect

<a id="opIdLogoutController.logoutRedirect"></a>

> Code samples

```javascript

fetch('/logout/redirect',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');

fetch('/logout/redirect',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`GET /logout/redirect`

<h3 id="logoutcontroller.logoutredirect-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|state|query|string|false|none|

<h3 id="logoutcontroller.logoutredirect-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Return value of LogoutController.logoutRedirect|None|

<aside class="success">
This operation does not require authentication
</aside>

## LogoutController.logout

<a id="opIdLogoutController.logout"></a>

> Code samples

```javascript
const inputBody = '{
  "refreshToken": "string"
}';
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'string'
};

fetch('/logout',
{
  method: 'POST',
  body: inputBody,
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```javascript--nodejs
const fetch = require('node-fetch');
const inputBody = {
  "refreshToken": "string"
};
const headers = {
  'Content-Type':'application/json',
  'Accept':'application/json',
  'Authorization':'string'
};

fetch('/logout',
{
  method: 'POST',
  body: JSON.stringify(inputBody),
  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

`POST /logout`

To logout

> Body parameter

```json
{
  "refreshToken": "string"
}
```

<h3 id="logoutcontroller.logout-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|Authorization|header|string|false|This is the access token which is required to authenticate user.|
|body|body|[RefreshTokenRequestPartial](#schemarefreshtokenrequestpartial)|false|none|

> Example responses

> 200 Response

```json
{
  "success": true
}
```

<h3 id="logoutcontroller.logout-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Success Response|[SuccessResponse](#schemasuccessresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|The syntax of the request entity is incorrect.|None|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|Invalid Credentials.|None|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|The entity requested does not exist.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|The syntax of the request entity is incorrect|None|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
HTTPBearer
</aside>

# Schemas

<h2 id="tocS_TokenResponse">TokenResponse</h2>
<!-- backwards compatibility -->
<a id="schematokenresponse"></a>
<a id="schema_TokenResponse"></a>
<a id="tocStokenresponse"></a>
<a id="tocstokenresponse"></a>

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": 0,
  "expiresAt": 0,
  "pubnubToken": "string"
}

```

TokenResponse

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|accessToken|string|true|none|This property is supposed to be a string and is a required field|
|refreshToken|string|true|none|This property is supposed to be a string and is a required field|
|expiresIn|number|true|none|none|
|expiresAt|number|true|none|none|
|pubnubToken|string|false|none|none|

<h2 id="tocS_AuthTokenRequest">AuthTokenRequest</h2>
<!-- backwards compatibility -->
<a id="schemaauthtokenrequest"></a>
<a id="schema_AuthTokenRequest"></a>
<a id="tocSauthtokenrequest"></a>
<a id="tocsauthtokenrequest"></a>

```json
{
  "clientId": "string",
  "code": "string"
}

```

AuthTokenRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|clientId|string|true|none|none|
|code|string|true|none|none|

<h2 id="tocS_Function">Function</h2>
<!-- backwards compatibility -->
<a id="schemafunction"></a>
<a id="schema_Function"></a>
<a id="tocSfunction"></a>
<a id="tocsfunction"></a>

```json
null

```

### Properties

*None*

<h2 id="tocS_AuthRefreshTokenRequest">AuthRefreshTokenRequest</h2>
<!-- backwards compatibility -->
<a id="schemaauthrefreshtokenrequest"></a>
<a id="schema_AuthRefreshTokenRequest"></a>
<a id="tocSauthrefreshtokenrequest"></a>
<a id="tocsauthrefreshtokenrequest"></a>

```json
{
  "refreshToken": "string",
  "tenantId": "string"
}

```

AuthRefreshTokenRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|refreshToken|string|true|none|none|
|tenantId|string|false|none|none|

<h2 id="tocS_AuthUser">AuthUser</h2>
<!-- backwards compatibility -->
<a id="schemaauthuser"></a>
<a id="schema_AuthUser"></a>
<a id="tocSauthuser"></a>
<a id="tocsauthuser"></a>

```json
{
  "deleted": true,
  "deletedAt": "2019-08-24T14:15:22Z",
  "deletedBy": "string",
  "createdAt": "2019-08-24T14:15:22Z",
  "updatedAt": "2019-08-24T14:15:22Z",
  "createdBy": "string",
  "updatedBy": "string",
  "id": "string",
  "username": "string",
  "email": "string",
  "phone": "string",
  "name": "string",
  "designation": "string",
  "photoUrl": "string",
  "gender": "M",
  "dob": "2019-08-24T14:15:22Z",
  "defaultTenantId": "string",
  "authClientIds": [
    0
  ],
  "lastLogin": "2019-08-24T14:15:22Z",
  "permissions": [
    "string"
  ],
  "role": "string",
  "deviceInfo": {},
  "age": 0,
  "externalAuthToken": "string",
  "externalRefreshToken": "string",
  "authClientId": 0,
  "userPreferences": {},
  "tenantId": "string",
  "userTenantId": "string",
  "passwordExpiryTime": "2019-08-24T14:15:22Z",
  "status": 1
}

```

AuthUser

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|deleted|boolean|false|none|none|
|deletedAt|string(date-time)¦null|false|none|none|
|deletedBy|string¦null|false|none|none|
|createdAt|string(date-time)|false|none|none|
|updatedAt|string(date-time)|false|none|none|
|createdBy|string|false|none|none|
|updatedBy|string|false|none|none|
|id|string|false|none|none|
|username|string|true|none|none|
|email|string|false|none|none|
|phone|string|false|none|none|
|name|string|false|none|none|
|designation|string|false|none|none|
|photoUrl|string|false|none|none|
|gender|string|false|none|This field takes a single character as input in database.<br>    'M' for male and 'F' for female.|
|dob|string(date-time)|false|none|none|
|defaultTenantId|string|false|none|none|
|authClientIds|[number]|false|none|none|
|lastLogin|string(date-time)|false|none|none|
|permissions|[string]|false|none|none|
|role|string|true|none|none|
|deviceInfo|object|false|none|This property consists of two optional fields.<br>    1. userAgent<br>    2. deviceId|
|age|number|false|none|none|
|externalAuthToken|string|false|none|none|
|externalRefreshToken|string|false|none|none|
|authClientId|number|false|none|none|
|userPreferences|object|false|none|none|
|tenantId|string|false|none|none|
|userTenantId|string|false|none|none|
|passwordExpiryTime|string(date-time)|false|none|none|
|status|number|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|gender|M|
|gender|F|
|gender|O|
|status|1|
|status|2|
|status|3|
|status|0|
|status|4|

<h2 id="tocS_LoginCodeResponse">LoginCodeResponse</h2>
<!-- backwards compatibility -->
<a id="schemalogincoderesponse"></a>
<a id="schema_LoginCodeResponse"></a>
<a id="tocSlogincoderesponse"></a>
<a id="tocslogincoderesponse"></a>

```json
{
  "code": "string"
}

```

LoginCodeResponse

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|code|string|true|none|This property is supposed to be a string and is a required field|

<h2 id="tocS_LoginRequest">LoginRequest</h2>
<!-- backwards compatibility -->
<a id="schemaloginrequest"></a>
<a id="schema_LoginRequest"></a>
<a id="tocSloginrequest"></a>
<a id="tocsloginrequest"></a>

```json
{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string"
}

```

LoginRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|client_id|string|true|none|This property is supposed to be a string and is a required field|
|client_secret|string|false|none|This property is supposed to be a string and is a required field|
|username|string|true|none|This property is supposed to be a string and is a required field|
|password|string|true|none|This property is supposed to be a string and is a required field|

<h2 id="tocS_ResetPasswordPartial">ResetPasswordPartial</h2>
<!-- backwards compatibility -->
<a id="schemaresetpasswordpartial"></a>
<a id="schema_ResetPasswordPartial"></a>
<a id="tocSresetpasswordpartial"></a>
<a id="tocsresetpasswordpartial"></a>

```json
{
  "refreshToken": "string",
  "username": "string",
  "password": "string",
  "oldPassword": "string"
}

```

ResetPasswordPartial

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|refreshToken|string|false|none|none|
|username|string|false|none|This property is supposed to be a string and is a required field|
|password|string|false|none|This property is supposed to be a string and is a required field|
|oldPassword|string|false|none|This property is supposed to be a string and is a required field|

<h2 id="tocS_ResetPassword">ResetPassword</h2>
<!-- backwards compatibility -->
<a id="schemaresetpassword"></a>
<a id="schema_ResetPassword"></a>
<a id="tocSresetpassword"></a>
<a id="tocsresetpassword"></a>

```json
{
  "refreshToken": "string",
  "username": "string",
  "password": "string",
  "oldPassword": "string"
}

```

ResetPassword

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|refreshToken|string|true|none|none|
|username|string|true|none|This property is supposed to be a string and is a required field|
|password|string|true|none|This property is supposed to be a string and is a required field|
|oldPassword|string|false|none|This property is supposed to be a string and is a required field|

<h2 id="tocS_ClientAuthRequest">ClientAuthRequest</h2>
<!-- backwards compatibility -->
<a id="schemaclientauthrequest"></a>
<a id="schema_ClientAuthRequest"></a>
<a id="tocSclientauthrequest"></a>
<a id="tocsclientauthrequest"></a>

```json
{
  "client_id": "string",
  "client_secret": "string"
}

```

ClientAuthRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|client_id|string|true|none|This property is supposed to be a string and is a required field|
|client_secret|string|true|none|This property is supposed to be a string and is a required field|

<h2 id="tocS_SuccessResponse">SuccessResponse</h2>
<!-- backwards compatibility -->
<a id="schemasuccessresponse"></a>
<a id="schema_SuccessResponse"></a>
<a id="tocSsuccessresponse"></a>
<a id="tocssuccessresponse"></a>

```json
{
  "success": true
}

```

SuccessResponse

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|success|boolean|false|none|none|

<h2 id="tocS_RefreshTokenRequestPartial">RefreshTokenRequestPartial</h2>
<!-- backwards compatibility -->
<a id="schemarefreshtokenrequestpartial"></a>
<a id="schema_RefreshTokenRequestPartial"></a>
<a id="tocSrefreshtokenrequestpartial"></a>
<a id="tocsrefreshtokenrequestpartial"></a>

```json
{
  "refreshToken": "string"
}

```

RefreshTokenRequestPartial

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|refreshToken|string|false|none|none|

<h2 id="tocS_RefreshTokenRequest">RefreshTokenRequest</h2>
<!-- backwards compatibility -->
<a id="schemarefreshtokenrequest"></a>
<a id="schema_RefreshTokenRequest"></a>
<a id="tocSrefreshtokenrequest"></a>
<a id="tocsrefreshtokenrequest"></a>

```json
{
  "refreshToken": "string"
}

```

RefreshTokenRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|refreshToken|string|true|none|none|

<h2 id="tocS_OtpSendRequest">OtpSendRequest</h2>
<!-- backwards compatibility -->
<a id="schemaotpsendrequest"></a>
<a id="schema_OtpSendRequest"></a>
<a id="tocSotpsendrequest"></a>
<a id="tocsotpsendrequest"></a>

```json
{
  "client_id": "string",
  "client_secret": "string",
  "key": "string"
}

```

OtpSendRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|client_id|string|true|none|This property is supposed to be a string and is a required field|
|client_secret|string|false|none|This property is supposed to be a string and is a required field|
|key|string|true|none|This property is supposed to be a string and is a required field|

<h2 id="tocS_OtpLoginRequest">OtpLoginRequest</h2>
<!-- backwards compatibility -->
<a id="schemaotploginrequest"></a>
<a id="schema_OtpLoginRequest"></a>
<a id="tocSotploginrequest"></a>
<a id="tocsotploginrequest"></a>

```json
{
  "key": "string",
  "otp": "string"
}

```

OtpLoginRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|key|string|true|none|This property is supposed to be a string and is a required field|
|otp|string|true|none|This property is supposed to be a string and is a required field|

<h2 id="tocS_ForgetPasswordDto">ForgetPasswordDto</h2>
<!-- backwards compatibility -->
<a id="schemaforgetpassworddto"></a>
<a id="schema_ForgetPasswordDto"></a>
<a id="tocSforgetpassworddto"></a>
<a id="tocsforgetpassworddto"></a>

```json
{
  "username": "string",
  "client_id": "string",
  "client_secret": "string"
}

```

ForgetPasswordDto

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|username|string|true|none|none|
|client_id|string|true|none|none|
|client_secret|string|true|none|none|

<h2 id="tocS_AuthClient">AuthClient</h2>
<!-- backwards compatibility -->
<a id="schemaauthclient"></a>
<a id="schema_AuthClient"></a>
<a id="tocSauthclient"></a>
<a id="tocsauthclient"></a>

```json
{
  "deleted": true,
  "deletedAt": "2019-08-24T14:15:22Z",
  "deletedBy": "string",
  "createdAt": "2019-08-24T14:15:22Z",
  "updatedAt": "2019-08-24T14:15:22Z",
  "createdBy": "string",
  "updatedBy": "string",
  "id": 0,
  "name": "string",
  "description": "string",
  "clientType": "string",
  "clientId": "string",
  "clientSecret": "string",
  "redirectUrl": "string",
  "logoutRedirectUrl": "string",
  "secret": "string",
  "accessTokenExpiration": 0,
  "refreshTokenExpiration": 0,
  "authCodeExpiration": 0
}

```

AuthClient

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|deleted|boolean|false|none|none|
|deletedAt|string(date-time)¦null|false|none|none|
|deletedBy|string¦null|false|none|none|
|createdAt|string(date-time)|false|none|none|
|updatedAt|string(date-time)|false|none|none|
|createdBy|string|false|none|none|
|updatedBy|string|false|none|none|
|id|number|false|none|none|
|name|string|false|none|none|
|description|string|false|none|none|
|clientType|string|false|none|none|
|clientId|string|true|none|none|
|clientSecret|string|false|none|none|
|redirectUrl|string|false|none|none|
|logoutRedirectUrl|string|false|none|none|
|secret|string|true|none|none|
|accessTokenExpiration|number|true|none|none|
|refreshTokenExpiration|number|true|none|none|
|authCodeExpiration|number|true|none|none|

<h2 id="tocS_ResetPasswordWithClient">ResetPasswordWithClient</h2>
<!-- backwards compatibility -->
<a id="schemaresetpasswordwithclient"></a>
<a id="schema_ResetPasswordWithClient"></a>
<a id="tocSresetpasswordwithclient"></a>
<a id="tocsresetpasswordwithclient"></a>

```json
{
  "token": "string",
  "password": "string",
  "client_id": "string",
  "client_secret": "string"
}

```

ResetPasswordWithClient

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|token|string|true|none|none|
|password|string|true|none|none|
|client_id|string|true|none|none|
|client_secret|string|true|none|none|

<h2 id="tocS_SignupFastRequestDto">SignupFastRequestDto</h2>
<!-- backwards compatibility -->
<a id="schemasignupfastrequestdto"></a>
<a id="schema_SignupFastRequestDto"></a>
<a id="tocSsignupfastrequestdto"></a>
<a id="tocssignupfastrequestdto"></a>

```json
{
  "client_id": "string",
  "client_secret": "string",
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string"
}

```

SignupFastRequestDto

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|client_id|string|true|none|This property is supposed to be a string and is a required field|
|client_secret|string|false|none|This property is supposed to be a string and is a required field|
|username|string|true|none|none|
|password|string|false|none|none|
|email|string|false|none|none|
|phone|string|false|none|none|

<h2 id="tocS_SignupRequestDto">SignupRequestDto</h2>
<!-- backwards compatibility -->
<a id="schemasignuprequestdto"></a>
<a id="schema_SignupRequestDto"></a>
<a id="tocSsignuprequestdto"></a>
<a id="tocssignuprequestdto"></a>

```json
{
  "client_id": "string",
  "client_secret": "string",
  "email": "string",
  "data": {}
}

```

SignupRequestDto

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|client_id|string|true|none|This property is supposed to be a string and is a required field|
|client_secret|string|false|none|This property is supposed to be a string and is a required field|
|email|string|true|none|none|
|data|object|false|none|none|

<h2 id="tocS_LocalUserEmailPasswordProfileDto">LocalUserEmailPasswordProfileDto</h2>
<!-- backwards compatibility -->
<a id="schemalocaluseremailpasswordprofiledto"></a>
<a id="schema_LocalUserEmailPasswordProfileDto"></a>
<a id="tocSlocaluseremailpasswordprofiledto"></a>
<a id="tocslocaluseremailpasswordprofiledto"></a>

```json
{
  "email": "string",
  "password": "string"
}

```

LocalUserEmailPasswordProfileDto

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|email|string|true|none|none|
|password|string|true|none|none|

<h2 id="tocS_SignupRequest">SignupRequest</h2>
<!-- backwards compatibility -->
<a id="schemasignuprequest"></a>
<a id="schema_SignupRequest"></a>
<a id="tocSsignuprequest"></a>
<a id="tocssignuprequest"></a>

```json
{
  "email": "string",
  "expiry": "string",
  "clientId": "string"
}

```

SignupRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|email|string|true|none|none|
|expiry|string|false|none|none|
|clientId|string|false|none|none|

<h2 id="tocS_LoginActivityWithRelations">LoginActivityWithRelations</h2>
<!-- backwards compatibility -->
<a id="schemaloginactivitywithrelations"></a>
<a id="schema_LoginActivityWithRelations"></a>
<a id="tocSloginactivitywithrelations"></a>
<a id="tocsloginactivitywithrelations"></a>

```json
{
  "id": "string",
  "actor": "string",
  "tenantId": "string",
  "loginTime": "2019-08-24T14:15:22Z",
  "tokenPayload": "string",
  "loginType": "string",
  "deviceInfo": "string",
  "ipAddress": "string"
}

```

LoginActivityWithRelations

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|string|false|none|none|
|actor|string|false|none|none|
|tenantId|string|false|none|none|
|loginTime|string(date-time)|false|none|none|
|tokenPayload|string|false|none|none|
|loginType|string|false|none|none|
|deviceInfo|string|false|none|none|
|ipAddress|string|false|none|none|

<h2 id="tocS_Date">Date</h2>
<!-- backwards compatibility -->
<a id="schemadate"></a>
<a id="schema_Date"></a>
<a id="tocSdate"></a>
<a id="tocsdate"></a>

```json
null

```

### Properties

*None*

<h2 id="tocS_loopback.Count">loopback.Count</h2>
<!-- backwards compatibility -->
<a id="schemaloopback.count"></a>
<a id="schema_loopback.Count"></a>
<a id="tocSloopback.count"></a>
<a id="tocsloopback.count"></a>

```json
{
  "count": 0
}

```

loopback.Count

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|count|number|false|none|none|

<h2 id="tocS_login_activity.Filter">login_activity.Filter</h2>
<!-- backwards compatibility -->
<a id="schemalogin_activity.filter"></a>
<a id="schema_login_activity.Filter"></a>
<a id="tocSlogin_activity.filter"></a>
<a id="tocslogin_activity.filter"></a>

```json
{
  "offset": 0,
  "limit": 100,
  "skip": 0,
  "order": "string",
  "where": {},
  "fields": {
    "id": true,
    "actor": true,
    "tenantId": true,
    "loginTime": true,
    "tokenPayload": true,
    "loginType": true,
    "deviceInfo": true,
    "ipAddress": true
  }
}

```

login_activity.Filter

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|offset|integer|false|none|none|
|limit|integer|false|none|none|
|skip|integer|false|none|none|
|order|any|false|none|none|

oneOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

xor

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[string]|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|where|object|false|none|none|
|fields|any|false|none|none|

oneOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|object|false|none|none|
|»» id|boolean|false|none|none|
|»» actor|boolean|false|none|none|
|»» tenantId|boolean|false|none|none|
|»» loginTime|boolean|false|none|none|
|»» tokenPayload|boolean|false|none|none|
|»» loginType|boolean|false|none|none|
|»» deviceInfo|boolean|false|none|none|
|»» ipAddress|boolean|false|none|none|

xor

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[string]|false|none|none|

