import { run, bench } from "mitata";
import postgres from "postgres";

import {
  customerIds,
  employeeIds,
  orderIds,
  productIds,
  customerSearches,
  productSearches,
  supplierIds,
} from "./meta";

const sql = postgres(`postgres://postgres:postgres@127.0.0.1:5432/postgres`, {
  prepare: true,
});

bench("all customers", async () => {
  await sql`select * from "customers"`.values();
});
bench("customer by id", async () => {
  for await (const id of customerIds) {
    await sql`select * from "customers" where "customers"."id" = ${id}`.values();
  }
});
bench("search customer by company name", async () => {
  for await (const it of customerSearches) {
    const term = `${it}:*`;
    await sql`select * from "customers" where "customers"."company_name" ilike ${term}`.values();
  }
});

bench("all employees", async () => {
  await sql`select * from "employees"`.values();
});

bench("empoyee by id with reportee", async () => {
  for await (const id of employeeIds) {
    await sql`select "e1".*, "e2"."last_name" as "reports_lname", "e2"."first_name" as "reports_fname"
          from "employees" as "e1" left join "employees" as "e2" on "e2"."id" = "e1"."recipient_id" where "e1"."id" = ${id}`.values();
  }
});

bench("all suppliers", async () => {
  await sql`select * from "suppliers"`.values();
});

bench("supplier by id", async () => {
  for await (const id of supplierIds) {
    await sql`select * from "suppliers" where "suppliers"."id" = ${id}`.values();
  }
});

bench("all products", async () => {
  await sql`select * from "products"`.values();
});

bench("products with suppliers", async () => {
  for await (const id of productIds) {
    await sql`select "products".*, "suppliers".*
          from "products" left join "suppliers" on "products"."supplier_id" = "suppliers"."id" where "products"."id" = ${id}`.values();
  }
});
bench("search products", async () => {
  for await (const it of productSearches) {
    const term = `${it}:*`;

    await sql`select * from "products" where "products"."name" ilike ${term}`.values();
  }
});

bench("all orders with details + aggregation", async () => {
  await sql`select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
        sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
        from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" group by "o"."id" order by "o"."id" asc`.values();
});

bench("order with details + aggregation", async () => {
  for (const id of orderIds) {
    await sql`select "id", "shipped_date", "ship_name", "ship_city", "ship_country", count("product_id") as "products",
      sum("quantity") as "quantity", sum("quantity" * "unit_price") as "total_price"
      from "orders" as "o" left join "order_details" as "od" on "od"."order_id" = "o"."id" where "o"."id" = ${id} group by "o"."id" order by "o"."id" asc`.values();
  }
});

bench("order with details with product", async () => {
  for await (const id of orderIds) {
    await sql`SELECT * FROM "orders" AS o
        LEFT JOIN "order_details" AS od ON o.id = od.order_id
        LEFT JOIN "products" AS p ON od.product_id = p.id
        WHERE o.id = ${id}`.values();
  }
});

const main = async () => {
  await run();
  process.exit(1);
};

main();
