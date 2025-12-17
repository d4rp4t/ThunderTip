import knex from "knex";

import dbconfig from "../config/db";

export const queryBuilder = knex(dbconfig);
export const closeDbConnections = (): Promise<void> => queryBuilder.destroy();
