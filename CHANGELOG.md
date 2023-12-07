

# [0.15.0](https://github.com/betaly/loopx/compare/0.14.0...0.15.0) (2023-12-07)


### Features

* **authentication-service:** enhance logout functionality #main ([6c86beb](https://github.com/betaly/loopx/commit/6c86beb32cbc2d9983eee2f765d05a10da8fa33b))

# [0.14.0](https://github.com/betaly/loopx/compare/0.13.1...0.14.0) (2023-12-05)


### Features

* **authentication-service:** add urlsafer package and use it in logout controller ([d355c03](https://github.com/betaly/loopx/commit/d355c037d705360df3da4c764d5d83d5ac2ea7c2))
* **authentication-service:** reorder imports in logout.controller.ts ([a125309](https://github.com/betaly/loopx/commit/a125309ecbd8173f323dee8f7f8cb5334b17ceac))

## [0.13.1](https://github.com/betaly/loopx/compare/0.13.0...0.13.1) (2023-12-05)

# [0.13.0](https://github.com/betaly/loopx/compare/0.12.5...0.13.0) (2023-12-05)


### Features

* using pino as default logger ([3d78e6d](https://github.com/betaly/loopx/commit/3d78e6d5fa9e3a356a24263365aeeecfb0bc3fe9))

## [0.12.5](https://github.com/betaly/loopx/compare/0.12.4...0.12.5) (2023-12-02)

## [0.12.4](https://github.com/betaly/loopx/compare/0.12.3...0.12.4) (2023-11-30)

## [0.12.3](https://github.com/betaly/loopx/compare/0.12.2...0.12.3) (2023-11-23)

## [0.12.2](https://github.com/betaly/loopx/compare/0.12.1...0.12.2) (2023-10-23)

## [0.12.1](https://github.com/betaly/loopx/compare/0.12.0...0.12.1) (2023-10-12)

# [0.12.0](https://github.com/betaly/loopx/compare/0.11.4...0.12.0) (2023-10-12)


### Features

* **user-core:** generate id for auth client model (main) ([30cc5de](https://github.com/betaly/loopx/commit/30cc5de563f5fde83d76d5b1695bbe5eaaf40cdb))

## [0.11.4](https://github.com/betaly/loopx/compare/0.11.3...0.11.4) (2023-09-25)

## [0.11.3](https://github.com/betaly/loopx/compare/0.11.2...0.11.3) (2023-09-22)

## [0.11.2](https://github.com/betaly/loopx/compare/0.11.1...0.11.2) (2023-09-15)

## [0.11.1](https://github.com/betaly/loopx/compare/0.11.0...0.11.1) (2023-09-14)

# [0.11.0](https://github.com/betaly/loopx/compare/0.10.1...0.11.0) (2023-09-13)


### Bug Fixes

* an imports ([1ada32f](https://github.com/betaly/loopx/commit/1ada32ffb2a1492307f29f3896a2c48c490f6ac2))
* issues after removing firstName, middleName and lastName ([0953f93](https://github.com/betaly/loopx/commit/0953f935653b3ac8d9f6a0090d5c8dc4ce31fb7d))


### Features

* **auth.permissions:** Add tenantId to manage permission ([a5d4755](https://github.com/betaly/loopx/commit/a5d47557e52113acd85631e09735f7609978a99f))
* **authentication-service:** refactor otp and passwordless login ([c1e1583](https://github.com/betaly/loopx/commit/c1e1583951f05222b3a38b106161d0324775467a))
* **authentication:** add authorisation to login activity controller ([a4b65cc](https://github.com/betaly/loopx/commit/a4b65cc481b3776a270c9ca6f4ce6d5a42ddc641))
* extract user models, repositories and service to extension @loopx/user and using loopback4-acl for authorization ([fe4a075](https://github.com/betaly/loopx/commit/fe4a0757c63538e0f2040d9ab258e4adaa44f034))
* move default tenant id config from individual binding to MultiTenancyActionOptions ([7f2789c](https://github.com/betaly/loopx/commit/7f2789c4f942584f8b50958b6d05e6611b370331))
* rename role ``member`` to user ([fa97839](https://github.com/betaly/loopx/commit/fa97839462a09c2dc4e0500732c58186b4e0163a))
* **user-service:** add acceptance test for tenant-user controller authorisation ([c929d81](https://github.com/betaly/loopx/commit/c929d81811148d6e2f9012ee6b325f3e6b38c3cd))
* **user-service:** add role parameter to create user endpoint authorise guard ([98ecd89](https://github.com/betaly/loopx/commit/98ecd893687aa417c36f8db8f7cff39e60717c38))
* **user-service:** refactor tenant-user.controller.ts ([80925f1](https://github.com/betaly/loopx/commit/80925f123bb40af8e9349d9fb58fbeb15fd12185))
* **user-service:** use UserView as result type ([de9043e](https://github.com/betaly/loopx/commit/de9043e4b1e95b8e22e790b97f776c6af2c4f0f2))
* **user-service:** using TENANT_HEADER_NAME to replace CurrentTenant ([58ec76c](https://github.com/betaly/loopx/commit/58ec76c3744705117136932af44fd881eff8f717))

## [0.10.1](https://github.com/betaly/loopx/compare/0.10.0...0.10.1) (2023-08-24)

# [0.10.0](https://github.com/betaly/loopx/compare/0.9.6...0.10.0) (2023-08-24)


### Features

* **auth:** improve autha-verify provider logic (main) ([60c0bde](https://github.com/betaly/loopx/commit/60c0bde7150d86e7c13013979b7bc94912f473ca))

## [0.9.6](https://github.com/betaly/loopx/compare/0.9.5...0.9.6) (2023-08-23)


### Bug Fixes

* **authentication-service:** tenant resolver to return undefined if we can not find by id ([9af5170](https://github.com/betaly/loopx/commit/9af5170686d2f62e83375dc97e2bb4aff9444a96))

## [0.9.5](https://github.com/betaly/loopx/compare/0.9.4...0.9.5) (2023-08-23)

## [0.9.4](https://github.com/betaly/loopx/compare/0.9.3...0.9.4) (2023-08-22)

## [0.9.3](https://github.com/betaly/loopx/compare/0.9.2...0.9.3) (2023-08-22)

## [0.9.2](https://github.com/betaly/loopx/compare/0.9.1...0.9.2) (2023-08-21)

## [0.9.1](https://github.com/betaly/loopx/compare/0.9.0...0.9.1) (2023-08-20)

# [0.9.0](https://github.com/betaly/loopx/compare/0.8.1...0.9.0) (2023-08-20)


### Features

* **user-service:** add logoutRedirectUrl property ([11a9103](https://github.com/betaly/loopx/commit/11a9103c1f63fe3ce1f0c27d09b2ee0b17520a91))

## [0.8.1](https://github.com/betaly/loopx/compare/0.8.0...0.8.1) (2023-08-20)

# [0.8.0](https://github.com/betaly/loopx/compare/0.7.0...0.8.0) (2023-08-20)


### Features

* **auth:** update default role and tenant bindings (main) ([0b2ad99](https://github.com/betaly/loopx/commit/0b2ad998d980e53e1db8ff700e4d3f08863a76f2))

# [0.7.0](https://github.com/betaly/loopx/compare/0.6.0...0.7.0) (2023-08-19)


### Features

* **auth:** add default tenant and role providers (main) ([c251692](https://github.com/betaly/loopx/commit/c2516929a5f87abbdd663ae4d763343478ca2e41))
* **core:** add defaultTenantKey to coreOptions (main) ([f967a86](https://github.com/betaly/loopx/commit/f967a86445ba2f7a525201c373652859d12dd9d3))
* **core:** update roles enum (loopx/main) ([93195b7](https://github.com/betaly/loopx/commit/93195b7e1b0f464c57f5fb9afb88752f9dab6b2a))
* **user-service:** add AuthClientController ([44ccb82](https://github.com/betaly/loopx/commit/44ccb822cd6da54b5dc07cb1374da91d5e0d88d5))

# [0.6.0](https://github.com/betaly/loopx/compare/0.5.3...0.6.0) (2023-08-19)


### Features

* **authentication-service:** make getCurrentUser argument as optional ([2f45876](https://github.com/betaly/loopx/commit/2f45876c13d25fbb5c97cb3e7b0535d0635d518e))
* **user-service:** make getCurrentUser argument as optional ([67de31a](https://github.com/betaly/loopx/commit/67de31a1ac11e1d53260fc7a169fee81a4644733))

## [0.5.3](https://github.com/betaly/loopx/compare/0.5.2...0.5.3) (2023-08-19)

## [0.5.2](https://github.com/betaly/loopx/compare/0.5.1...0.5.2) (2023-08-19)

## [0.5.1](https://github.com/betaly/loopx/compare/0.5.0...0.5.1) (2023-08-19)

# [0.5.0](https://github.com/betaly/loopx/compare/0.4.0...0.5.0) (2023-08-19)


### Features

* **auth:** rename endpoint from /auth/switch-token to /auth/token-switch ([0f7dfe7](https://github.com/betaly/loopx/commit/0f7dfe7b2c2933676a52a10aabf6d2a5a42aebf5))

# [0.4.0](https://github.com/betaly/loopx/compare/0.3.0...0.4.0) (2023-08-13)


### Bug Fixes

* **core:**  RateLimitSecurityBindings.RATELIMIT_SECURITY_ACTION -> RateLimitSecurityBindings.ACTION ([d1e901b](https://github.com/betaly/loopx/commit/d1e901b9e90d3e3c0ecc8d51887cb85ac4817327))


### Features

* **auth-example:** initial commit ([864cdf5](https://github.com/betaly/loopx/commit/864cdf548be3ab9a5c511d3038531dc923a2f421))

# [0.3.0](https://gitr.net/betaly/loopx/compare/0.2.0...0.3.0) (2023-08-09)


### Features

* **core:** add publishConfig to package.json ([f9dc7da](https://gitr.net/betaly/loopx/commits/f9dc7dadbb401216bacce2d0164266dd128535e2))

# [0.2.0](https://gitr.net/betaly/loopx/compare/0.1.0...0.2.0) (2023-08-09)


### Bug Fixes

* **auth:** update header key from 'Auth-Client' to 'LoopAuth-Client' (#main) ([c6fb4c4](https://gitr.net/betaly/loopx/commits/c6fb4c436d4901c0ebbbcbdfb6376d6a7ed6b379))
* **multi-tenancy:** action binding key ([830c029](https://gitr.net/betaly/loopx/commits/830c0297292d18bf70bf3fb2b099055b9ddcf5b3))


### Features

* **authentication-service:** add MultiTenancy component (main) ([faed3b2](https://gitr.net/betaly/loopx/commits/faed3b22f28f8a9a0ea59a385ca47ba0685647cd))
* **authentication-service:** refactor sequence.ts ([f6a6f0d](https://gitr.net/betaly/loopx/commits/f6a6f0d993255edc8a5984cd01ce95c776ddae7c))
* extract clients to [@loopauth](https://gitr.net/loopauth) scope ([b619a85](https://gitr.net/betaly/loopx/commits/b619a85551e36afb63a2fa023069e8aff3a38bec))
* **multi-tenancy:** initial implementing ([d7f47f1](https://gitr.net/betaly/loopx/commits/d7f47f11a1fdc6466ad47c7dbef0f5f67b9d3ecc))
* refactor ([51b0140](https://gitr.net/betaly/loopx/commits/51b0140944986ba05321427834bf8027b3c90420))
* **user-service:** change tenant user api from /tenant/{id}/users to /users with multi-tenancy component ([01fee7a](https://gitr.net/betaly/loopx/commits/01fee7afc1f5c4d50192fe791f8619e498b198dd))

# 0.1.0 (2023-08-06)


### Features

* initial commit ([3421c48](https://gitr.net/betaly/loopx/commits/3421c48046c094d0f6e1e68a2fbf35b5facd6736))
