### API Documentation:

- Base URL <br />
  _https://lit-plateau-20514.herokuapp.com/api_

#### Login

---

Returns authentication token and corresponding user_id for valid requests

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
  `email=[string]` <br />
  `password=[string]`

* **Data Params**

  ```javascript
  {
    "email": "email",
    "password": "password"
  }
  ```

* **Success Response:**

  - **Code:** 200 <br />
    **Content:**
    ```javascript
    {
      "authToken": "xxxxx.yyyyy.zzzzz",
      "payload": { user_id: 1}
    }
    ```

* **Error Response:**

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Missing '${key}' in request body" }`

    OR

  - **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: "Incorrect email or password" }`

* **Sample Call:**

  ```javascript
  const credentials = {
    email: "demo@test.com",
    password: "pa$$W0rd"
  };

  fetch(`${config.API_ENDPOINT}/auth/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(credentials)
  }).then(res =>
    !res.ok ? res.json().then(e => Promise.reject(e)) : res.json()
  );
  ```

---

#### Show user id

---

Returns corresponding user_id for authorized requests

- **URL** <br />
  _/auth/_

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

* **Data Params**
  None

* **Success Response:**

  - **Code:** 200 <br />
    **Content:**
    `{"id":1}`

* **Error Response:**

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Missing bearer token" }`

    OR

  - **Code:** 401 UNAUTHORIZED <br />
    **Content:** `{ error: "Unauthorized request" }`

* **Sample Call:**
  ```javascript
    fetch(`${config.API_ENDPOINT}/auth`, {
      headers: {
        authorization: `bearer xxxxx.yyyyy.zzzzz`,
        "Content-Type": "application/json"
      }
    }).then(res =>
      !res.ok ? res.json().then(e => Promise.reject(e)) : res.json()
    );
  ```

---
