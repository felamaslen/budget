--users (up)
--Converted from original migration written on Mar 3 2018 (fd4a8c75d)

CREATE TABLE users (
  name text NOT NULL,
  pin_hash text NOT NULL,
  uid integer NOT NULL,
  config json
);

ALTER TABLE users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);
ALTER TABLE users
  ADD CONSTRAINT users_pin_hash_unique UNIQUE (pin_hash);

CREATE SEQUENCE users_uid_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE users_uid_seq OWNED BY users.uid;
ALTER TABLE users ALTER COLUMN uid SET DEFAULT nextval('users_uid_seq'::regclass);
