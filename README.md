### API Documentation:

  * Base URL
    *https://lit-plateau-20514.herokuapp.com/api*

#### Login
___
Returns authentication token and corresponding user_id for valid requests
  * **URL** <br />
    */auth/login*

  * **Method** <br />
    `POST`

  * **URL Params**
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
    * **Code:** 200 <br />
      **Content:** 
      ```javascript
      {
        "authToken": "$gdskfglkslj445tjo4t", 
        "payload": { user_id: 1} 
      }
      ```

  * **Error Response:**
    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error: "Missing '${key}' in request body" }`

      OR

    * **Code:** 400 BAD REQUEST <br />
      **Content:** `{ error: "Incorrect email or password" }`

  * **Sample Call:**
    ```javascript
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
___