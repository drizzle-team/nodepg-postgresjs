import { run, bench } from "mitata";
import { Pool } from "pg";

import {
  customerIds,
  employeeIds,
  orderIds,
  productIds,
  customerSearches,
  productSearches,
  supplierIds,
} from "./meta";

const pg = new Pool({
  connectionString: `postgres://postgres:postgres@127.0.0.1:5433/postgres`,
});

const q1 = { name: "q1", text: 'select * from "customers"', rowMode: "array" };
bench("all customers", async () => {
  await pg.query(q1);
});

const q2 = {
  name: "q2",
  text: 'select * from "customers" where "customers"."id" = $1',
  rowMode: "array",
};
bench("customer by id", async () => {
  for await (const id of customerIds) {
    await pg.query(q2, [id]);
  }
});

const q3 = {
  name: "q3",
  text: 'select * from "customers" where "customers"."company_name" ilike $1',
  rowMode: "array",
};
bench("search customer by company name", async () => {
  for await (const it of customerSearches) {
    await pg.query(q3, [`${it}:*`]);
  }
});

const q4 = {
  name: "q4",
  text: 'select * from "employees"',
  rowMode: "array",
};
bench("all employees", async () => {
  await pg.query(q4);
});

const q5 = {
  name: "q5",
  text: `select "e1".*, "e2"."last_name" as "reports_lname", "e2"."first_name" as "reports_fname"
  from "employees" as "e1" left join "employees" as "e2" on "e2"."id" = "e1"."recipient_id" where "e1"."id" = $1`,
  rowMode: "array",
};
bench("empoyee by id with reportee", async () => {
  for await (const id of employeeIds) {
    await pg.query(q5, [id]);
  }
});

const q6 = {
  name: "q6",
  text: 'select * from "suppliers"',
  rowMode: "array",
};
bench("all suppliers", async () => {
  await pg.query(q6);
});

const q7 = {
  name: "q7",
  text: 'select * from "suppliers" where "suppliers"."id" = $1',
  rowMode: "array",
};
bench("supplier by id", async () => {
  for await (const id of supplierIds) {
    await pg.query(q7, [id]);
  }
});

const q8 = {
  name: "q8",
  text: 'select * from "products"',
  rowMode: "array",
};
bench("all products", async () => {
  await pg.query(q8);
});

const q9 = {
  name: "q9",
  text: `select "products".*, "suppliers".*
  from "products" left join "suppliers" on "products"."supplier_id" = "suppliers"."id" where "products"."id" = $1`,
  rowMode: "array",
};
bench("products with suppliers", async () => {
  for await (const id of productIds) {
    await pg.query(q9, [id]);
  }
});

const q10 = {
  name: "q10",
  text: 'select * from "products" where "products"."name" ilike $1',
  rowMode: "array",
};
bench("search products", async () => {
  for await (const it of productSearches) {
    await pg.query(q10, [`${it}:*`]);
  }
});

const q11 = {
  name: "q11",
  text: `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
  sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
  from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id" order by "o"."id" asc`,
  rowMode: "array",
};
bench("all orders with details + aggregation", async () => {
  await pg.query(q11);
});

const q12 = {
  name: "q12",
  text: `select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
  sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
  from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" where "o"."id" = $1 group by "o"."id" order by "o"."id" asc`,
  rowMode: "array",
};
bench("order with details + aggregation", async () => {
  for (const id of orderIds) {
    await pg.query(q12, [id]);
  }
});

const q13 = {
  name: "q13",
  text: `SELECT * FROM "orders" AS o
  LEFT JOIN "order_details" AS od ON o.id = od.order_id
  LEFT JOIN "products" AS p ON od.product_id = p.id
  WHERE o.id = $1`,
  rowMode: "array",
};
bench("order with details with product", async () => {
  for await (const id of orderIds) {
    await pg.query(q13, [id]);
  }
});

const main = async () => {
  await run();
  process.exit(0);
};

main();
