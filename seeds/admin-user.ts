import * as Knex from 'knex';
import { generateUserPin, userPin } from './common';

exports.seed = async (knex: Knex) => {
  const { raw, hash }: userPin = await generateUserPin(process.env.DEFAULT_PIN);

  const [id] = await knex
    .insert({
      name: 'admin',
      pin_hash: hash,
    })
    .returning('uid')
    .into('users');

  console.log('Created user:', { id, pin: raw });
};
