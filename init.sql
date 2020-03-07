create database budget;
create database budget_test;

\c budget;
create extension if not exists "uuid-ossp";

\c budget_test;
create extension if not exists "uuid-ossp";
