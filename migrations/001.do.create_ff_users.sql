CREATE TABLE ff_users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  life_insurance_goal TEXT DEFAULT '(unset)',
  get_email BOOLEAN NOT NULL,
  get_call BOOLEAN NOT NULL,
  get_newsletter BOOLEAN NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT now()
);