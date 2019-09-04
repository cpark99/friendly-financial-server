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

CREATE OR REPLACE FUNCTION f_ff_users_id_seq(OUT nextfree bigint) AS
$func$
BEGIN
LOOP
   SELECT INTO nextfree  val
   FROM   nextval('ff_users_id_seq'::regclass) val  -- use actual name of sequence
   WHERE  NOT EXISTS (SELECT 1 FROM ff_users WHERE id = val);

   EXIT WHEN FOUND;
END LOOP; 
END
$func$  LANGUAGE plpgsql;

ALTER TABLE ff_users ALTER id SET DEFAULT f_ff_users_id_seq();