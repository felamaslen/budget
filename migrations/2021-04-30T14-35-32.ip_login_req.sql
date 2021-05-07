--ip_login_req (up)
--Converted from original migration written on Mar 3 2018 (fd4a8c75d)

CREATE TABLE ip_login_req (
  ip text NOT NULL,
  "time" timestamp with time zone NOT NULL,
  count integer DEFAULT 0 NOT NULL
);

ALTER TABLE ip_login_req
  ADD CONSTRAINT ip_login_req_pkey PRIMARY KEY (ip);
