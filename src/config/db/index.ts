import type { Knex } from "knex";

const isProduction = process.env.NODE_ENV === "production";

const config: Knex.Config = {
	client: "pg",

	connection: process.env.DATABASE_URL,

	pool: {
		min: 1,
		max: 5,
	},

	migrations: {
		tableName: "knex_migrations",
		directory: "./migrations",
	},

	debug: !isProduction,
};

export default config;
