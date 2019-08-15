BEGIN;

TRUNCATE
  ff_profiles,
  ff_users
  RESTART IDENTITY CASCADE;

INSERT INTO ff_users (email, password)
VALUES
  ('demo@test.com', '$2a$12$C7YA3Eav2k44c5bmRhOZXesNmw8fYXAaBggk78GeVTyIU6XcgM26m');

INSERT INTO ff_profiles (
  name,
  email,
  phone,
  get_email,
  get_call,
  get_newsletter
) VALUES
  (
    'Jane Doe',
    'demo@test.com',
    '(888)888-8888',
    true,
    true,
    true
  );

COMMIT;
