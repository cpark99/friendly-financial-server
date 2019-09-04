BEGIN;

TRUNCATE
  ff_users
  RESTART IDENTITY CASCADE;

INSERT INTO ff_users (
  email,
  password,
  name,
  phone,
  get_email,
  get_call,
  get_newsletter
) VALUES
  ('MakeMeMoney@ff.com',
  '$2a$12$C7YA3Eav2k44c5bmRhOZXesNmw8fYXAaBggk78GeVTyIU6XcgM26m',
  'Jane Doe',
  '2131234567',
  true,
  true,
  true
  );

COMMIT;
