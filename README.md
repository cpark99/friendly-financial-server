# API Documentation:

- **Client App** <br />
  [Link](https://friendlyfinancial.netlify.com)

  [Repo](https://github.com/cpark99/friendly-financial-app)

---

- **Base URL** <br />
  _https://lit-plateau-20514.herokuapp.com/api_

- **CORS** <br />
  NO<br />

## Login

Returns authentication token and json data for a registered user

- **URL** <br />
  _/auth/login_

- **Method** <br />
  `POST`

- **Headers** <br />

  ```javascript
    {
       "content-type": "application/json"
    }
  ```

- **URL Params**

  ##### Required:

  None

- **Data Params**

  ##### Required:

  ```javascript
    {
      "email": "(string)",
      "password": "(string)"
    }
  ```

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**
    ```javascript
      {
        "authToken": "xxxxx.yyyyy.zzzzz",
        "payload": { user_id: 1}
      }
    ```

- **Error Response:**

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Missing '${key}' in request body" }`

    OR

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Incorrect email or password" }`

- **Sample Call:**

  ```javascript
  const credentials = {
    email: 'demo@test.com',
    password: 'pa$$W0rd'
  };

  fetch(`${config.API_ENDPOINT}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(credentials)
  }).then(res => (!res.ok ? res.json().then(e => Promise.reject(e)) : res.json()));
  ```

---

## Show user id

Returns json data about the authorized user for an authorized request

- **URL** <br />
  _/auth_

- **Method** <br />
  `GET`

- **Headers** <br />

  ```javascript
    {
       authorization: `bearer xxxxx.yyyyy.zzzzz`,
      "Content-Type": "application/json"
    }
  ```

- **URL Params**

  ##### Required:

  None

- **Data Params**

  ##### Required:

  None

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**
    `{"id":1}`

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Missing bearer token" }`

    OR

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Unauthorized request" }`

- **Sample Call:**
  ```javascript
  fetch(`${config.API_ENDPOINT}/auth`, {
    headers: {
      authorization: `bearer xxxxx.yyyyy.zzzzz`,
      'Content-Type': 'application/json'
    }
  }).then(res => (!res.ok ? res.json().then(e => Promise.reject(e)) : res.json()));
  ```

## Register new user

---

Returns authentication token and json data about the user for newly registered user

- **URL** <br />
  _/users_

- **Method** <br />
  `POST`

- **Headers** <br />

  ```javascript
    {
       "content-type": "application/json"
    }
  ```

- **URL Params**

  ##### Required:

  None

- **Data Params**

  ##### Required:

  ```javascript
    {
      "email": "(string)",
      "password": "(string)",
      "name": "(string)",
      "phone": "(string)",
      "life_insurance_goal": "(string)",
      "get_email": (bool),
      "get_call": (bool),
      "get_newsletter": (bool)
    }
  ```

- **Success Response:**

  - **Code:** 201 <br />
    **Content:**
    ```javascript
      {
        "id": 1,
        "name": "Jane Doe",
        "email": "MakeMeMoney@ff.com",
        "phone": "2131234567",
        "life_insurance_goal": "1800000",
        "get_email": true,
        "get_call": true,
        "get_newsletter": true,
        "date_created": "2019-09-06T16:52:33.955Z"
      }
    ```

- **Error Response:**

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Missing '${key}' in request body" }`

    OR

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Email already taken" }`

- **Sample Call:**

  ```javascript
  const user = {
    email: 'demo@test.com',
    password: 'pa$$W0rd',
    name: 'Jane Doe',
    phone: '2131234567',
    life_insurance_goal: '',
    get_email: true,
    get_call: true,
    get_newsletter: true
  };

  fetch(`${config.API_ENDPOINT}/users`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(user)
  }).then(res => (!res.ok ? res.json().then(e => Promise.reject(e)) : res.json()));
  ```

---

## Show user

Returns json data about the authorized user for an authorized request

- **URL** <br />
  _/users/:id_

- **Method** <br />
  `GET`

- **Headers** <br />

  ```javascript
    {
       authorization: `bearer xxxxx.yyyyy.zzzzz`,
      "Content-Type": "application/json"
    }
  ```

- **URL Params**

  ##### Required:

  `id=[integer]`

- **Data Params**

  ##### Required:

  None

- **Success Response:**

  - **Code:** 200 <br />
    **Content:**
    ```javascript
      {
        "id": 1,
        "name": "Jane Doe",
        "email": "MakeMeMoney@ff.com",
        "phone": "2131234567",
        "life_insurance_goal": "1800000",
        "get_email": true,
        "get_call": true,
        "get_newsletter": true,
        "date_created": "2019-09-06T16:52:33.955Z"
      }
    ```

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Missing bearer token" }`

    OR

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Unauthorized request" }`

    OR

  - **Code:** 404 NOT FOUND <br />
    **Content:** `{ error: "user doesn't exist" }`

- **Sample Call:**

  ```javascript
  const userId = 1;

  fetch(`${config.API_ENDPOINT}/users/${userId}`, {
    headers: {
      authorization: `bearer ${TokenService.getAuthToken()}`
    }
  }).then(res => (!res.ok ? res.json().then(e => Promise.reject(e)) : res.json()));
  ```

---

## Update user life insurance goal

Updates a single, authorized user's life insurance goal data

- **URL** <br />
  _/users/:id_

- **Method** <br />
  `PATCH`

- **Headers** <br />

  ```javascript
    {
       authorization: `bearer xxxxx.yyyyy.zzzzz`,
      "Content-Type": "application/json"
    }
  ```

- **URL Params**

  ##### Required:

  `id=[integer]`

- **Data Params**

  ##### Required:

  `{ "life_insurance_goal": "(string)" }`

- **Success Response:**

  - **Code:** 204 <br />
    **Content:**
    None

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Missing bearer token" }`

    OR

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Unauthorized request" }`

    OR

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Request body must contain 'life_insurance_goal'" }`

- **Sample Call:**

  ```javascript
  const userId = 1;
  const user = { life_insurance_goal: "1500000" };

  fetch(`${config.API_ENDPOINT}/users/${userId}`, {
      method: "PATCH",
      headers: {
        authorization: `bearer ${TokenService.getAuthToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    }).then(res => (!res.ok ? res.json().then(e => Promise.reject(e)) : res));
  }
  ```

---
