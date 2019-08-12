CREATE TABLE ff_profiles (
  id SERIAL PRIMARY KEY,
  email TEXT REFERENCES ff_users(email) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  life_insurance_goal TEXT,
  get_email BOOLEAN NOT NULL,
  get_call BOOLEAN NOT NULL,
  get_newsletter BOOLEAN NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);
